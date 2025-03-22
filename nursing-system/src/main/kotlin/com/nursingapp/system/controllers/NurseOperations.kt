package com.nursingapp.system.controllers

import com.nursingapp.system.models.User
import com.nursingapp.system.services.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RequestMapping("/api")
@RestController
class NurseOperations (
    @Autowired val userService: UserService,
) {
    @GetMapping("/searchNurses")
    fun searchNurses(
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<List<User>> {
        val nurses = userService.searchNurses()
        return ResponseEntity.ok(nurses)
    }
}