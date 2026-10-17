package com.jobportal.controller;

import com.jobportal.dto.Dtos.JobRequest;
import com.jobportal.dto.Dtos.JobResponse;
import com.jobportal.model.Job;
import com.jobportal.model.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class JobController {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CurrentUser currentUser;

    public JobController(JobRepository jobRepository, ApplicationRepository applicationRepository,
                         CurrentUser currentUser) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.currentUser = currentUser;
    }

    // ----- Public -----

    @GetMapping("/jobs")
    public List<JobResponse> search(@RequestParam(defaultValue = "") String keyword,
                                    @RequestParam(defaultValue = "") String location,
                                    @RequestParam(defaultValue = "") String type) {
        return jobRepository.search(keyword.trim(), location.trim(), type.trim())
                .stream().map(JobResponse::from).toList();
    }

    @GetMapping("/jobs/{id}")
    public JobResponse getJob(@PathVariable Long id) {
        return JobResponse.from(findJob(id));
    }

    // ----- Recruiter -----

    @PostMapping("/jobs")
    public JobResponse createJob(@Valid @RequestBody JobRequest req, Authentication auth) {
        User recruiter = currentUser.get(auth);
        Job job = new Job();
        job.setTitle(req.title().trim());
        job.setCompany(req.company().trim());
        job.setLocation(req.location().trim());
        job.setJobType(req.jobType().trim());
        job.setSalary(req.salary() == null ? null : req.salary().trim());
        job.setDescription(req.description().trim());
        job.setPostedBy(recruiter);
        return JobResponse.from(jobRepository.save(job));
    }

    @GetMapping("/recruiter/jobs")
    public List<JobResponse> myJobs(Authentication auth) {
        User recruiter = currentUser.get(auth);
        return jobRepository.findByPostedByIdOrderByCreatedAtDesc(recruiter.getId())
                .stream().map(JobResponse::from).toList();
    }

    @DeleteMapping("/jobs/{id}")
    @Transactional
    public void deleteJob(@PathVariable Long id, Authentication auth) {
        User recruiter = currentUser.get(auth);
        Job job = findJob(id);
        if (!job.getPostedBy().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own jobs");
        }
        applicationRepository.deleteByJobId(id); // remove applications first (foreign key)
        jobRepository.delete(job);
    }

    private Job findJob(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
    }
}
