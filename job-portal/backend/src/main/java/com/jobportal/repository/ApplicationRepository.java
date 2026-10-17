package com.jobportal.repository;

import com.jobportal.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByJobIdAndSeekerId(Long jobId, Long seekerId);

    List<Application> findBySeekerIdOrderByAppliedAtDesc(Long seekerId);

    List<Application> findByJobIdOrderByAppliedAtDesc(Long jobId);

    void deleteByJobId(Long jobId);
}
