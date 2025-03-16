package com.nursingapp.system.repositories

import com.nursingapp.system.models.JobApplication
import org.springframework.data.mongodb.repository.MongoRepository

interface JobApplicationRepository : MongoRepository<JobApplication, String> {
}