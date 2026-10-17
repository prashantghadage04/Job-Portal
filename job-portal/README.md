# Job Portal

A simple job portal where **recruiters** post jobs and **job seekers** search and apply.

**Stack:** HTML + CSS + JavaScript (frontend) · Spring Boot 3 + Java 17 (backend) · MySQL 8 · Docker

## Features

- Register / login with JWT authentication and two roles: `SEEKER` and `RECRUITER`
- Anyone can browse and search jobs (keyword, location, job type)
- Seekers: apply to jobs (one application per job), track application status
- Recruiters: post and delete jobs, view applicants, change status (Applied, Shortlisted, Rejected, Hired)
- Passwords stored as BCrypt hashes; role checks enforced on the backend

## Run it

You only need Docker Desktop installed.

```bash
cd job-portal
docker compose up --build
```

The first build takes a few minutes (Maven downloads dependencies). When you see `Started JobPortalApplication` in the logs:

- App: http://localhost:3000
- API (direct): http://localhost:8080/api/jobs

Stop with `Ctrl+C`, then `docker compose down`. Your data is kept in a Docker volume; to wipe it use `docker compose down -v`.

## Try it

1. Open http://localhost:3000 and register as a **Recruiter**, then post a job.
2. Logout, register as a **Job seeker**, search the job and apply.
3. Login as the recruiter again, open the dashboard, click **View applicants**, and change the status.
4. Login as the seeker to see the updated status.

## Project structure

```
job-portal/
├── docker-compose.yml          # runs MySQL + backend + frontend together
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/jobportal/
│       ├── model/              # User, Job, Application (database tables)
│       ├── repository/         # database queries (Spring Data JPA)
│       ├── controller/         # REST API endpoints
│       ├── security/           # JWT + Spring Security config
│       └── dto/                # request/response shapes
└── frontend/
    ├── Dockerfile
    ├── nginx.conf              # serves the pages and forwards /api to the backend
    └── public/                 # HTML, CSS and JS files
```

## API endpoints

| Method | URL | Who | What |
|--------|-----|-----|------|
| POST | `/api/auth/register` | public | create account |
| POST | `/api/auth/login` | public | login, returns JWT |
| GET | `/api/jobs?keyword=&location=&type=` | public | search jobs |
| GET | `/api/jobs/{id}` | public | job details |
| POST | `/api/jobs` | recruiter | post a job |
| DELETE | `/api/jobs/{id}` | recruiter (owner) | delete a job |
| GET | `/api/recruiter/jobs` | recruiter | my posted jobs |
| GET | `/api/recruiter/jobs/{id}/applications` | recruiter (owner) | applicants for a job |
| PUT | `/api/applications/{id}/status` | recruiter (owner) | change application status |
| POST | `/api/jobs/{id}/apply` | seeker | apply to a job |
| GET | `/api/seeker/applications` | seeker | my applications |

Protected endpoints need the header `Authorization: Bearer <token>`.

## Run without Docker (optional)

1. Start a local MySQL and create a database `jobportal` plus user `jobuser` / `jobpass` (or edit `backend/src/main/resources/application.properties`).
2. `cd backend && mvn spring-boot:run`
3. The frontend calls `/api`, so serve it through something that forwards `/api` to port 8080 (the nginx container does this). The simplest way is to keep using Docker for the frontend.

## Ideas to extend it (good for your resume)

- Pagination on the job list
- Resume upload (PDF) with file type and size validation
- Email notification when the status changes (`@Async` or RabbitMQ)
- Redis caching for popular searches
- Unit tests with JUnit and Mockito, plus GitHub Actions CI

## Before deploying publicly

Change `JWT_SECRET` and the database passwords in `docker-compose.yml`, and move them into a `.env` file that is not committed.
