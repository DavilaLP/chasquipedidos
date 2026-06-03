-- Script de creación de la base de datos para ChasquiPedidos

-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS chasqui_pedidos_db;
USE chasqui_pedidos_db;

-- 2. Tabla USUARIO
CREATE TABLE USUARIO (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150),
    telefono VARCHAR(20),
    contrasena VARCHAR(255),
    direccion VARCHAR(255),
    fecha_regist DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN DEFAULT TRUE
);

-- 3. Tabla RESTAURANTE
CREATE TABLE RESTAURANTE (
    id_restaurante INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    estado BOOLEAN DEFAULT TRUE
);

-- 4. Tabla CATEGORIA_PRODUCTO
CREATE TABLE CATEGORIA_PRODUCTO (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- 5. Tabla PRODUCTO
CREATE TABLE PRODUCTO (
    id_producto INT PRIMARY KEY AUTO_INCREMENT,
    id_restaurante INT NOT NULL,
    id_categoria INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2),
    stock INT,
    disponible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_restaurante) REFERENCES RESTAURANTE(id_restaurante) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES CATEGORIA_PRODUCTO(id_categoria) ON DELETE CASCADE
);

-- 6. Tabla REPARTIDOR
CREATE TABLE REPARTIDOR (
    id_repartidor INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    vehiculo VARCHAR(50),
    placa VARCHAR(50),
    estado BOOLEAN DEFAULT TRUE
);

-- 7. Tabla PEDIDO
CREATE TABLE PEDIDO (
    id_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_repartidor INT,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2),
    estado_pedido VARCHAR(50),
    estado_pago VARCHAR(50),
    metodo_pago VARCHAR(50),
    direccion_entrega VARCHAR(255),
    observaciones TEXT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_repartidor) REFERENCES REPARTIDOR(id_repartidor) ON DELETE SET NULL
);

-- 8. Tabla DETALLE_PEDIDO
CREATE TABLE DETALLE_PEDIDO (
    id_detalle_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES PEDIDO(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto) ON DELETE CASCADE
);

-- ==========================================
-- 9. Datos de Prueba Iniciales (Seed Data)
-- ==========================================

-- 9.1. Insertar Categorías
INSERT INTO CATEGORIA_PRODUCTO (nombre, descripcion) VALUES
('Pizzas', 'Pizzas artesanales de diversos sabores'),
('Hamburguesas', 'Hamburguesas clásicas y gourmet con papas fritas'),
('Pollo', 'Pollo a la brasa y complementos tradicionales'),
('Bebidas', 'Gaseosas, jugos y aguas de mesa'),
('Postres', 'Pasteles, helados y dulces tradicionales');

-- 9.2. Insertar Restaurantes
INSERT INTO RESTAURANTE (nombre, direccion, telefono, estado) VALUES
('Pizzería Italia', 'Av. Cayma 405, Arequipa', '+51 987654321', 1),
('Burger House', 'Calle Mercaderes 112, Arequipa', '+51 987654322', 1),
('El Buen Pollo', 'Av. Ejército 510, Arequipa', '+51 987654323', 1),
('Dulce Pasión', 'Calle Jerusalén 204, Arequipa', '+51 987654324', 1);

-- 9.3. Insertar Productos
INSERT INTO PRODUCTO (id_restaurante, id_categoria, nombre, descripcion, precio, stock, disponible) VALUES
(1, 1, 'Pizza Pepperoni Familiar', 'Salsa de tomate, queso mozzarella y pepperoni abundante', 38.50, 20, 1),
(1, 1, 'Pizza Hawaiana Familiar', 'Salsa de tomate, queso mozzarella, jamón y piña', 35.00, 15, 1),
(2, 2, 'Hamburguesa Clásica con Queso', 'Carne de res de 150g, queso cheddar, lechuga, tomate y papas fritas', 18.90, 50, 1),
(2, 2, 'Hamburguesa Royal', 'Carne de res, queso cheddar, huevo frito, tocino y papas', 24.50, 30, 1),
(3, 3, '1/4 de Pollo a la Brasa', 'Un cuarto de pollo a la brasa con papas fritas y ensalada clásica', 22.00, 100, 1),
(3, 3, '1/2 de Pollo a la Brasa', 'Medio pollo a la brasa con papas fritas y ensalada clásica', 39.00, 50, 1),
(4, 5, 'Porción de Torta de Tres Leches', 'Torta húmeda tradicional de tres leches decorada con merengue', 12.50, 10, 1),
(1, 4, 'Inka Kola 1.5L', 'Bebida gasificada de sabor tradicional', 8.50, 200, 1),
(1, 4, 'Coca-Cola 1.5L', 'Bebida gasificada refrescante de extracto de cola', 8.50, 200, 1);

-- 9.4. Insertar Repartidores (Motorizados)
INSERT INTO REPARTIDOR (nombres, apellidos, telefono, vehiculo, placa, estado) VALUES
('Juan', 'Pérez Quispe', '+51 912345678', 'Motocicleta Honda', 'M156-XP', 1),
('Carlos', 'Gómez Torres', '+51 923456789', 'Motocicleta Yamaha', 'M203-TY', 1),
('Luis', 'Fernández Rivas', '+51 934567890', 'Bicicleta Eléctrica', 'B-987-LF', 1);

-- 9.5. Insertar un Usuario Cliente de prueba para login
INSERT INTO USUARIO (nombres, apellidos, correo, telefono, contrasena, direccion, estado) VALUES
('Cristofer', 'Huamani Mejia', 'cristofer@gmail.com', '+51 999888777', '123456', 'Av. Ejército 123, Arequipa', 1);

