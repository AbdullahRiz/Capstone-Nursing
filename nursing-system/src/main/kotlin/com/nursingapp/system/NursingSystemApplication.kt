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
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

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
//			.cors { cors -> cors.disable() }
		return http.build()
	}
}

@Configuration
class CorsConfig : WebMvcConfigurer {

	override fun addCorsMappings(registry: CorsRegistry) {
		registry.addMapping("/**") // Apply CORS to all endpoints
			.allowedOrigins("http://localhost:3000") // Allow requests from React app
			.allowedMethods("GET", "POST", "PUT", "DELETE") // Allowed HTTP methods
			.allowedHeaders("*") // Allow all headers
			.allowCredentials(true) // Allow sending cookies and credentials
	}
}