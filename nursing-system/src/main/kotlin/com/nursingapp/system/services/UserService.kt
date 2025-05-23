package com.nursingapp.system.services

import com.nursingapp.system.models.NurseDetails
import com.nursingapp.system.models.RatingItem
import com.nursingapp.system.models.Role
import com.nursingapp.system.models.User
import com.nursingapp.system.repositories.UserRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class UserService(private val userRepository: UserRepository) {
    fun create(user: User): User = userRepository.save(user)
    fun getById(id: String): User? = userRepository.findById(id).orElse(null)
    fun findByEmail(email: String): User? = userRepository.findByEmail(email)
    fun getAll(): List<User> = userRepository.findAll()
    fun update(id: String, user: User): User {
        val existingUser = getById(id) ?: throw NoSuchElementException("User not found")
        val updatedUser = existingUser.copy(name = user.name)
        return userRepository.save(updatedUser)
    }
    fun addAppliedJobById(userId: String, jobApplicationId: String) {
        val user = getById(userId)
        if (user != null && user.role == Role.NURSE) {
            val updatedNurseDetails = user.nurseDetails?.copy(
                appliedJobsIds = user.nurseDetails.appliedJobsIds + jobApplicationId
            ) ?: NurseDetails(appliedJobsIds = listOf(jobApplicationId))

            val updatedUser = user.copy(nurseDetails = updatedNurseDetails)
            userRepository.save(updatedUser)
        }
    }
    fun removeAppliedJobById(userId: String, jobApplicationId: String) {
        val user = getById(userId)
        if (user != null && user.role == Role.NURSE) {
            val updatedNurseDetails = user.nurseDetails?.copy(
                appliedJobsIds = user.nurseDetails.appliedJobsIds.filter { it != jobApplicationId }
            )

            val updatedUser = user.copy(nurseDetails = updatedNurseDetails)
            userRepository.save(updatedUser)
        }
    }
    fun delete(id: String) {
        userRepository.deleteById(id)
    }
    fun searchNurses(): List<User> {
        return userRepository.findAll().filter { user ->
            // Check if the user is a nurse
            user.role == Role.NURSE
        }
    }

    fun getTravelNurses(): List<User> {
        return userRepository.findAll().filter { user ->
            user.role == Role.NURSE && user.nurseDetails?.isTravelNurse == true
        }
    }

    fun updateNurseHiredStatus(jobApplicationId: String, user: User) {
        val currentHiredJobs = user.nurseDetails?.hiredJobsIds ?: emptyList()
        val updatedHiredJobs = if (!currentHiredJobs.contains(jobApplicationId)) {
            currentHiredJobs + jobApplicationId
        } else {
            currentHiredJobs
        }
        
        val updatedNurseDetails = user.nurseDetails?.copy(
            hiredJobsIds = updatedHiredJobs
        ) ?: NurseDetails(hiredJobsIds = listOf(jobApplicationId))

        val updatedUser = user.copy(nurseDetails = updatedNurseDetails)
        userRepository.save(updatedUser)
    }
    
    fun removeNurseHiredStatus(jobApplicationId: String, user: User) {
        val currentHiredJobs = user.nurseDetails?.hiredJobsIds ?: emptyList()
        val updatedHiredJobs = currentHiredJobs.filter { it != jobApplicationId }
        
        val updatedNurseDetails = user.nurseDetails?.copy(
            hiredJobsIds = updatedHiredJobs
        ) ?: NurseDetails()

        val updatedUser = user.copy(nurseDetails = updatedNurseDetails)
        userRepository.save(updatedUser)
    }
    
    fun updateTravelNurseStatus(isTravelNurse: Boolean, user: User): User {
        val updatedNurseDetails = user.nurseDetails?.copy(
            isTravelNurse = isTravelNurse
        ) ?: NurseDetails(isTravelNurse = isTravelNurse)

        val updatedUser = user.copy(nurseDetails = updatedNurseDetails)
        return userRepository.save(updatedUser)
    }
    fun updateNurseHourlyRate(hourlyRate: Double, user: User) {
        val updatedNurseDetails = user.nurseDetails?.copy(
            hourlyRate = hourlyRate
        ) ?: NurseDetails(hourlyRate = 0.0)

        val updatedUser = user.copy(nurseDetails = updatedNurseDetails)
        userRepository.save(updatedUser)
    }
    fun updateUserRating(rating: Int, rater: User, user: User, message: String): User {
        // Explicitly create new Map with String keys and Double values
        val updatedHistory: Map<String, RatingItem> = user.ratingHistory + mapOf(rater.id!! to RatingItem(
            reviewerName = rater.name!!,
            rating = rating.toDouble(),
            message = message))

        // Calculate new average rating
        val newAverage = if (updatedHistory.isNotEmpty()) {
            updatedHistory.values.map { it.rating }.average()
        } else {
            5.0 // default rating
        }

        val updatedUser = user.copy(
            rating = newAverage,
            ratingHistory = updatedHistory,
            // Preserve nurse/hospital specific details
            nurseDetails = user.nurseDetails?.copy(),
            hospitalDetails = user.hospitalDetails?.copy()
        )

        return userRepository.save(updatedUser)
    }
}

@Service
class CustomUserDetailsService(private val userService: UserService) : UserDetailsService {

    override fun loadUserByUsername(email: String): UserDetails {
        val user = userService.findByEmail(email)
            ?: throw UsernameNotFoundException("User not found with email: $email")

        return org.springframework.security.core.userdetails.User(
            user.email,
            user.password,
            emptyList() // Add roles/authorities here if needed
        )
    }
}
