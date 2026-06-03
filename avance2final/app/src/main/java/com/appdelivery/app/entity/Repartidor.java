package com.appdelivery.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.List;

@Entity
@Table(name = "REPARTIDOR")
public class Repartidor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_repartidor")
    private Integer idRepartidor;

    @NotBlank(message = "El nombre del repartidor es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombres;

    @NotBlank(message = "El apellido del repartidor es obligatorio")
    @Size(max = 100, message = "El apellido no puede superar los 100 caracteres")
    @Column(nullable = false, length = 100)
    private String apellidos;

    @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
    @Column(length = 20)
    private String telefono;

    @Size(max = 50, message = "El vehículo no puede superar los 50 caracteres")
    @Column(length = 50)
    private String vehiculo;

    @Size(max = 50, message = "La placa no puede superar los 50 caracteres")
    @Column(length = 50)
    private String placa;

    private Boolean estado;

    @OneToMany(mappedBy = "repartidor")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Pedido> pedidos;

    // Getters and Setters
    public Integer getIdRepartidor() { return idRepartidor; }
    public void setIdRepartidor(Integer idRepartidor) { this.idRepartidor = idRepartidor; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getVehiculo() { return vehiculo; }
    public void setVehiculo(String vehiculo) { this.vehiculo = vehiculo; }
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
    public List<Pedido> getPedidos() { return pedidos; }
    public void setPedidos(List<Pedido> pedidos) { this.pedidos = pedidos; }
}
