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
class UserOperations(
    @Autowired val userService: UserService,
    @Autowired val jwtUtil: JwtUtil
) {
    @PutMapping("/rate")
    fun rateNurseFromEmail(
        @RequestHeader("Authorization") token: String,
        @RequestBody rateRequest: RateRequest,
    ) : ResponseEntity<Map<String, Any>> {  // Changed return type
        val userResponse = getUserFromToken(token)
        if (userResponse.statusCode != HttpStatus.OK) {
            return ResponseEntity.status(userResponse.statusCode).build()
        }
        val user = userResponse.body!!

        try {
            val userToRate = userService.findByEmail(rateRequest.email) ?:
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Could not find user to rate"))

            if (userToRate.role == user.role) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(mapOf("error" to "Cannot rate the same user type"))
            }

            if (rateRequest.rating < 1 || rateRequest.rating > 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(mapOf("error" to "Rating must be between 1 and 5"))
            }

            val updatedUser = userService.updateUserRating(rateRequest.rating, user, userToRate, rateRequest.message)

            return ResponseEntity.ok(mapOf(
                "reviewerName" to user.name!!,
                "message" to rateRequest.message,
                "averageRating" to updatedUser.rating,
                "totalRatings" to updatedUser.ratingHistory.size
            ))
        } catch (ex: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Could not rate user: ${ex.message}"))
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