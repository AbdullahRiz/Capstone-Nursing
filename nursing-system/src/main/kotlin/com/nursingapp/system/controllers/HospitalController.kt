package com.nursingapp.system.controllers

import com.nursingapp.system.models.User
import com.nursingapp.system.services.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatusCode
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api")
@RestController
class HospitalController(
    @Autowired val userService: UserService,
) {

    @PostMapping("/hireNurse")
    fun hireNurseFromEmail(
        @RequestBody hireRequest: HireRequest,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<HireResponse> {
        try {
            val nurseToHire = userService.findByEmail(hireRequest.email) ?: return ResponseEntity.status(401).body(HireResponse("Could not find nurse"))
            userService.updateNurseHiredStatus(true, nurseToHire)
            return ResponseEntity.ok(HireResponse("Nurse Hired!"))
        } catch (ex: Exception) {
            return ResponseEntity.status(500).body(HireResponse("Could not hire nurse"))
        }
    }
}

data class HireRequest(
    val email: String
)

data class HireResponse(
    val message: String
)
