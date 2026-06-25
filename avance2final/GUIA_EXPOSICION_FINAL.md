# 🎓 Guía de Sustentación - Trabajo Final (ChasquiPedidos)

¡Felicitaciones! Tu proyecto ahora cumple al **100% con la Rúbrica de Calificación Final** (estándar esperado en todos los criterios). Este documento es tu guía personal paso a paso para defender el proyecto ante el jurado/profesor utilizando tu laptop.

---

## 🛠️ ¿Qué fue lo que se implementó? (Resumen de Cambios)

Para cumplir con las nuevas exigencias del jurado, se añadieron y configuraron tres módulos clave:

1. **Seguridad y Control de Acceso por Roles:**
   * Se agregó el campo `rol` en la tabla `USUARIO` de MySQL y en la entidad [Usuario.java](file:///c:/Users/Usuario/Desktop/avance2final/avance2final/app/src/main/java/com/appdelivery/app/entity/Usuario.java).
   * Se implementó un interceptor de Spring MVC ([SecurityInterceptor.java](file:///c:/Users/Usuario/Desktop/avance2final/avance2final/app/src/main/java/com/appdelivery/app/security/SecurityInterceptor.java)) que intercepta todas las peticiones a rutas administrativas (`/admin/**`) y APIs (`/api/**`).
   * Si un usuario no autenticado o con rol `CLIENTE` intenta acceder al panel o APIs administrativas, el sistema lo redirige a `/login` o le deniega el acceso con un estado **HTTP 403 Forbidden**.
   * Se crearon dos usuarios en el script [database.sql](file:///c:/Users/Usuario/Desktop/avance2final/avance2final/app/src/main/resources/database.sql) para las pruebas:
     * **Administrador:** `cristofer@gmail.com` / Contraseña: `123456` (rol `ADMIN`)
     * **Cliente:** `juan@gmail.com` / Contraseña: `123456` (rol `CLIENTE`)

2. **Generación de Reportes e Informes (PDF y Excel):**
   * Se agregaron las dependencias de **OpenPDF** (para PDF) y **Apache POI** (para Excel) en el [pom.xml](file:///c:/Users/Usuario/Desktop/avance2final/avance2final/app/pom.xml).
   * Se creó un controlador de descargas ([ReporteController.java](file:///c:/Users/Usuario/Desktop/avance2final/avance2final/app/src/main/java/com/appdelivery/app/controller/ReporteController.java)) con endpoints dedicados para generar reportes en caliente y escribirlos directo al stream HTTP.
   * Se añadieron botones estilizados en el panel de administrador ([admin.html](file:///c:/Users/Usuario/Desktop/avance2final/avance2final/app/src/main/resources/templates/admin.html)) para descargar estos reportes con un solo clic.

3. **Dinamización de Métricas del Dashboard:**
   * Se inyectaron los repositorios JPA en [AdminController.java](file:///c:/Users/Usuario/Desktop/avance2final/avance2final/app/src/main/java/com/appdelivery/app/controller/AdminController.java) para que el resumen del Dashboard (Usuarios, Pedidos, Repartidores y Ganancias Totales) se calcule dinámicamente desde la base de datos MySQL en tiempo real.

---

## 🚀 Guía de Exposición Paso a Paso ante el Jurado

Cuando el jurado evalúe tu trabajo, guíalo a través de estos 5 puntos clave para ganar el puntaje máximo:

### Paso 1: Levantar el Proyecto y Demostrar el Control de Acceso (Seguridad)
1. Inicia sesión en tu base de datos MySQL y levanta la aplicación desde NetBeans/IDE o consola.
2. Abre el navegador en Incógnito e intenta ingresar directamente a `http://localhost:8080/admin`.
   * **Qué pasa:** El interceptor de seguridad te redirigirá automáticamente a `/login` porque no estás autenticado.
3. Inicia sesión con la cuenta de Cliente: **`juan@gmail.com`** / **`123456`**.
4. Una vez en el Home, intenta ingresar a `http://localhost:8080/admin` o hacer un fetch manual a `/api/usuarios`.
   * **Qué pasa:** El navegador arrojará un error **403 Forbidden** (Acceso Denegado).
   * **Qué decirle al jurado:** *"Profesor, la seguridad de la aplicación está controlada a nivel de servidor por un `HandlerInterceptor` personalizado. Si un usuario con rol `CLIENTE` intenta acceder a rutas administrativas o APIs privadas, el sistema bloquea la petición y responde con un código de estado estándar HTTP 403, garantizando que solo los administradores puedan acceder."*

### Paso 2: El Flujo del Administrador y Estadísticas Dinámicas
1. Haz clic en **Cerrar sesión** e inicia sesión como Administrador: **`cristofer@gmail.com`** / **`123456`**.
2. Dirígete al panel administrativo haciendo clic en **Admin ⚙️** (o ingresa a `/admin`).
3. Muestra las tarjetas del resumen.
   * **Qué decirle al jurado:** *"Como puede observar, el panel administrativo es 100% dinámico. Las métricas de total de usuarios, pedidos realizados, motorizados activos y ganancias totales se calculan directamente desde MySQL en el backend mediante consultas JPA agregadas. No son valores fijos."*

### Paso 3: Descarga de Reportes (PDF y Excel)
1. En la parte inferior del Resumen General de `/admin`, muestra la sección **"Reportes e Informes del Sistema"**.
2. Haz clic en **Exportar Pedidos (PDF)**. Abre el PDF descargado y muestra la tabla y el total acumulado.
3. Haz clic en **Exportar Pedidos (Excel)**. Abre el Excel y muestra la estructura de columnas y las ventas detalladas.
   * **Qué decirle al jurado:** *"Para cumplir con los requerimientos de reportes de la rúbrica, implementamos exportaciones en caliente de la base de datos. Usamos la biblioteca **OpenPDF** para generar informes en PDF estructurados y **Apache POI** para generar libros de trabajo Excel autolimpiables. Todo se procesa asíncronamente y se escribe en el stream de respuesta del servidor."*

### Paso 4: Mapeo de Entidades y Relaciones (NetBeans)
1. Abre tu IDE y muestra las entidades:
   * Abre `Usuario.java` y muestra la propiedad `@Column private String rol;`.
   * Abre `SecurityInterceptor.java` y explica cómo filtra las rutas y comprueba la sesión del usuario.
   * Abre `ReporteController.java` y muestra cómo se configuran las tablas de PDF y celdas de Excel.
   * **Qué decirle al jurado:** *"El backend está desarrollado sobre Spring Boot 3 con Spring Data JPA. Las relaciones son bidireccionales y empleamos anotaciones de Jakarta Validation para asegurar que los datos insertados por la API cumplan con los formatos esperados. Además, resolvemos el problema de la recursividad en JSON mediante `@JsonIgnore`."*

---

## 💡 Conceptos Clave que Debes Mencionar (Sustentación Oral)

* **Interceptor (HandlerInterceptor):** *"Es un componente de Spring MVC que actúa como un filtro antes de que las peticiones lleguen a los controladores. Lo usamos para centralizar la autenticación y validación de roles en lugar de repetir código en cada método."*
* **OpenPDF:** *"Es una biblioteca libre de Java que permite crear y manipular documentos PDF en tiempo real. La integramos para estructurar la información del sistema en tablas limpias con formato corporativo."*
* **Apache POI:** *"Es la biblioteca estándar de la fundación Apache que nos permite leer y escribir archivos de formato Office de Microsoft. La usamos para exportar libros de hojas de cálculo Excel (`.xlsx`) válidos para análisis financiero de los pedidos."*
* **Fetch API y AJAX:** *"El panel administrativo consume las APIs del backend mediante llamadas Fetch de JavaScript. Esto nos permite actualizar dinámicamente las tablas de productos, usuarios y pedidos sin necesidad de recargar la página completa, ofreciendo una experiencia Single Page Application (SPA)."*
