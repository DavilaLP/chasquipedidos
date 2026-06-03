package com.appdelivery.app.controller;

import com.appdelivery.app.entity.Repartidor;
import com.appdelivery.app.repository.RepartidorRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/repartidores")
public class RepartidorRestController {

    @Autowired
    private RepartidorRepository repartidorRepository;

    @GetMapping
    public List<Repartidor> getAllRepartidores() {
        return repartidorRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Repartidor> getRepartidorById(@PathVariable Integer id) {
        Optional<Repartidor> repartidor = repartidorRepository.findById(id);
        return repartidor.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Repartidor> createRepartidor(@Valid @RequestBody Repartidor repartidor) {
        if (repartidor.getEstado() == null) {
            repartidor.setEstado(true);
        }
        Repartidor nuevo = repartidorRepository.save(repartidor);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Repartidor> updateRepartidor(@PathVariable Integer id, @Valid @RequestBody Repartidor detalles) {
        return repartidorRepository.findById(id).map(repartidor -> {
            repartidor.setNombres(detalles.getNombres());
            repartidor.setApellidos(detalles.getApellidos());
            repartidor.setTelefono(detalles.getTelefono());
            repartidor.setVehiculo(detalles.getVehiculo());
            repartidor.setPlaca(detalles.getPlaca());
            repartidor.setEstado(detalles.getEstado());
            Repartidor actualizado = repartidorRepository.save(repartidor);
            return ResponseEntity.ok(actualizado);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepartidor(@PathVariable Integer id) {
        return repartidorRepository.findById(id).map(repartidor -> {
            repartidorRepository.delete(repartidor);
            return ResponseEntity.ok().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
