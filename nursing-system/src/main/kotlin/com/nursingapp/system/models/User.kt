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
    val ratingHistory: Map<String, RatingItem> = emptyMap(),
    val nurseDetails: NurseDetails? = null,
    val hospitalDetails: HospitalDetails? = null,
    val individualDetails: IndividualDetails? = null,
)

data class RatingItem(
    val reviewerName: String,
    val rating: Double,
    val message: String,
)

data class NurseDetails(
    val appliedJobsIds: List<String> = emptyList(),
    val certifications: List<String> = emptyList(),
    val experienceYears: Int = 0,
    val hiredJobsIds: List<String> = emptyList(),
    val hourlyRate: Double = 0.0,
    val accountNumber: Int? = null,
    val routingNumber: Int? = null,
    val isTravelNurse: Boolean = false,
)

data class HospitalDetails(
    val address: String? = null,
    val phoneNumber: String? = null,
)

data class IndividualDetails(
    val address: String? = null,
    val phoneNumber: String? = null,
)

enum class Role {
    NURSE, HOSPITAL, INDIVIDUAL
}
