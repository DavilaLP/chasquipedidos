# Guía de Sustentación del Proyecto (Puntaje Máximo)

Esta es tu guía paso a paso para que la leas y la uses mientras tienes tu laptop abierta. Sigue este orden exacto para demostrarle al profesor que dominas todos los puntos de la rúbrica.

---

## 1. ORM y Relaciones JPA (Mapeo de la Base de Datos)
*   **Lo que debes decir:** "Profesor, hemos implementado JPA e Hibernate para mapear nuestra base de datos relacional a objetos Java. Tenemos nuestras entidades principales conectadas."
*   **Lo que debes mostrar en NetBeans:**
    *   Abre el archivo `Pedido.java`.
    *   Muestra la línea donde dice `@ManyToOne` (relación con Usuario) y `@OneToMany` (relación con DetallePedido).
    *   **Punto clave:** "Como ve aquí, un Pedido pertenece a un Usuario, y un Pedido puede tener muchos Detalles, usando `mappedBy` para la bidireccionalidad."

## 2. Validaciones (Hibernate Validator)
*   **Lo que debes decir:** "Para proteger la integridad de los datos, hemos implementado validaciones directamente en las entidades usando las anotaciones de `jakarta.validation`."
*   **Lo que debes mostrar en NetBeans:**
    *   Abre el archivo `Producto.java` o `CategoriaProducto.java`.
    *   Muestra las anotaciones: `@NotBlank`, `@NotNull` y `@Min`.
    *   **Punto clave:** "Por ejemplo, aquí le decimos al sistema que el precio y el stock nunca pueden ser nulos, y el stock tiene un mínimo de 0 (`@Min(value = 0)`) para que no existan inventarios negativos."

## 3. APIs REST y CRUD Completo
*   **Lo que debes decir:** "Todas nuestras tablas principales cuentan con un CRUD completo expuesto a través de APIs RESTful en formato JSON."
*   **Lo que debes mostrar en NetBeans:**
    *   Abre el archivo `PedidoRestController.java`.
    *   Muestra cómo están estructurados los métodos.
    *   **Punto clave:** "Aquí tenemos el `@GetMapping` para listar, el `@PostMapping` para crear, y recientemente completamos el CRUD añadiendo `@PutMapping` para actualizar y `@DeleteMapping` para borrar. Además, note que en los métodos de creación usamos la etiqueta **`@Valid`** para forzar las validaciones."

## 4. Manejo Global de Errores (El Toque Profesional)
*   **Lo que debes decir:** "En lugar de que el servidor se caiga o devuelva errores feos de Java cuando alguien manda datos malos, creamos un interceptor global de excepciones."
*   **Lo que debes mostrar en NetBeans:**
    *   Abre el archivo `GlobalExceptionHandler.java`.
    *   **Punto clave:** "Con la anotación `@RestControllerAdvice`, capturamos la excepción `MethodArgumentNotValidException`. Así, si una validación falla, devolvemos un estado HTTP `400 Bad Request` con un JSON limpio indicando exactamente qué campo falló y por qué."

## 5. Demostración en Vivo (Postman)
*   **Lo que debes decir:** "Finalmente, para comprobar todo esto, podemos verlo funcionando en Postman."
*   **Lo que debes mostrar (abre Postman):**
    1.  **Muestra la validación:** Intenta crear un producto con stock negativo (`-5`). Dale a *Send* y muéstrale el error HTTP 400 y el mensaje JSON en pantalla. "Como ve, la validación no permite crear el producto".
    2.  **Muestra el POST:** Crea un pedido válido. Dale a *Send* y muéstrale el HTTP 201 Created.
    3.  **Muestra el DELETE:** Toma el ID de ese pedido que creaste y bórralo usando el método DELETE. Dale a *Send* y muéstrale el HTTP 200 OK. "Con esto demostramos que el ciclo CRUD funciona a la perfección."

---
*Si explicas estos 5 puntos mostrando el código y Postman, tienes garantizado el 20/20.*
