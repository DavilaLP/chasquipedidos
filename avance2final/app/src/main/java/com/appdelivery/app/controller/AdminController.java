package com.appdelivery.app.controller;

import com.appdelivery.app.entity.Pedido;
import com.appdelivery.app.repository.PedidoRepository;
import com.appdelivery.app.repository.RepartidorRepository;
import com.appdelivery.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.math.BigDecimal;
import java.util.List;

@Controller
public class AdminController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private RepartidorRepository repartidorRepository;

    @GetMapping("/admin")
    public String adminPanel(Model model) {
        
        long totalUsuarios = usuarioRepository.count();
        long totalPedidos = pedidoRepository.count();
        long totalMotorizados = repartidorRepository.count();
        
        List<Pedido> pedidosList = pedidoRepository.findAll();
        BigDecimal totalIngresos = pedidosList.stream()
                .map(p -> p.getTotal() != null ? p.getTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        model.addAttribute("usuarios", totalUsuarios);
        model.addAttribute("pedidos", totalPedidos);
        model.addAttribute("motorizados", totalMotorizados);
        model.addAttribute("ingresos", "S/ " + totalIngresos.toString());
        
        return "admin";  
    }
}