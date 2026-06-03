package com.appdelivery.app.controller;

import com.appdelivery.app.entity.Usuario;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PerfilController {

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

        model.addAttribute("totalPedidos", 0);
        model.addAttribute("ultimoPedido", "Ninguno");
        model.addAttribute("estadoCuenta", usuario.getEstado() ? "Activo" : "Inactivo");

        model.addAttribute("metodoPago", "Contraentrega");
        model.addAttribute("tipoUsuario", "Cliente");

        return "perfil"; 
    }
}