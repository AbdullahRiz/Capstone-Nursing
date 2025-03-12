package com.nursingapp.system.controllers

import com.nursingapp.system.models.*
import com.nursingapp.system.security.JwtUtil
import com.nursingapp.system.services.JobApplicationService
import com.nursingapp.system.services.UserService
import org.apache.coyote.Response
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RequestMapping("/api")
@RestController
class CreateJobApplicationApi(
    val jobApplicationService: JobApplicationService,
    val jwtUtil: JwtUtil,
    val userService: UserService,
) {

    @PostMapping("/jobApplication")
    fun createJobApplication(
        @RequestBody jobApplicationInput: JobApplicationInput,
        @RequestHeader("Authorization") token: String,
    ): ResponseEntity<String> {
        val userResponse = getUserFromToken(token, Role.HOSPITAL)
        if (userResponse.statusCode != HttpStatus.OK) {
            return ResponseEntity.status(userResponse.statusCode).build()
        }
        val user = userResponse.body!!

        val jobApplication = JobApplication(
            hospitalId = user.id!!,
            jobTitle = jobApplicationInput.jobTitle,
            description = jobApplicationInput.description,
            requiredSkills = jobApplicationInput.requiredSkills,
            hiringGoal = jobApplicationInput.hiringGoal,
            visibility = jobApplicationInput.visibility,
            startDate = jobApplicationInput.startDate,
            endDate = jobApplicationInput.endDate,
            minPay = jobApplicationInput.minPay,
            maxPay = jobApplicationInput.maxPay,
        )
        jobApplicationService.create(jobApplication)
        return ResponseEntity.status(HttpStatus.CREATED).body("Job application created: $jobApplication")
    }

    @PostMapping("/jobApplication/{id}/apply")
    fun applyJobApplication(
        @PathVariable id: String,
        @RequestBody applicant: Applicant,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<String> {
        val userResponse = getUserFromToken(token, Role.NURSE)
        if (userResponse.statusCode != HttpStatus.OK) {
            return ResponseEntity.status(userResponse.statusCode).build()
        }
        val user = userResponse.body!!

        // Assign the applicant ID to the applicant object
        applicant.applicantId = user.id!!

        val jobApplication = jobApplicationService.getById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Job application not found.")

        if (jobApplication.applicants.any { it.applicantId == applicant.applicantId }) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("You have already applied to this job.")
        }

        // Add the applicant to the job application
        jobApplication.applicants += applicant
        jobApplicationService.save(jobApplication)

        // Add job ID to user's list of applied jobs
        userService.addAppliedJobId(user.id, id)

        return ResponseEntity.status(HttpStatus.CREATED).body("Applicant added to job application: $applicant")
    }

    @PutMapping("/jobApplication/{id}/unapply")
    fun unapplyJobApplication(
        @PathVariable id: String,
        @RequestHeader("Authorization") token: String,
    ): ResponseEntity<String> {
        val userResponse = getUserFromToken(token, Role.NURSE)
        if (userResponse.statusCode != HttpStatus.OK) {
            return ResponseEntity.status(userResponse.statusCode).build()
        }

        val user = userResponse.body!!
        val jobApplication = jobApplicationService.getById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Job application not found.")

        // Check if the user has applied to this job
        val hasApplied = jobApplication.applicants.any { it.applicantId == user.id }
        if (!hasApplied) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You have not applied to this job.")
        }

        // Remove the user from the job application's applicants list
        jobApplication.applicants = jobApplication.applicants.filter { it.applicantId != user.id }
        jobApplicationService.save(jobApplication)

        // Remove the job application ID from the user's appliedJobIds list
        userService.removeAppliedJobById(user.id!!, id)

        return ResponseEntity.ok("Successfully unapplied from job application: $jobApplication")
    }

    @GetMapping("/jobApplication/{id}")
    fun getJobApplication(@PathVariable id: String): ResponseEntity<JobApplication> {
        val jobApplication = jobApplicationService.getById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        return ResponseEntity.ok(jobApplication)
    }

    @PutMapping("/jobApplication/{id}")
    fun updateJobApplication(
        @PathVariable id: String,
        @RequestBody updateFieldsInput: UpdateFieldsInput,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<String> {
        val userResponse = getUserFromToken(token, Role.HOSPITAL)
        if (userResponse.statusCode != HttpStatus.OK) {
            return ResponseEntity.status(userResponse.statusCode).build()
        }
        val user = userResponse.body!!

        // Fetch existing job application
        val existingJobApplication = jobApplicationService.getById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Job application not found.")

        // Check if the user is authorized (only the hospital that created it can update)
        if (user.id != existingJobApplication.hospitalId) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to update this job application.")
        }

        val updatedJobApplication = existingJobApplication.copy(
            jobTitle = updateFieldsInput.jobTitle ?: existingJobApplication.jobTitle,
            description = updateFieldsInput.description ?: existingJobApplication.description,
            requiredSkills = updateFieldsInput.requiredSkills ?: existingJobApplication.requiredSkills,
            hiringGoal = updateFieldsInput.hiringGoal ?: existingJobApplication.hiringGoal,
            visibility = updateFieldsInput.visibility ?: existingJobApplication.visibility,
            startDate = updateFieldsInput.startDate ?: existingJobApplication.startDate,
            endDate = updateFieldsInput.endDate ?: existingJobApplication.endDate,
            minPay = updateFieldsInput.minPay ?: existingJobApplication.minPay,
            maxPay = updateFieldsInput.maxPay ?: existingJobApplication.maxPay,
        )

        jobApplicationService.update(id, updatedJobApplication)

        return ResponseEntity.ok("Job application updated successfully: $updatedJobApplication")
    }

    @PostMapping("/listJobApplications")
    fun listJobApplications(
        @RequestBody filter: JobApplicationFilter,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<List<JobApplication>> = ResponseEntity.ok(jobApplicationService.listJobApplications(filter))

    @GetMapping("/listAppliedJobs")
    fun listAppliedJobs(
        @RequestHeader("Authorization") token: String,
    ): ResponseEntity<List<JobApplication>> {
        val userResponse = getUserFromToken(token, Role.NURSE)
        if (userResponse.statusCode != HttpStatus.OK) {
            return ResponseEntity.status(userResponse.statusCode).build()
        }

        val user = userResponse.body!!
        val appliedJobs = jobApplicationService.getJobApplicationsByIds(user.appliedJobsIds!!)

        return ResponseEntity.ok(appliedJobs)
    }

    @DeleteMapping("/jobApplication/{id}")
    fun deleteJobApplication(
        @PathVariable id: String,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<String> {
        val userResponse = getUserFromToken(token, Role.HOSPITAL)
        if (userResponse.statusCode != HttpStatus.OK) {
            return ResponseEntity.status(userResponse.statusCode).build()
        }
        val user = userResponse.body!!

        // Fetch existing job application
        val existingJobApplication = jobApplicationService.getById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Job application not found.")

        // Check if the user is authorized (only the hospital that created it can update)
        if (user.id != existingJobApplication.hospitalId) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to delete this job application.")
        }

        // Accounts for all applicants who had this job application on their profile
        existingJobApplication.applicants.forEach { applicant ->
            userService.removeAppliedJobById(applicant.applicantId!!, id)
        }

        jobApplicationService.delete(id)
        return ResponseEntity.ok("Job application deleted successfully")
    }

    private fun getUserFromToken(token: String, requiredRole: Role? = null): ResponseEntity<User> {
        val jwt = token.removePrefix("Bearer ").trim()
        val currentUserEmail = jwtUtil.extractUsername(jwt)
        val user = userService.findByEmail(currentUserEmail) ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).build()

        // Check if the user has the required role (if specified)
        if (requiredRole != null && user.role != requiredRole) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        return ResponseEntity.ok(user)
    }
}