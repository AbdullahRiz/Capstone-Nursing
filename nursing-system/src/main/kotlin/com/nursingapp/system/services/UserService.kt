package com.nursingapp.system.services

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
    fun delete(id: String) {
        userRepository.deleteById(id)
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