package com.appdelivery.app.controller;

import com.appdelivery.app.entity.Usuario;
import com.appdelivery.app.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioRestController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Obtener todos los usuarios
    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Integer id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        return usuario.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Crear un nuevo usuario (POST)
    @PostMapping
    public ResponseEntity<Usuario> createUsuario(@Valid @RequestBody Usuario usuario) {
        if (usuario.getEstado() == null) {
            usuario.setEstado(true);
        }
        Usuario nuevoUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }

    // Actualizar un usuario (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Integer id, @Valid @RequestBody Usuario detallesUsuario) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setNombres(detallesUsuario.getNombres());
            usuario.setApellidos(detallesUsuario.getApellidos());
            usuario.setCorreo(detallesUsuario.getCorreo());
            usuario.setTelefono(detallesUsuario.getTelefono());
            usuario.setContrasena(detallesUsuario.getContrasena());
            usuario.setDireccion(detallesUsuario.getDireccion());
            usuario.setEstado(detallesUsuario.getEstado());
            Usuario usuarioActualizado = usuarioRepository.save(usuario);
            return ResponseEntity.ok(usuarioActualizado);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Eliminar un usuario (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Integer id) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuarioRepository.delete(usuario);
            return ResponseEntity.ok().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
