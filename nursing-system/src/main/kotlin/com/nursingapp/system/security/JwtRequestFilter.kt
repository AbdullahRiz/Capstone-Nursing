package com.nursingapp.system.security

import com.nursingapp.system.services.CustomUserDetailsService
import com.nursingapp.system.services.TokenBlocklistService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtRequestFilter(
    private val jwtUtil: JwtUtil,
    private val customUserDetailsService: CustomUserDetailsService,
    private val tokenBlacklistService: TokenBlocklistService
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authorizationHeader = request.getHeader("Authorization")
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            val token = authorizationHeader.substring(7)

            // Check if the token is blocklisted
            if (tokenBlacklistService.isTokenBlocklisted(token)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token is invalidated")
                return
            }

            val username = jwtUtil.extractUsername(token)

            if (username != null && SecurityContextHolder.getContext().authentication == null) {
                val userDetails = customUserDetailsService.loadUserByUsername(username)
                if (jwtUtil.validateToken(token, userDetails)) {
                    val authentication = UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.authorities
                    )
                    authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
                    SecurityContextHolder.getContext().authentication = authentication
                }
            }
        }
        filterChain.doFilter(request, response)
    }
}