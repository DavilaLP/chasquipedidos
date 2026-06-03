package com.appdelivery.app.controller;

import com.appdelivery.app.entity.Restaurante;
import com.appdelivery.app.repository.RestauranteRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/restaurantes")
public class RestauranteRestController {

    @Autowired
    private RestauranteRepository restauranteRepository;

    // Obtener todos los restaurantes
    @GetMapping
    public List<Restaurante> getAllRestaurantes() {
        return restauranteRepository.findAll();
    }

    // Obtener restaurante por ID
    @GetMapping("/{id}")
    public ResponseEntity<Restaurante> getRestauranteById(@PathVariable Integer id) {
        Optional<Restaurante> restaurante = restauranteRepository.findById(id);
        return restaurante.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Crear un nuevo restaurante (POST)
    @PostMapping
    public ResponseEntity<Restaurante> createRestaurante(@Valid @RequestBody Restaurante restaurante) {
        if (restaurante.getEstado() == null) {
            restaurante.setEstado(true);
        }
        Restaurante nuevoRestaurante = restauranteRepository.save(restaurante);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRestaurante);
    }

    // Actualizar un restaurante (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Restaurante> updateRestaurante(@PathVariable Integer id, @Valid @RequestBody Restaurante detallesRestaurante) {
        return restauranteRepository.findById(id).map(restaurante -> {
            restaurante.setNombre(detallesRestaurante.getNombre());
            restaurante.setDireccion(detallesRestaurante.getDireccion());
            restaurante.setTelefono(detallesRestaurante.getTelefono());
            restaurante.setEstado(detallesRestaurante.getEstado());
            Restaurante restauranteActualizado = restauranteRepository.save(restaurante);
            return ResponseEntity.ok(restauranteActualizado);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Eliminar un restaurante (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRestaurante(@PathVariable Integer id) {
        return restauranteRepository.findById(id).map(restaurante -> {
            restauranteRepository.delete(restaurante);
            return ResponseEntity.ok().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
