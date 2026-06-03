package com.appdelivery.app.controller;

import com.appdelivery.app.entity.Pedido;
import com.appdelivery.app.entity.Usuario;
import com.appdelivery.app.repository.PedidoRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Comparator;
import java.util.List;

@Controller
@RequestMapping("/seguimiento")
public class SeguimientoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @GetMapping
    public String seguimiento(@RequestParam(required = false) Integer id, HttpSession session, Model model) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");
        Pedido pedido = null;

        if (id != null) {
            pedido = pedidoRepository.findById(id).orElse(null);
        } else if (usuario != null) {
            List<Pedido> pedidos = pedidoRepository.findByUsuarioIdUsuario(usuario.getIdUsuario());
            pedido = pedidos.stream()
                    .max(Comparator.comparing(Pedido::getIdPedido))
                    .orElse(null);
        }

        if (pedido != null) {
            model.addAttribute("pedido", pedido);
            model.addAttribute("estado", pedido.getEstadoPedido());
            if (pedido.getRepartidor() != null) {
                model.addAttribute("motorizado", pedido.getRepartidor().getNombres() + " " + pedido.getRepartidor().getApellidos());
            } else {
                model.addAttribute("motorizado", "Pendiente de asignación");
            }
        } else {
            model.addAttribute("estado", "Pendiente");
            model.addAttribute("motorizado", "No asignado");
            model.addAttribute("pedido", null);
        }

        return "seguimiento";
    }
} 
