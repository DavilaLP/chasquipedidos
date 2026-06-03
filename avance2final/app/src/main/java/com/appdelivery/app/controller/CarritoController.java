package com.appdelivery.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CarritoController {

    @GetMapping("/carrito")
    public String carrito() {
        return "carrito"; 
    }
}