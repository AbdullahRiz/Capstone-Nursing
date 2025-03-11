package com.nursingapp.system.services

import com.nursingapp.system.models.Applicant
import com.nursingapp.system.models.JobApplication
import com.nursingapp.system.models.VisibilityStatus
import com.nursingapp.system.repositories.JobApplicationRepository

import org.springframework.stereotype.Service
import java.time.Instant

@Service
class JobApplicationService (private val jobApplicationRepository: JobApplicationRepository) {
    fun create(jobApplication: JobApplication): JobApplication {
        require(jobApplication.hospitalId.isNotBlank()) { "Hospital ID must not be blank" }
        require(jobApplication.jobTitle.isNotBlank()) { "Job title must not be blank" }
        require(jobApplication.description.isNotBlank()) { "Description must not be blank" }

        return jobApplicationRepository.save(jobApplication)
    }
    fun getById(id: String): JobApplication? = jobApplicationRepository.findById(id).orElse(null)
    fun update(id: String, jobApplication: JobApplication): JobApplication {
        require(jobApplication.hospitalId.isNotBlank()) { "Hospital ID must not be blank" }
        require(jobApplication.jobTitle.isNotBlank()) { "Job title must not be blank" }
        require(jobApplication.description.isNotBlank()) { "Description must not be blank" }

        val existingJobApplication = getById(id) ?: throw NoSuchElementException("JobApplication with id $id was not found")

        if (existingJobApplication.hospitalId != jobApplication.hospitalId) {
            throw IllegalArgumentException("Hospital ID cannot be updated")
        }
        if (existingJobApplication.createdAt != jobApplication.createdAt) {
            throw IllegalArgumentException("CreatedAt cannot be updated")
        }

        val updatedJobApplication = existingJobApplication.copy(
            jobTitle = jobApplication.jobTitle,
            description = jobApplication.description,
            requiredSkills = jobApplication.requiredSkills,
            hiringGoal = jobApplication.hiringGoal,
            visibility = jobApplication.visibility,
            updatedAt = Instant.now(),
            applicants = jobApplication.applicants,
        )

        return jobApplicationRepository.save(updatedJobApplication)
    }
    fun delete(id: String) {
        if (!jobApplicationRepository.existsById(id)) {
            throw NoSuchElementException("JobApplication with id $id was not found")
        }
        jobApplicationRepository.deleteById(id)
    }
    fun save(jobApplication: JobApplication): JobApplication = jobApplicationRepository.save(jobApplication)
}