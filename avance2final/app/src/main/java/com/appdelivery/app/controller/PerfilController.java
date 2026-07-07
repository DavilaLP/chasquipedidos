package com.appdelivery.app.controller;

import com.appdelivery.app.entity.Pedido;
import com.appdelivery.app.entity.Usuario;
import com.appdelivery.app.repository.PedidoRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Comparator;
import java.util.List;

@Controller
public class PerfilController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @GetMapping("/perfil")
    public String verPerfil(HttpSession session, Model model) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuario == null) {
            return "redirect:/login"; 
        }

        model.addAttribute("nombre", usuario.getNombres() + " " + (usuario.getApellidos() != null ? usuario.getApellidos() : ""));
        model.addAttribute("email", usuario.getCorreo());
        model.addAttribute("telefono", usuario.getTelefono() != null ? usuario.getTelefono() : "No registrado");
        model.addAttribute("direccion", usuario.getDireccion() != null ? usuario.getDireccion() : "No registrada");

        // Obtener historial de pedidos del usuario
        List<Pedido> pedidos = pedidoRepository.findByUsuarioIdUsuario(usuario.getIdUsuario());
        model.addAttribute("totalPedidos", pedidos.size());

        String ultimoPedidoStr = "Ninguno";
        if (!pedidos.isEmpty()) {
            Pedido ultimo = pedidos.stream()
                    .max(Comparator.comparing(Pedido::getIdPedido))
                    .orElse(null);
            if (ultimo != null) {
                ultimoPedidoStr = "Pedido #" + ultimo.getIdPedido() + " (" + ultimo.getEstadoPedido() + ")";
            }
        }
        model.addAttribute("ultimoPedido", ultimoPedidoStr);
        model.addAttribute("pedidos", pedidos);
        
        model.addAttribute("estadoCuenta", usuario.getEstado() != null && usuario.getEstado() ? "Activo" : "Inactivo");

        model.addAttribute("metodoPago", "Contraentrega");
        model.addAttribute("tipoUsuario", usuario.getRol() != null ? usuario.getRol() : "Cliente");

        return "perfil"; 
    }
}