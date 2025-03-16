package com.nursingapp.system.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "users")
data class User(
    @Id val id: String? = null,
    val email: String,
    val password: String,
    val name: String? = null,
    val role: Role,
    val appliedJobsIds: List<String>? = emptyList(),
)

enum class Role {
    NURSE, HOSPITAL
}