package com.appdelivery.app.controller;

import com.appdelivery.app.entity.*;
import com.appdelivery.app.repository.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoRestController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private RestauranteRepository restauranteRepository;

    @Autowired
    private CategoriaProductoRepository categoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RepartidorRepository repartidorRepository;

    @GetMapping
    public List<Pedido> getAllPedidos() {
        return pedidoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getPedidoById(@PathVariable Integer id) {
        return pedidoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cambiar estado del pedido
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Integer id,
            @RequestParam String estado,
            @RequestParam(required = false) Integer repartidorId) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedido.setEstadoPedido(estado);
            
            if ("Entregado".equalsIgnoreCase(estado)) {
                pedido.setEstadoPago("Pagado");
            }
            
            if (repartidorId != null) {
                repartidorRepository.findById(repartidorId).ifPresent(pedido::setRepartidor);
            }
            
            Pedido actualizado = pedidoRepository.save(pedido);
            return ResponseEntity.ok(actualizado);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Crear un nuevo pedido
    @PostMapping
    public ResponseEntity<?> createPedido(@Valid @RequestBody PedidoRequest request, HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");
        if (usuario == null) {
            List<Usuario> usuarios = usuarioRepository.findAll();
            if (!usuarios.isEmpty()) {
                usuario = usuarios.get(0);
            } else {
                return ResponseEntity.badRequest().body("Debe iniciar sesión para realizar un pedido.");
            }
        }

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setDireccionEntrega(request.getDireccionEntrega() != null ? request.getDireccionEntrega() : usuario.getDireccion());
        pedido.setObservaciones(request.getObservaciones());
        pedido.setMetodoPago(request.getMetodoPago() != null ? request.getMetodoPago() : "Contraentrega");
        pedido.setEstadoPedido("Pendiente");
        pedido.setEstadoPago("Pendiente");
        pedido.setTotal(request.getTotal());

        Restaurante fallbackRestaurante = restauranteRepository.findAll().stream().findFirst().orElse(null);
        CategoriaProducto fallbackCategoria = categoriaRepository.findAll().stream().findFirst().orElse(null);

        List<DetallePedido> detalles = new ArrayList<>();
        for (PedidoItemRequest item : request.getItems()) {
            List<Producto> productos = productoRepository.findAll();
            Producto producto = productos.stream()
                    .filter(p -> p.getNombre().equalsIgnoreCase(item.getNombre()))
                    .findFirst()
                    .orElse(null);

            if (producto == null) {
                producto = new Producto();
                producto.setNombre(item.getNombre());
                producto.setPrecio(item.getPrecio());
                producto.setStock(50);
                producto.setDisponible(true);
                producto.setRestaurante(fallbackRestaurante);
                producto.setCategoria(fallbackCategoria);
                producto = productoRepository.save(producto);
            }

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(item.getPrecio());
            detalle.setSubtotal(item.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad())));
            detalles.add(detalle);
        }

        pedido.setDetalles(detalles);
        Pedido nuevoPedido = pedidoRepository.save(pedido);

        return ResponseEntity.status(201).body(nuevoPedido);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePedido(@PathVariable Integer id) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedidoRepository.delete(pedido);
            return ResponseEntity.ok().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePedido(@PathVariable Integer id, @Valid @RequestBody PedidoRequest request) {
        return pedidoRepository.findById(id).map(pedido -> {
            if (request.getDireccionEntrega() != null) {
                pedido.setDireccionEntrega(request.getDireccionEntrega());
            }
            if (request.getObservaciones() != null) {
                pedido.setObservaciones(request.getObservaciones());
            }
            if (request.getMetodoPago() != null) {
                pedido.setMetodoPago(request.getMetodoPago());
            }
            if (request.getTotal() != null) {
                pedido.setTotal(request.getTotal());
            }
            Pedido actualizado = pedidoRepository.save(pedido);
            return ResponseEntity.ok(actualizado);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public static class PedidoRequest {
        private String direccionEntrega;
        private String observaciones;
        private String metodoPago;
        
        @NotNull(message = "El total es obligatorio")
        @Min(value = 0, message = "El total no puede ser negativo")
        private BigDecimal total;
        
        @NotEmpty(message = "Debe haber al menos un item en el pedido")
        private List<PedidoItemRequest> items;

        public String getDireccionEntrega() { return direccionEntrega; }
        public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }
        public String getObservaciones() { return observaciones; }
        public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
        public String getMetodoPago() { return metodoPago; }
        public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
        public List<PedidoItemRequest> getItems() { return items; }
        public void setItems(List<PedidoItemRequest> items) { this.items = items; }
    }

    public static class PedidoItemRequest {
        @NotBlank(message = "El nombre del producto es obligatorio")
        private String nombre;
        
        @NotNull(message = "El precio es obligatorio")
        @Min(value = 0, message = "El precio no puede ser negativo")
        private BigDecimal precio;
        
        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        private Integer cantidad;

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public BigDecimal getPrecio() { return precio; }
        public void setPrecio(BigDecimal precio) { this.precio = precio; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }
}
