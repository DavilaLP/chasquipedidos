package com.appdelivery.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminController {

    @GetMapping("/admin")
    public String adminPanel(Model model) {
        
        model.addAttribute("usuarios", 145);
        model.addAttribute("pedidos", 512);
        model.addAttribute("motorizados", 25);
        model.addAttribute("ingresos", "S/ 15,280");
        
        return "admin";  
    }
}