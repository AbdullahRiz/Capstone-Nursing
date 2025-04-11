package com.nursingapp.system.controllers

import com.nursingapp.system.models.*
import com.nursingapp.system.security.JwtUtil
import com.nursingapp.system.services.JobOfferService
import com.nursingapp.system.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.time.ZoneOffset

@RequestMapping("/api")
@RestController
class JobOfferOperations(
    val jwtUtil: JwtUtil,
    val userService: UserService,
    private val jobOfferService: JobOfferService,
) {

    @PostMapping("/jobOffer")
    fun createJobOffer(
        @RequestBody jobOfferInput: JobOfferInput,
        @RequestHeader("Authorization") token: String,
    ): ResponseEntity<String> {

        val userResponse = getUserFromToken(token, Role.HOSPITAL)
        if (userResponse.statusCode != HttpStatus.OK) {
            return ResponseEntity.status(userResponse.statusCode).build()
        }
        val user = userResponse.body!!

        val mappedDays = jobOfferInput.days?.mapNotNull { mapFrontendDayToEnum(it.toString()) } ?: emptyList()

        val start = jobOfferInput.startDate!!
        val end = jobOfferInput.endDate!!
        val hours = jobOfferInput.hours ?: 0
        val pay = jobOfferInput.pay ?: 0
        val totalCompAmount = calculateExactTotalCompensation(start, end, mappedDays, hours, pay)

        val jobOffer = JobOffer(
            jobTitle = jobOfferInput.jobTitle,
            hospitalId = user.id!!,
            nurseId = jobOfferInput.nurseId!!,
            jobApplicationId = jobOfferInput.jobApplicationId!!,
            message = jobOfferInput.message,
            hours = jobOfferInput.hours,
            days = mappedDays,
            rate = jobOfferInput.pay,
            totalComp = totalCompAmount,
            startDate = jobOfferInput.startDate,
            endDate = jobOfferInput.endDate,
            contractFileName = jobOfferInput.contractFileName,
            status = OfferStatus.SENT,
        )

        val existingJobOffer = jobOfferService.getByJobApplicationId(jobOfferInput.jobApplicationId)

        if (existingJobOffer == null) {
            jobOfferService.create(jobOffer)
            return ResponseEntity.status(HttpStatus.CREATED).body("Job offer created: $jobOffer")
        }

        existingJobOffer.apply {
            message = jobOfferInput.message ?: message
            this.hours = hours
            this.days = mappedDays
            this.rate = pay
            this.totalComp = totalCompAmount
            this.startDate = start
            this.endDate = end
            this.contractFileName = jobOfferInput.contractFileName ?: contractFileName
            this.status = OfferStatus.SENT
        }
        jobOfferService.save(existingJobOffer)
        return ResponseEntity.status(HttpStatus.CREATED).body("Job offer updated: $jobOffer")
    }

    @GetMapping("/jobOffer")
    fun getJobOfferList(
        @RequestHeader("Authorization") token: String,
    ) = ResponseEntity.ok(jobOfferService.listJobOffer(id = null))

    @GetMapping("/jobOffers/{id}")
    fun getJobOfferListForUser(
        @PathVariable id: String,
        @RequestHeader("Authorization") token: String,
    ) = ResponseEntity.ok(jobOfferService.listJobOffer(id = id))

    @GetMapping("/jobOffer/{id}")
    fun getJobOffer(
        @PathVariable id: String,
        @RequestHeader("Authorization") token: String,
    ) = ResponseEntity.ok(jobOfferService.getById(id))

    @PutMapping("/jobOffer/{id}")
    fun updateJobOffer(
        @PathVariable id: String,
        @RequestBody updateInput: JobOfferUpdateInput,
        @RequestHeader("Authorization") token: String,
    ): ResponseEntity<String> {
        val jobOffer = jobOfferService.getById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Job offer not found")

        val userResponse = getUserFromToken(token)
        val user = userResponse.body!!

        if (user.id == jobOffer.nurseId) {
            jobOffer.status = updateInput.status!!
        }

        if (user.id == jobOffer.hospitalId) {
            jobOffer.contractFileName = updateInput.contractFileName!!
        }

        jobOfferService.save(jobOffer)
        return ResponseEntity.ok("Job offer updated: $jobOffer")
    }

    private fun calculateExactTotalCompensation(
        startDate: Instant,
        endDate: Instant,
        workDays: List<DaysOfTheWeek>,
        hoursPerDay: Int,
        hourlyRate: Int
    ): Int {
        var totalPayDays = 0

        var currentDate = startDate.atZone(ZoneOffset.UTC).toLocalDate()
        val endLocalDate = endDate.atZone(ZoneOffset.UTC).toLocalDate()

        while (!currentDate.isAfter(endLocalDate)) {
            val dayOfWeek = currentDate.dayOfWeek.name // MONDAY, TUESDAY, etc.
            if (workDays.any { it.name == dayOfWeek }) {
                totalPayDays++
            }
            currentDate = currentDate.plusDays(1)
        }

        return totalPayDays * hoursPerDay * hourlyRate
    }

    private fun mapFrontendDayToEnum(day: String): DaysOfTheWeek? {
        return when (day.uppercase()) {
            "SUN" -> DaysOfTheWeek.SUNDAY
            "MON" -> DaysOfTheWeek.MONDAY
            "TUE" -> DaysOfTheWeek.TUESDAY
            "WED" -> DaysOfTheWeek.WEDNESDAY
            "THU" -> DaysOfTheWeek.THURSDAY
            "FRI" -> DaysOfTheWeek.FRIDAY
            "SAT" -> DaysOfTheWeek.SATURDAY
            else -> null
        }
    }

    private fun getUserFromToken(token: String, requiredRole: Role? = null): ResponseEntity<User> {
        val jwt = token.removePrefix("Bearer ").trim()
        val currentUserEmail = jwtUtil.extractUsername(jwt)
        val user = userService.findByEmail(currentUserEmail) ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).build()

        if (requiredRole != null && user.role != requiredRole) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        return ResponseEntity.ok(user)
    }
}