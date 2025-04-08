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
    val rating: Double = 5.0,
    val ratingHistory: Map<String, Double> = emptyMap(),
    val nurseDetails: NurseDetails? = null,
    val hospitalDetails: HospitalDetails? = null,
)

data class NurseDetails(
    val appliedJobsIds: List<String> = emptyList(),
    val certifications: List<String> = emptyList(),
    val experienceYears: Int = 0,
    val isHired: Boolean = false,
    val hourlyRate: Double = 0.0,
)

data class HospitalDetails(
    val address: String? = null,
    val phoneNumber: String? = null,
)

enum class Role {
    NURSE, HOSPITAL
}