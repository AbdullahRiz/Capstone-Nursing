package com.nursingapp.system.repositories

import com.nursingapp.system.models.JobOffer
import org.springframework.data.mongodb.repository.MongoRepository

interface JobOfferRepository : MongoRepository<JobOffer, String> {
    fun findByJobApplicationId(jobApplicationId: String): JobOffer?
}