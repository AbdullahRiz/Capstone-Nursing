package com.nursingapp.system.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.util.Date

@Document(collection = "token_blocklist")
class TokenBlocklist(
    @Id val id: String? = null,
    val token: String,
    val expirationDate: Date
) {
}