package com.appdelivery.app.controller;

import com.appdelivery.app.entity.*;
import com.appdelivery.app.repository.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<?> createPedido(@RequestBody PedidoRequest request, HttpSession session) {
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

    public static class PedidoRequest {
        private String direccionEntrega;
        private String observaciones;
        private String metodoPago;
        private BigDecimal total;
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
        private String nombre;
        private BigDecimal precio;
        private Integer cantidad;

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public BigDecimal getPrecio() { return precio; }
        public void setPrecio(BigDecimal precio) { this.precio = precio; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }
}
