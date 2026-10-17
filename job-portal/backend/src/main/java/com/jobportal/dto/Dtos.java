package com.jobportal.dto;

import com.jobportal.model.Application;
import com.jobportal.model.ApplicationStatus;
import com.jobportal.model.Job;
import com.jobportal.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/** All request/response shapes in one place so they are easy to find. */
public class Dtos {

    // ---------- Auth ----------
    public record RegisterRequest(
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Email is required") @Email(message = "Email is not valid") String email,
            @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters") String password,
            @NotNull(message = "Role is required") Role role) {
    }

    public record LoginRequest(
            @NotBlank(message = "Email is required") String email,
            @NotBlank(message = "Password is required") String password) {
    }

    public record AuthResponse(String token, String name, String email, Role role) {
    }

    // ---------- Jobs ----------
    public record JobRequest(
            @NotBlank(message = "Title is required") String title,
            @NotBlank(message = "Company is required") String company,
            @NotBlank(message = "Location is required") String location,
            @NotBlank(message = "Job type is required") String jobType,
            String salary,
            @NotBlank(message = "Description is required") String description) {
    }

    public record JobResponse(Long id, String title, String company, String location,
                              String jobType, String salary, String description,
                              LocalDateTime createdAt) {
        public static JobResponse from(Job j) {
            return new JobResponse(j.getId(), j.getTitle(), j.getCompany(), j.getLocation(),
                    j.getJobType(), j.getSalary(), j.getDescription(), j.getCreatedAt());
        }
    }

    // ---------- Applications ----------
    public record StatusRequest(@NotNull(message = "Status is required") ApplicationStatus status) {
    }

    public record ApplicationResponse(Long id, Long jobId, String jobTitle, String company,
                                      String seekerName, String seekerEmail,
                                      ApplicationStatus status, LocalDateTime appliedAt) {
        public static ApplicationResponse from(Application a) {
            return new ApplicationResponse(a.getId(), a.getJob().getId(), a.getJob().getTitle(),
                    a.getJob().getCompany(), a.getSeeker().getName(), a.getSeeker().getEmail(),
                    a.getStatus(), a.getAppliedAt());
        }
    }
}
