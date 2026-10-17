// Home page: search and list jobs.

const jobsBox = document.getElementById("jobs");

async function loadJobs() {
  clearMessage("error");
  jobsBox.innerHTML = '<p class="empty">Loading...</p>';

  const params = new URLSearchParams({
    keyword: document.getElementById("keyword").value,
    location: document.getElementById("location").value,
    type: document.getElementById("type").value,
  });

  try {
    const jobs = await api("/jobs?" + params.toString());
    if (jobs.length === 0) {
      jobsBox.innerHTML = '<p class="empty">No jobs found. Try a different search.</p>';
      return;
    }
    jobsBox.innerHTML = jobs
      .map(
        (j) => `
        <div class="card">
          <div class="row">
            <div>
              <h3><a href="job.html?id=${j.id}">${esc(j.title)}</a></h3>
              <div class="meta">${esc(j.company)} &bull; ${esc(j.location)} &bull; Posted ${formatDate(j.createdAt)}</div>
              <span class="tag">${esc(j.jobType)}</span>
              ${j.salary ? '<span class="tag">' + esc(j.salary) + "</span>" : ""}
            </div>
            <a class="btn small" href="job.html?id=${j.id}">View</a>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    jobsBox.innerHTML = "";
    showMessage("error", err.message, "error");
  }
}

document.getElementById("searchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  loadJobs();
});

loadJobs();
