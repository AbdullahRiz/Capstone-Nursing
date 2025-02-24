package com.nursingapp.system.services

import com.nursingapp.system.models.TokenBlocklist
import com.nursingapp.system.repositories.TokenBlocklistRepository
import org.springframework.stereotype.Service
import java.util.Date

@Service
class TokenBlocklistService(private val tokenBlocklistRepository: TokenBlocklistRepository) {

    fun invalidateToken(token: String, expirationDate: Date) {
        val blocklistedToken = TokenBlocklist(token=token, expirationDate=expirationDate)
        tokenBlocklistRepository.save(blocklistedToken)
    }

    fun isTokenBlocklisted(token: String): Boolean {
        return tokenBlocklistRepository.findByToken(token) != null
    }
}