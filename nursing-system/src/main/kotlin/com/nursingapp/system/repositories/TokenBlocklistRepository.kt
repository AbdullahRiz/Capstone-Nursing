package com.nursingapp.system.repositories

import com.nursingapp.system.models.TokenBlocklist
import org.springframework.data.mongodb.repository.MongoRepository

interface TokenBlocklistRepository : MongoRepository<TokenBlocklist, String> {
    fun findByToken(token: String): TokenBlocklist?
}