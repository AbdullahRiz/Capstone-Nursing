package com.nursingapp.system.controllers

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping

@Controller
class ClientForwardController {
    @GetMapping(value=["/**/{path:[^\\.]*}"])
    fun forward(): String {
        return "forward:/"
    }
}