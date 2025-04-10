package com.nursingapp.system.services

import com.nursingapp.system.models.JobOffer
import com.nursingapp.system.repositories.JobOfferRepository
import org.springframework.stereotype.Service

@Service
class JobOfferService (
    private val jobOfferRepository: JobOfferRepository
) {
    fun create (jobOffer: JobOffer): JobOffer = jobOfferRepository.save(jobOffer)

    fun getById(id: String): JobOffer? = jobOfferRepository.findById(id).orElse(null)

    fun delete(id: String) {
        if (!jobOfferRepository.existsById(id)) {
            throw NoSuchElementException("JobOffer with id $id was not found")
        }
        jobOfferRepository.deleteById(id)
    }

    fun save(jobOffer: JobOffer): JobOffer = jobOfferRepository.save(jobOffer)

    fun listJobOffer(id: String?): List<JobOffer> {
        if (id != null) {
            return jobOfferRepository.findAll().filter{ jobOffer ->
                jobOffer.nurseId == id || jobOffer.hospitalId == id
            }
        }

        return jobOfferRepository.findAll()
    }

    fun getByJobApplicationId(jobApplicationId: String): JobOffer? {
        return jobOfferRepository.findByJobApplicationId(jobApplicationId)
    }
}