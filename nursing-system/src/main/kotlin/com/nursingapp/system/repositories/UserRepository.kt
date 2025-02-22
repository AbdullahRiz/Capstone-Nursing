package com.nursingapp.system.repositories

import com.nursingapp.system.models.User
import org.springframework.data.mongodb.repository.MongoRepository

interface UserRepository : MongoRepository<User, String> {
    fun findByEmail(email: String?): User?
}