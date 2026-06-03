package com.appdelivery.app.repository;

import com.appdelivery.app.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    List<Pedido> findByUsuarioIdUsuario(Integer idUsuario);
    List<Pedido> findByRepartidorIdRepartidor(Integer idRepartidor);
}
