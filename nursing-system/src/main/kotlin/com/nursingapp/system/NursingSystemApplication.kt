package com.nursingapp.system

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class NursingSystemApplication

fun main(args: Array<String>) {
	runApplication<NursingSystemApplication>(*args)
}
