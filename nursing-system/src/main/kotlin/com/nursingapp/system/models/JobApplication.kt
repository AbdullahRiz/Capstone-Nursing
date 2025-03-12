package com.nursingapp.system.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "job_applications")
data class JobApplication(
    @Id
    val id: String? = null,
    val hospitalId: String, // ID of the hospital posting the job
    var jobTitle: String, // Title of the job posting
    var description: String, // Description of the job
    var requiredSkills: List<SkillSet> = emptyList(), // List of required skills
    var hiringGoal: HiringGoal? = null,
    val createdAt: Instant = Instant.now(),
    var updatedAt: Instant = Instant.now(),
    var visibility: VisibilityStatus = VisibilityStatus.PUBLIC,
    var applicants: List<Applicant> = emptyList(),
    var startDate: Instant? = null,
    var endDate: Instant? = null,
    var minPay: Double? = 0.0,
    var maxPay: Double? = 0.0,
)

enum class VisibilityStatus {
    PUBLIC,
    PRIVATE,
}

/**
 * Hiring goal used to prioritize candidate suggestions and notifications.
 *
 * @property [targetDate] date to complete this application
 * @property [targetHours] preferred number of hours nurse is available to work
 * @property [preferredSkills] prioritized set of skills used to suggest candidates
 */
data class HiringGoal(
    val targetDate: Instant? = null,
    val targetHours: Double? = null,
    val preferredSkills: List<SkillSet> = emptyList(),
)

data class JobApplicationInput(
    val jobTitle: String,
    val description: String,
    val requiredSkills: List<SkillSet> = emptyList(),
    val hiringGoal: HiringGoal? = null,
    val visibility: VisibilityStatus = VisibilityStatus.PUBLIC,
    val startDate: Instant?,
    val endDate: Instant?,
    val minPay: Double?,
    val maxPay: Double?,
)

data class UpdateFieldsInput(
    val jobTitle: String?,
    val description: String?,
    val requiredSkills: List<SkillSet>?,
    val hiringGoal: HiringGoal?,
    val visibility: VisibilityStatus?,
    val startDate: Instant?,
    val endDate: Instant?,
    val minPay: Double?,
    val maxPay: Double?,
)

data class Applicant(
    var applicantId: String? = null,
    val availableDays: List<DaysOfTheWeek> = emptyList(),
    val availableHours: Double? = null,
    val skills: List<SkillSet> = emptyList(),
)

enum class DaysOfTheWeek {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY,
}

enum class SkillSet(val value: String) {
    PATIENT_CARE("Patient Care"),
    VITAL_SIGNS_MONITORING("Vital Signs Monitoring"),
    MEDICATION_ADMINISTRATION("Medication Administration"),
    IV_THERAPY("IV Therapy"),
    WOUND_CARE("Wound Care"),
    INFECTION_CONTROL("Infection Control"),
    DOCUMENTATION("Documentation"),
    HEALTH_EDUCATION("Health Education");
}

data class JobApplicationFilter(
    val skillSet: List<SkillSet>? = emptyList(),
    val minimumHours: Double? = null,
    val maximumHours: Double? = null,
    val hospitalId: String? = null,
    val startDate: Instant? = null,
    val endDate: Instant? = null,
    val minPay: Double? = null,
    val maxPay: Double? = null,
)