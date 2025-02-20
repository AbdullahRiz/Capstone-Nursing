package com.nursingapp.system.controllers

import com.nursingapp.system.models.User
import com.nursingapp.system.services.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class AuthController(@Autowired val userService: UserService) {

    @GetMapping("/signup")
    fun signup(@RequestParam email: String, @RequestParam password: String, @RequestParam(required = false) name: String?): String {
        val bcrypt = BCryptPasswordEncoder()

        try {
            val hashedPw = bcrypt.encode(password)
            val user = User(
                email = email,
                password = hashedPw,
                name = name
            )
            userService.create(user)
            return "User creation successful!"
        } catch (err: Error) {
            return err.message.toString()
        }
    }

    @GetMapping("/login")
    fun login(@RequestParam email: String, @RequestParam password: String): String {
        val bcrypt = BCryptPasswordEncoder()

        try {
            val user = userService.findByEmail(email) ?: return "Could not find user"

            val isEqual = bcrypt.matches(password, user.password)
            if (!isEqual) {
                return "Failed Login"
            }

            return "User login successful!"
        } catch (err: Error) {
            return err.message.toString()
        }
    }
}