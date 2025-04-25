package com.nursingapp.system.controllers

import com.nursingapp.system.models.RateRequest
import com.nursingapp.system.models.Role
import com.nursingapp.system.models.User
import com.nursingapp.system.security.JwtUtil
import com.nursingapp.system.services.ContractStorageService
import com.nursingapp.system.services.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RequestMapping("/api")
@RestController
class NurseOperations (
    @Autowired val userService: UserService,
    @Autowired val jwtUtil: JwtUtil,
    private val contractStorageService: ContractStorageService
) {
    @GetMapping("/searchNurses")
    fun searchNurses(
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<List<User>> {
        val nurses = userService.searchNurses()
        return ResponseEntity.ok(nurses)
    }

    @GetMapping("/getTravelNurses")
    fun getTravelNurses(
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<List<User>> {
        val nurses = userService.getTravelNurses()
        return ResponseEntity.ok(nurses)
    }

    @PostMapping("/setNurseHourlyRate")
    fun setNurseHourlyRate(
        @RequestBody hourlyRateRequest: HourlyRateRequest,
        @RequestHeader("Authorization") token: String
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

    @PostMapping("/submitSignedContract")
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestHeader("Authorization") token: String
    ): String {
        return contractStorageService.uploadContract(file)
    }

    @GetMapping("/hasSetupPayment")
    fun hasSetupPayment(
        @RequestParam("email") email: String,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<PaymentSetupResponse> {
        val nurse = userService.findByEmail(email) ?: return ResponseEntity.status(401).body(PaymentSetupResponse("Could not find nurse"))

        return ResponseEntity.ok(PaymentSetupResponse((nurse.nurseDetails?.routingNumber != null && nurse.nurseDetails.accountNumber != null).toString()))
    }
    
    @PostMapping("/updateTravelNurseStatus")
    fun updateTravelNurseStatus(
        @RequestBody travelNurseRequest: TravelNurseRequest,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<TravelNurseResponse> {
        try {
            val jwt = token.removePrefix("Bearer ").trim()
            val userEmail = jwtUtil.extractUsername(jwt)
            val user = userService.findByEmail(userEmail) ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(TravelNurseResponse("User not found"))
            
            if (user.role != Role.NURSE) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(TravelNurseResponse("Only nurses can update travel nurse status"))
            }
            
            val updatedUser = userService.updateTravelNurseStatus(travelNurseRequest.isTravelNurse, user)
            return ResponseEntity.ok(TravelNurseResponse("Travel nurse status updated successfully", updatedUser.nurseDetails?.isTravelNurse ?: false))
        } catch (ex: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(TravelNurseResponse("Error updating travel nurse status: ${ex.message}"))
        }
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

data class PaymentSetupResponse(
    val message: String
)

data class TravelNurseRequest(
    val isTravelNurse: Boolean
)

data class TravelNurseResponse(
    val message: String,
    val isTravelNurse: Boolean = false
)
