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

    @PostMapping("/setNurseHourlyRate")
    fun setNurseHourlyRate(
        @RequestBody hourlyRateRequest: HourlyRateRequest
    ): ResponseEntity<HourlyRateResponse> {
        val nurse = userService.findByEmail(hourlyRateRequest.email) ?: return ResponseEntity.status(401).body(HourlyRateResponse("Could not find nurse"))

        if (hourlyRateRequest.hourlyRate < 5.0) {
            return ResponseEntity.status(417).body(HourlyRateResponse("Hourly rate too low!"))
        }

        if (hourlyRateRequest.hourlyRate > 100.0) {
            return ResponseEntity.status(417).body(HourlyRateResponse("Hourly rate too high!"))
        }

        if (!hasTwoDecimalPlaces(hourlyRateRequest.hourlyRate)) {
            return ResponseEntity.status(417).body(HourlyRateResponse("Hourly rate not a real amount of money!"))
        }

        userService.updateNurseHourlyRate(hourlyRateRequest.hourlyRate, nurse)
        return ResponseEntity.ok(HourlyRateResponse("Successfully updated hourly rate"))
    }
}

fun hasTwoDecimalPlaces(number: Double): Boolean {
    val stringNumber = number.toString()
    val decimalPart = stringNumber.substringAfter(".", "")
    return decimalPart.length <= 2
}

data class HourlyRateRequest(
    val email: String,
    val hourlyRate: Double
)

data class HourlyRateResponse(
    val message: String
)