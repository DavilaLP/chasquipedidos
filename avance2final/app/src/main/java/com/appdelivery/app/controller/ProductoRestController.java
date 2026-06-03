package com.appdelivery.app.controller;

import com.appdelivery.app.entity.Producto;
import com.appdelivery.app.entity.Restaurante;
import com.appdelivery.app.entity.CategoriaProducto;
import com.appdelivery.app.repository.ProductoRepository;
import com.appdelivery.app.repository.RestauranteRepository;
import com.appdelivery.app.repository.CategoriaProductoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
public class ProductoRestController {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private RestauranteRepository restauranteRepository;

    @Autowired
    private CategoriaProductoRepository categoriaRepository;

    @GetMapping
    public List<Producto> getAllProductos() {
        return productoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable Integer id) {
        Optional<Producto> producto = productoRepository.findById(id);
        return producto.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createProducto(@Valid @RequestBody Producto producto) {
        if (producto.getRestaurante() == null || producto.getRestaurante().getIdRestaurante() == null) {
            return ResponseEntity.badRequest().body("El restaurante es obligatorio");
        }
        if (producto.getCategoria() == null || producto.getCategoria().getIdCategoria() == null) {
            return ResponseEntity.badRequest().body("La categoría es obligatoria");
        }

        Optional<Restaurante> restOpt = restauranteRepository.findById(producto.getRestaurante().getIdRestaurante());
        if (!restOpt.isPresent()) {
            return ResponseEntity.badRequest().body("El restaurante especificado no existe");
        }

        Optional<CategoriaProducto> catOpt = categoriaRepository.findById(producto.getCategoria().getIdCategoria());
        if (!catOpt.isPresent()) {
            return ResponseEntity.badRequest().body("La categoría especificada no existe");
        }

        producto.setRestaurante(restOpt.get());
        producto.setCategoria(catOpt.get());

        if (producto.getDisponible() == null) {
            producto.setDisponible(true);
        }

        Producto nuevoProducto = productoRepository.save(producto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProducto(@PathVariable Integer id, @Valid @RequestBody Producto detalles) {
        return productoRepository.findById(id).map(producto -> {
            producto.setNombre(detalles.getNombre());
            producto.setDescripcion(detalles.getDescripcion());
            producto.setPrecio(detalles.getPrecio());
            producto.setStock(detalles.getStock());
            producto.setDisponible(detalles.getDisponible());

            if (detalles.getRestaurante() != null && detalles.getRestaurante().getIdRestaurante() != null) {
                restauranteRepository.findById(detalles.getRestaurante().getIdRestaurante())
                        .ifPresent(producto::setRestaurante);
            }
            if (detalles.getCategoria() != null && detalles.getCategoria().getIdCategoria() != null) {
                categoriaRepository.findById(detalles.getCategoria().getIdCategoria())
                        .ifPresent(producto::setCategoria);
            }

            Producto actualizado = productoRepository.save(producto);
            return ResponseEntity.ok(actualizado);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable Integer id) {
        return productoRepository.findById(id).map(producto -> {
            productoRepository.delete(producto);
            return ResponseEntity.ok().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
