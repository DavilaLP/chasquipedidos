package com.appdelivery.app.controller;

import com.appdelivery.app.entity.CategoriaProducto;
import com.appdelivery.app.repository.CategoriaProductoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaProductoRestController {

    @Autowired
    private CategoriaProductoRepository categoriaRepository;

    @GetMapping
    public List<CategoriaProducto> getAllCategorias() {
        return categoriaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaProducto> getCategoriaById(@PathVariable Integer id) {
        Optional<CategoriaProducto> categoria = categoriaRepository.findById(id);
        return categoria.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CategoriaProducto> createCategoria(@Valid @RequestBody CategoriaProducto categoria) {
        CategoriaProducto nuevaCategoria = categoriaRepository.save(categoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCategoria);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaProducto> updateCategoria(@PathVariable Integer id, @Valid @RequestBody CategoriaProducto detallesCategoria) {
        return categoriaRepository.findById(id).map(categoria -> {
            categoria.setNombre(detallesCategoria.getNombre());
            categoria.setDescripcion(detallesCategoria.getDescripcion());
            CategoriaProducto categoriaActualizada = categoriaRepository.save(categoria);
            return ResponseEntity.ok(categoriaActualizada);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategoria(@PathVariable Integer id) {
        return categoriaRepository.findById(id).map(categoria -> {
            categoriaRepository.delete(categoria);
            return ResponseEntity.ok().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
