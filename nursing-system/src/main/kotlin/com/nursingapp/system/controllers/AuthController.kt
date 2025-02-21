package com.nursingapp.system.controllers

import com.nursingapp.system.models.Role
import com.nursingapp.system.models.User
import com.nursingapp.system.services.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api")
@RestController
class LoginController(@Autowired val userService: UserService) {

    @PostMapping("/login")
    fun login(@RequestParam email: String, @RequestParam password: String): ResponseEntity<String> {
        val bcrypt = BCryptPasswordEncoder()

        try {
            val user = userService.findByEmail(email) ?: return ResponseEntity.ok("Could not find user")

            val isEqual = bcrypt.matches(password, user.password)
            if (!isEqual) {
                return ResponseEntity.status(401).body("Failed Login")
            }

            return ResponseEntity.ok("User login successful!")
        } catch (e: Exception) {
            return ResponseEntity.internalServerError().body(e.message.toString())
        }
    }
}

@RequestMapping("/api/signup")
@RestController
class SignupController(@Autowired val userService: UserService) {

    @PutMapping("/nurse")
    fun nurseSignup(
        @RequestParam email: String,
        @RequestParam password: String,
        @RequestParam(required = false) name: String?
    ): ResponseEntity<String> {
        userService.findByEmail(email)?.let {
            return ResponseEntity.ok("E-Mail address already exists!")
        }

        val bcrypt = BCryptPasswordEncoder()

        try {
            val hashedPw = bcrypt.encode(password)
            val user = User(
                email = email,
                password = hashedPw,
                name = name,
                role = Role.NURSE
            )
            userService.create(user)
            return ResponseEntity.status(201).body("User creation successful!")
        } catch (e: Exception) {
            return ResponseEntity.internalServerError().body(e.message.toString())
        }
    }

    @PutMapping("/hospital")
    fun hospitalSignup(
        @RequestParam email: String,
        @RequestParam password: String,
        @RequestParam(required = false) name: String?
    ): ResponseEntity<String> {
        val bcrypt = BCryptPasswordEncoder()

        try {
            val hashedPw = bcrypt.encode(password)
            val user = User(
                email = email,
                password = hashedPw,
                name = name,
                role = Role.HOSPITAL
            )
            userService.create(user)
            return ResponseEntity.status(201).body("User creation successful!")
        } catch (e: Exception) {
            return ResponseEntity.internalServerError().body(e.message.toString())
        }
    }
}