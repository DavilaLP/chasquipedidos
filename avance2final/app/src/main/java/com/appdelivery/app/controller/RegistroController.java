package com.appdelivery.app.controller;

import com.appdelivery.app.entity.Repartidor;
import com.appdelivery.app.entity.Usuario;
import com.appdelivery.app.repository.RepartidorRepository;
import com.appdelivery.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador encargado de manejar el registro de nuevos usuarios y repartidores.
 */
@Controller
public class RegistroController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RepartidorRepository repartidorRepository;
    
    @GetMapping("/registro")
    public String registro() {
        return "registro";
    }

    @PostMapping("/api/registro")
    @ResponseBody
    public Map<String, Object> procesarRegistro(
            @RequestParam String nombreCompleto,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String direccion,
            @RequestParam String telefono,
            @RequestParam String tipoUsuario,
            @RequestParam(required = false) String tipoVehiculo) {

        // Estructura para almacenar la respuesta JSON
        Map<String, Object> response = new HashMap<>();

        try {
            // Separar nombres y apellidos a partir del primer espacio encontrado
            String nombres = nombreCompleto;
            String apellidos = "";
            if (nombreCompleto.contains(" ")) {
                int firstSpace = nombreCompleto.indexOf(" ");
                nombres = nombreCompleto.substring(0, firstSpace);
                apellidos = nombreCompleto.substring(firstSpace + 1);
            }

            // Si el usuario es de tipo MOTORIZADO, se guarda también en la entidad Repartidor
            if ("MOTORIZADO".equals(tipoUsuario)) {
                Repartidor repartidor = new Repartidor();
                repartidor.setNombres(nombres);
                repartidor.setApellidos(apellidos);
                repartidor.setTelefono(telefono);
                repartidor.setVehiculo(tipoVehiculo);
                repartidor.setEstado(true); // Se marca como activo
                repartidorRepository.save(repartidor);
            }

            // Se crea y configura el objeto Usuario con los datos recibidos
            Usuario usuario = new Usuario();
            usuario.setNombres(nombres);
            usuario.setApellidos(apellidos);
            usuario.setCorreo(email);
            usuario.setContrasena(password);
            usuario.setDireccion(direccion);
            usuario.setTelefono(telefono);
            usuario.setFechaRegist(LocalDateTime.now()); // Fecha actual de registro
            usuario.setEstado(true); // Usuario activo
            usuario.setRol("CLIENTE"); // Rol por defecto

            // Guardar el usuario en la base de datos
            usuarioRepository.save(usuario);

            // Respuesta exitosa
            response.put("success", true);
            response.put("message", "Usuario registrado exitosamente");
        } catch (Exception e) {
            // En caso de error, responder con mensaje de fallo
            response.put("success", false);
            response.put("message", "Error al registrar: " + e.getMessage());
        }

        return response;
    }
}