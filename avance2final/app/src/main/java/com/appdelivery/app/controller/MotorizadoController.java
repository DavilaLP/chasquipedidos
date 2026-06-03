package com.appdelivery.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/motorizado")
public class MotorizadoController {

    @GetMapping
    public String panel(Model model) {

        model.addAttribute("estado", "Disponible");
        model.addAttribute("rating", 4.8);
        model.addAttribute("ganancias", 85);

        List<Object> pedidos = List.of();

        model.addAttribute("pedidos", pedidos);

        return "motorizado";
    }
}