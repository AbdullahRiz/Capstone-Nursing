package com.nursingapp.system.controllers

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

    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): ResponseEntity<LoginResponse> {
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
    fun signup(@RequestBody user: User): ResponseEntity<String> {
        userService.findByEmail(user.email)?.let {
            return ResponseEntity.status(422).body("E-Mail address already exists!")
        }

        val bcrypt = BCryptPasswordEncoder()

        try {
            val hashedPw = bcrypt.encode(user.password)
            val newUser = User(
                email = user.email,
                password = hashedPw,
                name = user.name,
                role = user.role
            )
            userService.create(newUser)
            return ResponseEntity.status(201).body("User creation successful!")
        } catch (e: Exception) {
            return ResponseEntity.internalServerError().body(e.message.toString())
        }
    }
}