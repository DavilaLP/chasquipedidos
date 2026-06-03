package com.appdelivery.app.repository;

import com.appdelivery.app.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByRestauranteIdRestaurante(Integer idRestaurante);
}
