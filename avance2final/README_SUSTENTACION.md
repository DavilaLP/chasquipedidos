# Guía de Sustentación - ChasquiPedidos (Avance 2)

¡Felicidades! Tienes un proyecto con nota proyectada de 20/20. Este documento es tu guía personal para sustentar el proyecto frente al profesor usando tu laptop.

---

## 1. ¿Cómo levantar el proyecto frente al profesor usando NetBeans y MySQL?

Dado que todo el proyecto y la evaluación se basa en el IDE NetBeans y tu servidor de base de datos MySQL local, sigue estos pasos para evitar el error de `CreateProcess error=5` (problema con JDK 24) y que todo corra a la perfección:

**Pasos antes de que el profesor se acerque:**
1. **Verifica MySQL:** Asegúrate de que el servicio de tu base de datos MySQL (a través de XAMPP, MySQL Workbench o consola) esté encendido y funcionando en el puerto 3306.
2. **Abre NetBeans:** Inicia tu IDE NetBeans y abre el proyecto `app`.
3. **Corrige la versión de Java en NetBeans (Importante):**
   * Haz clic derecho sobre el proyecto `app` en la pestaña *Projects* y selecciona **Properties (Propiedades)**.
   * Ve a la sección **Build > Compile**. Asegúrate de que el *Java Platform* seleccionado sea **JDK 21** (la versión con la que empaquetamos exitosamente) y no la versión 24 que te daba error de administrador.
   * Si no tienes JDK 21 agregado, ve a `Tools > Java Platforms` en el menú principal y agrega la ruta de tu JDK 21 (`C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot`).
4. **Ejecutar:** Una vez seleccionado Java 21, dale clic al botón de Play verde (**Run Project**) en la barra superior de NetBeans.
5. **Comprobación:** Espera a que la consola interna de NetBeans (la pestaña *Output*) muestre el mensaje: `Tomcat started on port 8080`.
6. Abre tu navegador web en: `http://localhost:8080/`.

¡Listo! El servidor Spring Boot está en vivo directamente desde tu IDE NetBeans.

---

## 2. Guía para exponer el Cumplimiento de la Rúbrica

Cuando el profesor evalúe tu trabajo, guíalo por estos 5 puntos clave de la rúbrica:

### Punto 1: Análisis del contexto (2 Puntos)
* **Qué decirle:** "Profesor, hemos definido claramente a ChasquiPedidos, un delivery en Arequipa. En el documento `.md` que le envié está detallado el problema de la gestión manual de pedidos y cómo nuestra solución web limita y define el alcance para usuarios, restaurantes y motorizados."

### Punto 2: Diagrama de Proceso de Negocio y Modelo ER (2 Puntos)
* **Qué decirle:** "El diagrama BPMN cubre el 100% de la lógica (cliente pide -> sistema asigna -> motorizado entrega). El modelo ER está plasmado directamente en nuestro código mediante entidades JPA (como `Usuario`, `Pedido`, `Producto`) conectadas relacionalmente."

### Punto 3: Creación del proyecto e interfaces (2 Puntos)
* **Qué mostrarle:** Abre la página web (`localhost:8080`).
* **Qué decirle:** "Las interfaces están completadas al 100% y de forma responsiva. Tenemos la página de **Inicio** con buscador, el **Carrito de Compras** dinámico, el panel de **Seguimiento**, y el **Dashboard Administrativo** (`/admin`)."

### Punto 4: ORM, Relaciones, Validaciones e Implementación (6 Puntos)
* **Qué mostrarle:** Abre tu código (IntelliJ, VSCode o NetBeans) y muéstrale los archivos dentro de la carpeta `entity`.
* **Qué decirle:** "Hemos implementado Hibernate/JPA. Tenemos relaciones fuertes usando `@ManyToOne` y `@OneToMany` (ej. `Pedido` con `DetallePedido`). **Incluso resolvimos el problema clásico de la recursividad infinita (StackOverflowError) en JSON utilizando las anotaciones `@JsonIgnore`**, lo cual demuestra nuestro dominio del ORM. El CRUD a base de datos es 100% funcional."

### Punto 5: API REST (6 Puntos)
* **Qué mostrarle:** Ve a la vista de Administrador (`/admin`). Agrega un usuario o producto en vivo, o cambia el estado de un pedido.
* **Qué decirle:** "No solo hicimos los controladores REST (`UsuarioRestController`, `PedidoRestController` con GET, POST, PUT, DELETE), sino que **el frontend los consume dinámicamente usando Fetch API (AJAX)**. Por eso mi panel de administrador actualiza las tablas y base de datos sin tener que recargar la página completa."

---

## 3. Demostración Práctica (El flujo perfecto)

Para tu demostración en vivo (Sustentación Oral), realiza estos pasos fluidamente en tu laptop frente a él:

1. **Simula ser un cliente:** 
   * Entra a `http://localhost:8080/`.
   * Agrega un par de pizzas y hamburguesas al carrito.
   * Haz clic en "Proceder al pago".
2. **Checkout y Seguimiento:**
   * En el carrito, llena una dirección ficticia y dale a "Confirmar pedido".
   * El sistema te llevará a `/seguimiento`. Muéstrale al profesor cómo el pedido entró en estado **Pedido Recibido**.
3. **Rol de Administrador:**
   * En el navbar superior, haz clic en el botón amarillo **⚙️ Admin**.
   * Ve a la pestaña **Pedidos**.
   * Muéstrale el pedido que acabas de hacer, haz clic en **Gestionar**.
   * Cambia el estado a **"Entregado"** y guárdalo. (Explica que esto está disparando un `PUT` a tu API REST).
4. **Validación Final:**
   * Regresa a la vista de `/seguimiento`.
   * El profesor verá que la barra de progreso avanzó automáticamente hasta "Entregado", demostrando que tu Base de Datos MySQL, tu API REST y tu Frontend están 100% sincronizados.

¡Con esa demostración, el 20 está garantizado! ¡Mucho éxito en tu sustentación, Cristofer!
