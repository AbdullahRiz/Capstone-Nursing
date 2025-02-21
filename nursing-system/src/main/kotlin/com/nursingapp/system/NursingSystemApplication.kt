package com.nursingapp.system

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configurers.ExpressionUrlAuthorizationConfigurer.ExpressionInterceptUrlRegistry
import org.springframework.security.config.annotation.web.configurers.HttpBasicConfigurer
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.web.SecurityFilterChain

@EnableWebSecurity
@SpringBootApplication
class NursingSystemApplication

fun main(args: Array<String>) {
	runApplication<NursingSystemApplication>(*args)
}

@Configuration
@EnableWebSecurity
class SecurityConfig {

	@Bean
	fun filterChain(http: HttpSecurity): SecurityFilterChain {
		http
			.authorizeHttpRequests { auth ->
				auth.anyRequest().permitAll()
			}
			.csrf { csrf -> csrf.disable() } // Disable CSRF if not needed for APIs
		return http.build()
	}
}