package com.jobportal.controller;

import com.jobportal.dto.Dtos.ApplicationResponse;
import com.jobportal.dto.Dtos.StatusRequest;
import com.jobportal.model.Application;
import com.jobportal.model.Job;
import com.jobportal.model.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CurrentUser currentUser;

    public ApplicationController(ApplicationRepository applicationRepository, JobRepository jobRepository,
                                 CurrentUser currentUser) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.currentUser = currentUser;
    }

    // ----- Seeker -----

    @PostMapping("/jobs/{jobId}/apply")
    public ApplicationResponse apply(@PathVariable Long jobId, Authentication auth) {
        User seeker = currentUser.get(auth);
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
        if (applicationRepository.existsByJobIdAndSeekerId(jobId, seeker.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied to this job");
        }
        Application application = new Application();
        application.setJob(job);
        application.setSeeker(seeker);
        return ApplicationResponse.from(applicationRepository.save(application));
    }

    @GetMapping("/seeker/applications")
    public List<ApplicationResponse> myApplications(Authentication auth) {
        User seeker = currentUser.get(auth);
        return applicationRepository.findBySeekerIdOrderByAppliedAtDesc(seeker.getId())
                .stream().map(ApplicationResponse::from).toList();
    }

    // ----- Recruiter -----

    @GetMapping("/recruiter/jobs/{jobId}/applications")
    public List<ApplicationResponse> applicantsForJob(@PathVariable Long jobId, Authentication auth) {
        User recruiter = currentUser.get(auth);
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
        if (!job.getPostedBy().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This is not your job posting");
        }
        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId)
                .stream().map(ApplicationResponse::from).toList();
    }

    @PutMapping("/applications/{id}/status")
    public ApplicationResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest req,
                                            Authentication auth) {
        User recruiter = currentUser.get(auth);
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        if (!application.getJob().getPostedBy().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This is not your job posting");
        }
        application.setStatus(req.status());
        return ApplicationResponse.from(applicationRepository.save(application));
    }
}
