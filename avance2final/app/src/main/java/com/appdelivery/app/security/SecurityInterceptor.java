package com.appdelivery.app.security;

import com.appdelivery.app.entity.Usuario;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class SecurityInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        HttpSession session = request.getSession(false);
        Usuario usuario = (session != null) ? (Usuario) session.getAttribute("usuarioLogueado") : null;

        // Rutas que requieren rol ADMIN
        if (uri.startsWith("/admin") || uri.startsWith("/api/usuarios") || uri.startsWith("/api/restaurantes") || uri.startsWith("/api/categorias") || uri.startsWith("/api/repartidores")) {
            // Permitir creación de usuario pública para el registro
            if (uri.equals("/api/usuarios") && "POST".equalsIgnoreCase(request.getMethod())) {
                return true;
            }
            
            if (usuario == null) {
                response.sendRedirect("/login");
                return false;
            }
            
            if (!"ADMIN".equalsIgnoreCase(usuario.getRol())) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Acceso denegado: Se requiere rol de Administrador");
                return false;
            }
        }
        
        // Rutas que requieren estar autenticado (CLIENTE o ADMIN)
        if (uri.startsWith("/carrito") || uri.startsWith("/seguimiento") || uri.startsWith("/perfil") || (uri.startsWith("/api/pedidos") && !"GET".equalsIgnoreCase(request.getMethod()))) {
            if (usuario == null) {
                response.sendRedirect("/login");
                return false;
            }
        }

        return true;
    }
}
