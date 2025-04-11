package com.nursingapp.system.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * Offer item summarizes an offer from hospital to nurse.
 */
@Document(collection="job_offers")
data class JobOffer(
    @Id val id: String? = null,
    val jobTitle: String? = null,
    val hospitalId: String,
    val nurseId: String,
    val jobApplicationId: String,
    var message: String? = null,
    var totalComp: Int? = null,
    var rate: Int? = null,
    var hours: Int? = null,
    var days: List<DaysOfTheWeek>? = emptyList(),
    var startDate: Instant? = null,
    var endDate: Instant? = null,
    var contractFileName: String? = null,
    var status: OfferStatus,
)

data class JobOfferInput(
    val jobTitle: String? = null,
    val nurseId: String? = null,
    val jobApplicationId: String? = null,
    val message: String? = null,
    val pay: Int? = null,
    val hours: Int? = null,
    val days: List<String>? = null,
    val startDate: Instant? = null,
    val endDate: Instant? = null,
    val contractFileName: String? = null,
)

data class JobOfferUpdateInput(
    val status: OfferStatus? = null,
    val contractFileName: String? = null,
)

enum class OfferStatus {
    SENT,
    ACCEPTED,
    DECLINED,
    CANCELLED,
}