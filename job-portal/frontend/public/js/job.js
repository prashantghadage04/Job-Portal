// Job details page: show one job and let a seeker apply.

const jobId = new URLSearchParams(window.location.search).get("id");
const jobBox = document.getElementById("job");
const user = getUser();

function applyArea() {
  if (!user) {
    return '<p>Please <a href="login.html">login</a> or <a href="register.html">register</a> as a job seeker to apply.</p>';
  }
  if (user.role === "SEEKER") {
    return '<button id="applyBtn" onclick="applyNow()">Apply now</button>';
  }
  return '<p class="meta">You are logged in as a recruiter. Only job seekers can apply.</p>';
}

async function loadJob() {
  if (!jobId) {
    showMessage("message", "No job selected.", "error");
    return;
  }
  try {
    const j = await api("/jobs/" + encodeURIComponent(jobId));
    document.title = j.title + " - JobPortal";
    jobBox.innerHTML = `
      <div class="card">
        <h1>${esc(j.title)}</h1>
        <div class="meta">${esc(j.company)} &bull; ${esc(j.location)} &bull; Posted ${formatDate(j.createdAt)}</div>
        <p><span class="tag">${esc(j.jobType)}</span> ${j.salary ? '<span class="tag">' + esc(j.salary) + "</span>" : ""}</p>
        <h2>About the job</h2>
        <p class="description">${esc(j.description)}</p>
        ${applyArea()}
      </div>`;
  } catch (err) {
    showMessage("message", err.message, "error");
  }
}

async function applyNow() {
  const btn = document.getElementById("applyBtn");
  btn.disabled = true;
  clearMessage("message");
  try {
    await api("/jobs/" + encodeURIComponent(jobId) + "/apply", { method: "POST" });
    showMessage("message", "Application submitted! Track it in your dashboard.", "success");
    btn.textContent = "Applied";
  } catch (err) {
    showMessage("message", err.message, "error");
    btn.disabled = false;
  }
}

loadJob();
