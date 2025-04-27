package com.nursingapp.system.controllers

import com.nursingapp.system.models.Role
import com.nursingapp.system.models.User
import com.nursingapp.system.security.JwtUtil
import com.nursingapp.system.services.CustomUserDetailsService
import com.nursingapp.system.services.TokenBlocklistService
import com.nursingapp.system.services.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.web.bind.annotation.*

@RequestMapping("/api")
@RestController
class LoginController(
    @Autowired val userService: UserService,
    @Autowired val customUserDetailsService: CustomUserDetailsService,
    @Autowired val jwtUtil: JwtUtil
) {

    @GetMapping("/getUserDetails")
    fun getUserByToken(@RequestHeader("Authorization") token: String): ResponseEntity<User> {
        val userResponse = getUserFromToken(token)
        return userResponse
    }

    @GetMapping("/getUserById/{id}")
    fun getUserById( @RequestHeader("Authorization") token: String, @PathVariable id: String): ResponseEntity<User> {
        val user = userService.getById(id)
        return ResponseEntity.ok(user)
    }

    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): ResponseEntity<LoginResponse> {
        if (!isValidEmail(loginRequest.email)) {
            return ResponseEntity.status(400).body(LoginResponse("Invalid email format", null))
        }

        val bcrypt = BCryptPasswordEncoder()

        try {
            val user = userService.findByEmail(loginRequest.email) ?: return ResponseEntity.status(401).body(
                LoginResponse("Could not find user", null))

            val isEqual = bcrypt.matches(loginRequest.password, user.password)
            if (!isEqual) {
                return ResponseEntity.status(401).body(LoginResponse("Failed Login", null))
            }

            val userDetails = customUserDetailsService.loadUserByUsername(loginRequest.email)
            val token = jwtUtil.generateToken(userDetails)

            return ResponseEntity.ok(LoginResponse("User login successful!", token))
        } catch (e: Exception) {
            return ResponseEntity.internalServerError().body(LoginResponse(e.message.toString(), null))
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

// Helper function to validate email format
private fun isValidEmail(email: String): Boolean {
    val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\$"
    return email.matches(emailRegex.toRegex())
}

@RequestMapping("/api")
@RestController
class LogoutController(
    private val jwtUtil: JwtUtil,
    private val tokenBlacklistService: TokenBlocklistService
) {

    @PostMapping("/logout")
    fun logout(@RequestHeader("Authorization") token: String): ResponseEntity<String> {
        if (token.isEmpty() || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Authorization header is missing or invalid")
        }

        try {
            val jwtToken = token.substring(7)
            val expirationDate = jwtUtil.extractExpiration(jwtToken)

            if (tokenBlacklistService.isTokenBlocklisted(jwtToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is already invalidated")
            }

            // Invalidate the token by adding it to the blacklist
            tokenBlacklistService.invalidateToken(jwtToken, expirationDate)
            return ResponseEntity.ok("Logged out successfully")
        } catch (e: Exception) {
            return ResponseEntity.internalServerError().body(e.message.toString())
        }

    }
}

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val message: String,
    val token: String?,
)

@RequestMapping("/api")
@RestController
class SignupController(@Autowired val userService: UserService) {

    @PutMapping("/signup")
    fun signup(@RequestBody signupRequest: SignupRequest): ResponseEntity<String> {
        if (!isValidEmail(signupRequest.email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid email format")
        }

        if (signupRequest.password.length < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password must be at least 6 characters long")
        }

        userService.findByEmail(signupRequest.email)?.let {
            return ResponseEntity.status(422).body("E-Mail address already exists!")
        }

        val bcrypt = BCryptPasswordEncoder()

        try {
            val hashedPw = bcrypt.encode(signupRequest.password)
            
            // Create appropriate details based on role
            val nurseDetails = if (signupRequest.role == Role.NURSE) {
                com.nursingapp.system.models.NurseDetails(
                    isTravelNurse = signupRequest.isTravelNurse ?: false
                )
            } else null
            
            val hospitalDetails = if (signupRequest.role == Role.HOSPITAL) {
                com.nursingapp.system.models.HospitalDetails()
            } else null

            val individualDetails = if (signupRequest.role == Role.INDIVIDUAL) {
                com.nursingapp.system.models.IndividualDetails()
            } else null
            
            val newUser = User(
                email = signupRequest.email,
                password = hashedPw,
                name = signupRequest.name,
                role = signupRequest.role,
                nurseDetails = nurseDetails,
                hospitalDetails = hospitalDetails,
                individualDetails = individualDetails
            )
            userService.create(newUser)
            return ResponseEntity.status(201).body("User creation successful!")
        } catch (e: Exception) {
            return ResponseEntity.internalServerError().body(e.message.toString())
        }
    }
}

data class SignupRequest(
    val email: String,
    val password: String,
    val name: String?,
    val role: Role,
    val isTravelNurse: Boolean? = false
)
