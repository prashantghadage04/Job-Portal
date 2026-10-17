// Dashboard: job seekers see their applications, recruiters manage jobs and applicants.

const user = getUser();
if (!user) {
  window.location.href = "login.html";
}

const content = document.getElementById("content");
const STATUSES = ["APPLIED", "SHORTLISTED", "REJECTED", "HIRED"];
let myJobs = []; // recruiter's jobs, kept so we can look up titles

// =====================================================
// Job seeker
// =====================================================
async function seekerView() {
  content.innerHTML = "<h1>My applications</h1><div id='apps'></div>";
  try {
    const apps = await api("/seeker/applications");
    const box = document.getElementById("apps");
    if (apps.length === 0) {
      box.innerHTML = '<p class="empty">You have not applied to any jobs yet. <a href="index.html">Browse jobs</a></p>';
      return;
    }
    box.innerHTML =
      "<table><tr><th>Job</th><th>Company</th><th>Applied on</th><th>Status</th></tr>" +
      apps
        .map(
          (a) => `<tr>
            <td><a href="job.html?id=${a.jobId}">${esc(a.jobTitle)}</a></td>
            <td>${esc(a.company)}</td>
            <td>${formatDate(a.appliedAt)}</td>
            <td><span class="badge ${esc(a.status)}">${esc(a.status)}</span></td>
          </tr>`
        )
        .join("") +
      "</table>";
  } catch (err) {
    showMessage("message", err.message, "error");
  }
}

// =====================================================
// Recruiter
// =====================================================
function recruiterView() {
  content.innerHTML = `
    <h1>Recruiter dashboard</h1>

    <div class="card">
      <h3>Post a new job</h3>
      <div id="postMsg" class="msg"></div>
      <form id="jobForm">
        <div class="grid-2">
          <div><label>Job title</label><input id="title" required></div>
          <div><label>Company</label><input id="company" required></div>
          <div><label>Location</label><input id="location" required></div>
          <div>
            <label>Job type</label>
            <select id="jobType">
              <option>Full-time</option><option>Part-time</option><option>Internship</option>
              <option>Remote</option><option>Contract</option>
            </select>
          </div>
        </div>
        <label>Salary (optional)</label>
        <input id="salary" placeholder="e.g. 6-8 LPA">
        <label>Description</label>
        <textarea id="description" required></textarea>
        <br><br>
        <button type="submit">Post job</button>
      </form>
    </div>

    <h2>My jobs</h2>
    <div id="myJobs"></div>

    <div id="applicants"></div>
  `;

  document.getElementById("jobForm").addEventListener("submit", postJob);
  loadMyJobs();
}

async function postJob(e) {
  e.preventDefault();
  clearMessage("postMsg");
  try {
    await api("/jobs", {
      method: "POST",
      body: {
        title: document.getElementById("title").value,
        company: document.getElementById("company").value,
        location: document.getElementById("location").value,
        jobType: document.getElementById("jobType").value,
        salary: document.getElementById("salary").value,
        description: document.getElementById("description").value,
      },
    });
    document.getElementById("jobForm").reset();
    showMessage("postMsg", "Job posted successfully!", "success");
    loadMyJobs();
  } catch (err) {
    showMessage("postMsg", err.message, "error");
  }
}

async function loadMyJobs() {
  const box = document.getElementById("myJobs");
  try {
    myJobs = await api("/recruiter/jobs");
    if (myJobs.length === 0) {
      box.innerHTML = '<p class="empty">You have not posted any jobs yet.</p>';
      return;
    }
    box.innerHTML = myJobs
      .map(
        (j) => `
        <div class="card">
          <div class="row">
            <div>
              <h3>${esc(j.title)}</h3>
              <div class="meta">${esc(j.company)} &bull; ${esc(j.location)} &bull; ${esc(j.jobType)} &bull; Posted ${formatDate(j.createdAt)}</div>
            </div>
            <div>
              <button class="small" onclick="showApplicants(${j.id})">View applicants</button>
              <button class="small danger" onclick="deleteJob(${j.id})">Delete</button>
            </div>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    showMessage("message", err.message, "error");
  }
}

async function deleteJob(id) {
  if (!confirm("Delete this job and all its applications?")) return;
  try {
    await api("/jobs/" + id, { method: "DELETE" });
    document.getElementById("applicants").innerHTML = "";
    loadMyJobs();
  } catch (err) {
    showMessage("message", err.message, "error");
  }
}

async function showApplicants(jobId) {
  const box = document.getElementById("applicants");
  const job = myJobs.find((j) => j.id === jobId);
  box.innerHTML = "<p class='empty'>Loading applicants...</p>";
  try {
    const apps = await api("/recruiter/jobs/" + jobId + "/applications");
    let html = "<h2>Applicants for " + esc(job ? job.title : "job") + "</h2>";
    if (apps.length === 0) {
      html += '<p class="empty">No applications yet.</p>';
    } else {
      html +=
        "<table><tr><th>Name</th><th>Email</th><th>Applied on</th><th>Status</th><th></th></tr>" +
        apps
          .map(
            (a) => `<tr>
              <td>${esc(a.seekerName)}</td>
              <td>${esc(a.seekerEmail)}</td>
              <td>${formatDate(a.appliedAt)}</td>
              <td>
                <select id="status-${a.id}">
                  ${STATUSES.map((s) => `<option ${s === a.status ? "selected" : ""}>${s}</option>`).join("")}
                </select>
              </td>
              <td><button class="small" onclick="updateStatus(${a.id}, ${jobId})">Save</button></td>
            </tr>`
          )
          .join("") +
        "</table>";
    }
    box.innerHTML = html;
  } catch (err) {
    box.innerHTML = "";
    showMessage("message", err.message, "error");
  }
}

async function updateStatus(appId, jobId) {
  clearMessage("message");
  try {
    const status = document.getElementById("status-" + appId).value;
    await api("/applications/" + appId + "/status", { method: "PUT", body: { status: status } });
    showMessage("message", "Status updated to " + status, "success");
  } catch (err) {
    showMessage("message", err.message, "error");
  }
}

// =====================================================
// Start
// =====================================================
if (user) {
  if (user.role === "RECRUITER") {
    recruiterView();
  } else {
    seekerView();
  }
}
