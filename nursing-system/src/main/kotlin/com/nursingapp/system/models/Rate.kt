package com.nursingapp.system.models

class RateRequest(
    val email: String,
    val rating: Int,
    val message: String = "",
)