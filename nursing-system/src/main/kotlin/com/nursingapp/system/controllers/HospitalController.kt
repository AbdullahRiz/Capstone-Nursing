package com.nursingapp.system.controllers

import com.nursingapp.system.models.RateRequest
import com.nursingapp.system.models.Role
import com.nursingapp.system.models.User
import com.nursingapp.system.security.JwtUtil
import com.nursingapp.system.services.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RequestMapping("/api")
@RestController
class HospitalController(
    @Autowired val userService: UserService,
    @Autowired val jwtUtil: JwtUtil
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

    @PutMapping("/rate")
    fun rateNurseFromEmail(
        @RequestHeader("Authorization") token: String,
        @RequestBody rateRequest: RateRequest,
    ) :ResponseEntity<String> {
        val userResponse = getUserFromToken(token, Role.HOSPITAL)
        if (userResponse.statusCode != HttpStatus.OK) {
            return ResponseEntity.status(userResponse.statusCode).build()
        }
        val user = userResponse.body!!

        try {
            val nurseToRate = userService.findByEmail(rateRequest.email) ?:
            return ResponseEntity.status(404).body("Could not find nurse")

            if (rateRequest.rating < 1 || rateRequest.rating > 5) {
                return ResponseEntity.status(400).body("Rating must be between 1 and 5")
            }

            userService.updateNurseRating(rateRequest.rating, nurseToRate, user)
            return ResponseEntity.ok("Nurse rated successfully!")
        } catch (ex: Exception) {
            return ResponseEntity.status(500).body("Could not rate nurse: ${ex.message}")
        }
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

data class HireRequest(
    val email: String
)

data class HireResponse(
    val message: String
)
