package com.nursingapp.system.controllers

//import com.nursingapp.system.models.RateRequest
//import com.nursingapp.system.models.Role
//import com.nursingapp.system.models.User
//import com.nursingapp.system.security.JwtUtil
import com.nursingapp.system.services.JobApplicationService
import com.nursingapp.system.services.UserService
import org.springframework.beans.factory.annotation.Autowired
//import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RequestMapping("/api")
@RestController
class HospitalController(
    @Autowired val userService: UserService,
    @Autowired val jobApplicationService: JobApplicationService,
//    @Autowired val jwtUtil: JwtUtil
) {

    @GetMapping("/checkIfHired")
    fun checkIfNurseIsHired(
        @RequestParam nurseId: String,
        @RequestParam jobId: String,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<Map<String, Boolean>> {
        try {
            // Check if the nurse exists
            val nurse = userService.getById(nurseId)
                ?: return ResponseEntity.status(404).body(mapOf("hired" to false, "error" to true))
            
            // Check if the job application exists
            val jobApplication = jobApplicationService.getById(jobId)
                ?: return ResponseEntity.status(404).body(mapOf("hired" to false, "error" to true))
            
            // Check if the nurse is hired for this job in the job application
            val applicant = jobApplication.applicants.find { it.applicantId == nurseId }
            val isHiredInApplication = applicant?.isHired ?: false
            
            // Check if the job is in the nurse's hired jobs list
            val isHiredInNurseRecord = nurse.nurseDetails?.hiredJobsIds?.contains(jobId) ?: false
            
            // The nurse is considered hired if both conditions are true
            val isHired = isHiredInApplication && isHiredInNurseRecord
            
            return ResponseEntity.ok(mapOf("hired" to isHired))
        } catch (ex: Exception) {
            return ResponseEntity.status(500).body(mapOf("hired" to false, "error" to true))
        }
    }

    @PostMapping("/hireNurse")
    fun hireNurseFromEmail(
        @RequestBody hireRequest: HireRequest,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<HireResponse> {
        try {
            val nurseToHire = userService.findByEmail(hireRequest.email) 
                ?: return ResponseEntity.status(401).body(HireResponse("Could not find nurse"))
            
            val jobApplication = jobApplicationService.getById(hireRequest.jobApplicationId)
                ?: return ResponseEntity.status(404).body(HireResponse("Could not find job application"))
            
            // Find the applicant in the job application
            val applicant = jobApplication.applicants.find { it.applicantId == nurseToHire.id }
                ?: return ResponseEntity.status(400).body(HireResponse("Nurse is not an applicant for this job"))
            
            // Update the job application to mark the applicant as hired and set the job's hired field to true
            jobApplicationService.updateApplicantHiredStatus(hireRequest.jobApplicationId, nurseToHire.id!!, true)
            
            // Update the nurse's user record to add this job to their hired jobs
            userService.updateNurseHiredStatus(hireRequest.jobApplicationId, nurseToHire)
            
            return ResponseEntity.ok(HireResponse("Nurse Hired!"))
        } catch (ex: Exception) {
            return ResponseEntity.status(500).body(HireResponse("Could not hire nurse: ${ex.message}"))
        }
    }
}

data class HireRequest(
    val email: String,
    val jobApplicationId: String
)

data class HireResponse(
    val message: String
)
