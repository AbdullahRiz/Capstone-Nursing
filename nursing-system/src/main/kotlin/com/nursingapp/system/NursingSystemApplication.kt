package com.nursingapp.system

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@SpringBootApplication
class NursingSystemApplication

fun main(args: Array<String>) {
	runApplication<NursingSystemApplication>(*args)
}
