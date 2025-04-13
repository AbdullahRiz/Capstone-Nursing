package com.nursingapp.system.controllers

import com.stripe.Stripe
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.stripe.model.checkout.Session
import com.stripe.param.checkout.SessionCreateParams
import org.springframework.beans.factory.annotation.Value

@RequestMapping("/api")
@RestController
class PaymentController {
    @Value("\${stripe.secret-key}")
    private val stripeApiKey: String? = null

    @PostMapping("/create-checkout-session")
    fun createCheckoutSession(@RequestBody checkoutRequest: CheckoutRequest): ResponseEntity<CheckoutResponse> {
        Stripe.apiKey = stripeApiKey
        val params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl("http://localhost:3000/job/${checkoutRequest.jobId}")
            .setCancelUrl("http://localhost:3000/job/${checkoutRequest.jobId}")
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("usd")
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName("Nurse Services")
                                    .build()
                            )
                            .setUnitAmount(checkoutRequest.amount)
                            .build()
                    )
                    .setQuantity(1L)
                    .build()
            )
            .build()

        return try {
            val session: Session = Session.create(params)
            ResponseEntity.ok(CheckoutResponse("Success", session.url))
        } catch (e: Exception) {
            e.printStackTrace()
            ResponseEntity.status(500).body(CheckoutResponse("Failed", null))
        }
    }
}

data class CheckoutResponse(
    val message: String,
    val url: String?
)

data class CheckoutRequest(
    val amount: Long,
    val applicantId: String,
    val jobId: String
)