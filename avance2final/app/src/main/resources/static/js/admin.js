let usuariosList = [];
let pedidosList = [];
let motorizadosList = [];
let productosList = [];
let categoriasList = [];
let restaurantesList = [];

// Lista estática de quejas para mantener el módulo visual de soporte
let quejasLista = [
    { id: 1, usuario: "Elena Castro", pedidoId: 102, motivo: "Retraso en la entrega", fecha: "15/01/2025", estado: "Pendiente" },
    { id: 2, usuario: "Mario Linares", pedidoId: 105, motivo: "Producto equivocado", fecha: "14/01/2025", estado: "Pendiente" },
    { id: 3, usuario: "Silvia Ponce", pedidoId: 101, motivo: "Maltrato del repartidor", fecha: "13/01/2025", estado: "En revisión" },
    { id: 4, usuario: "Rafael Soto", pedidoId: 104, motivo: "Comida fría", fecha: "12/01/2025", estado: "Resuelto" },
    { id: 5, usuario: "Daniela Flores", pedidoId: 107, motivo: "Faltó un producto", fecha: "11/01/2025", estado: "Pendiente" }
];

async function cargarDatos() {
    try {
        const [resUsers, resPedidos, resRepartidores, resProductos, resCategorias, resRestaurantes] = await Promise.all([
            fetch("/api/usuarios").then(r => r.json()),
            fetch("/api/pedidos").then(r => r.json()),
            fetch("/api/repartidores").then(r => r.json()),
            fetch("/api/productos").then(r => r.json()),
            fetch("/api/categorias").then(r => r.json()),
            fetch("/api/restaurantes").then(r => r.json())
        ]);

        usuariosList = resUsers;
        pedidosList = resPedidos;
        motorizadosList = resRepartidores;
        productosList = resProductos;
        categoriasList = resCategorias;
        restaurantesList = resRestaurantes;

        actualizarDashboard();
        renderAll();
    } catch (e) {
        console.error("Error cargando datos del API", e);
    }
}

function renderAll() {
    renderPedidos();
    renderMotorizados();
    renderQuejas();
    renderUsuarios();
    renderProductos();
    renderCategorias();
}

function actualizarDashboard() {
    document.getElementById("totalUsuarios").innerText = usuariosList.length;
    document.getElementById("totalPedidos").innerText = pedidosList.length;
    
    const activosCount = motorizadosList.filter(m => m.estado === true).length;
    document.getElementById("totalMotorizados").innerText = activosCount;
    
    let totalIngresos = pedidosList.reduce((sum, p) => sum + (p.total || 0), 0);
    document.getElementById("totalIngresos").innerText = `S/ ${totalIngresos.toFixed(2)}`;
    
    let pendientes = pedidosList.filter(p => p.estadoPedido === "Pendiente").length;
    let entregados = pedidosList.filter(p => p.estadoPedido === "Entregado").length;
    document.getElementById("pendientesCount").innerText = pendientes;
    document.getElementById("entregadosCount").innerText = entregados;
    
    let quejasPend = quejasLista.filter(q => q.estado !== "Resuelto").length;
    document.getElementById("quejasPendientes").innerText = quejasPend;
}

// ==========================================
// GESTIÓN DE PEDIDOS
// ==========================================
function renderPedidos() {
    const tbody = document.getElementById("tablaPedidos");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    pedidosList.forEach(p => {
        const est = p.estadoPedido || "Pendiente";
        const badgeClass = `badge ${est.toLowerCase().replace(/ /g, '-')}`;
        const clienteNom = p.usuario ? `${p.usuario.nombres} ${p.usuario.apellidos || ''}` : "Cliente Desconocido";
        const totalVal = p.total || 0;
        
        tbody.innerHTML += `
            <tr>
                <td>#${p.idPedido}</td>
                <td><i class="fas fa-user"></i> ${clienteNom}</td>
                <td><i class="fas fa-location-dot"></i> ${p.direccionEntrega || 'No especificada'}</td>
                <td><span class="${badgeClass}">${est}</span></td>
                <td><strong>S/ ${totalVal.toFixed(2)}</strong></td>
                <td>
                    <button onclick="verPedido(${p.idPedido})"><i class="fas fa-eye"></i> Gestionar</button>
                </td>
            </tr>
        `;
    });
}

function verPedido(id) {
    const pedido = pedidosList.find(p => p.idPedido === id);
    if (!pedido) return;

    const clienteNom = pedido.usuario ? `${pedido.usuario.nombres} ${pedido.usuario.apellidos || ''}` : "Desconocido";
    const totalVal = pedido.total || 0;

    let itemsHtml = "";
    if (pedido.detalles && pedido.detalles.length > 0) {
        pedido.detalles.forEach(det => {
            itemsHtml += `<li>${det.producto.nombre} (x${det.cantidad}) - S/ ${det.subtotal.toFixed(2)}</li>`;
        });
    } else {
        itemsHtml = "<li>Sin detalles registrados</li>";
    }

    let motorizadosSelect = `<option value="">Seleccionar Repartidor...</option>`;
    motorizadosList.forEach(m => {
        if (m.estado === true) {
            const selected = pedido.repartidor && pedido.repartidor.idRepartidor === m.idRepartidor ? "selected" : "";
            motorizadosSelect += `<option value="${m.idRepartidor}" ${selected}>${m.nombres} ${m.apellidos || ''}</option>`;
        }
    });

    const html = `
        <div style="text-align: left;">
            <p><b>Cliente:</b> ${clienteNom}</p>
            <p><b>Dirección:</b> ${pedido.direccionEntrega || 'No asignada'}</p>
            <p><b>Fecha:</b> ${pedido.fechaPedido || 'N/A'}</p>
            <p><b>Método de Pago:</b> ${pedido.metodoPago || 'Contraentrega'}</p>
            <p><b>Estado de Pago:</b> ${pedido.estadoPago || 'Pendiente'}</p>
            <p><b>Observaciones:</b> ${pedido.observaciones || 'Ninguna'}</p>
            
            <h4 style="margin-top: 15px; margin-bottom: 5px; color: #1e293b;">Productos:</h4>
            <ul>${itemsHtml}</ul>
            
            <h3 style="margin-top: 15px; color: #f97316;">Total: S/ ${totalVal.toFixed(2)}</h3>
            
            <hr style="margin: 15px 0; border: 0; border-top: 1px solid #e2e8f0;">
            
            <div class="form-group">
                <label>Cambiar Estado del Pedido</label>
                <select id="cambioEstadoSelect" onchange="guardarEstadoPedido(${pedido.idPedido})">
                    <option value="Pendiente" ${pedido.estadoPedido === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="Preparando pedido" ${pedido.estadoPedido === 'Preparando pedido' ? 'selected' : ''}>Preparando pedido</option>
                    <option value="En delivery" ${pedido.estadoPedido === 'En delivery' ? 'selected' : ''}>En delivery</option>
                    <option value="Entregado" ${pedido.estadoPedido === 'Entregado' ? 'selected' : ''}>Entregado</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Asignar Motorizado</label>
                <select id="cambioRepartidorSelect" onchange="guardarEstadoPedido(${pedido.idPedido})">
                    ${motorizadosSelect}
                </select>
            </div>
        </div>
    `;

    mostrarModal(`Detalle del Pedido #${pedido.idPedido}`, html);
}

async function guardarEstadoPedido(idPedido) {
    const estado = document.getElementById("cambioEstadoSelect").value;
    const repartidorId = document.getElementById("cambioRepartidorSelect").value;
    
    let url = `/api/pedidos/${idPedido}/estado?estado=${encodeURIComponent(estado)}`;
    if (repartidorId) {
        url += `&repartidorId=${repartidorId}`;
    }

    try {
        const response = await fetch(url, { method: "PUT" });
        if (response.ok) {
            cargarDatos();
            closeModal();
        } else {
            alert("Error al actualizar el estado del pedido.");
        }
    } catch (e) {
        console.error("Error al actualizar estado", e);
    }
}

// ==========================================
// GESTIÓN DE MOTORIZADOS
// ==========================================
function renderMotorizados() {
    const solicitudesDiv = document.getElementById("listaMotorizados");
    const activosDiv = document.getElementById("activosList");
    if (!solicitudesDiv || !activosDiv) return;

    solicitudesDiv.innerHTML = "";
    activosDiv.innerHTML = "";

    const solicitudes = motorizadosList.filter(m => m.estado === false);
    const activos = motorizadosList.filter(m => m.estado === true);

    solicitudes.forEach(m => {
        solicitudesDiv.innerHTML += `
            <div class="motor-card">
                <div class="motor-avatar"><i class="fas fa-user-clock"></i></div>
                <div class="motor-info">
                    <h4><i class="fas fa-user"></i> ${m.nombres} ${m.apellidos || ''}</h4>
                    <p><i class="fas fa-phone"></i> ${m.telefono || 'Sin teléfono'}</p>
                    <p><i class="fas fa-motorcycle"></i> Placa: ${m.placa || 'N/A'} (${m.vehiculo || 'N/A'})</p>
                    <span class="badge badge-pendiente">Pendiente de Aprobación</span>
                </div>
                <div class="motor-buttons" style="margin-top: 10px; display: flex; gap: 8px;">
                    <button onclick="aceptarMotorizado(${m.idRepartidor})"><i class="fas fa-check"></i> Aceptar</button>
                    <button class="btn-outline" onclick="rechazarMotorizado(${m.idRepartidor})"><i class="fas fa-times"></i> Rechazar</button>
                </div>
            </div>
        `;
    });

    if (solicitudes.length === 0) {
        solicitudesDiv.innerHTML = '<div class="card" style="text-align: center; width: 100%;">No hay solicitudes pendientes</div>';
    }

    activos.forEach(m => {
        activosDiv.innerHTML += `
            <div class="motor-card" style="background: linear-gradient(135deg, #f8fafc, #f1f5f9);">
                <div class="motor-avatar" style="background: #10b981;"><i class="fas fa-motorcycle"></i></div>
                <div class="motor-info">
                    <h4><i class="fas fa-user-check"></i> ${m.nombres} ${m.apellidos || ''}</h4>
                    <p><i class="fas fa-phone"></i> ${m.telefono || 'Sin teléfono'}</p>
                    <p><i class="fas fa-id-card"></i> Placa: ${m.placa || 'N/A'}</p>
                    <span class="badge badge-entregado">Activo</span>
                </div>
                <div style="margin-top: 10px; display: flex; gap: 8px;">
                    <button class="btn-outline" onclick="editarMotorizado(${m.idRepartidor})"><i class="fas fa-edit"></i> Editar</button>
                    <button style="background: #ef4444;" onclick="eliminarMotorizado(${m.idRepartidor})"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            </div>
        `;
    });

    if (activos.length === 0) {
        activosDiv.innerHTML = '<div class="card" style="text-align: center; width: 100%;">No hay motorizados activos</div>';
    }
}

async function aceptarMotorizado(id) {
    const motorizado = motorizadosList.find(m => m.idRepartidor === id);
    if (!motorizado) return;

    motorizado.estado = true;
    try {
        const response = await fetch(`/api/repartidores/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(motorizado)
        });

        if (response.ok) {
            cargarDatos();
            mostrarModal("Motorizado Aceptado", `Se aprobó la solicitud de ${motorizado.nombres}.`);
        }
    } catch (e) {
        console.error(e);
    }
}

async function rechazarMotorizado(id) {
    if (!confirm("¿Está seguro de rechazar y eliminar esta solicitud?")) return;
    try {
        const response = await fetch(`/api/repartidores/${id}`, { method: "DELETE" });
        if (response.ok) {
            cargarDatos();
        }
    } catch (e) {
        console.error(e);
    }
}

async function eliminarMotorizado(id) {
    if (!confirm("¿Está seguro de eliminar este motorizado?")) return;
    try {
        const response = await fetch(`/api/repartidores/${id}`, { method: "DELETE" });
        if (response.ok) {
            cargarDatos();
        }
    } catch (e) {
        console.error(e);
    }
}

function editarMotorizado(id) {
    const m = motorizadosList.find(r => r.idRepartidor === id);
    if (!m) return;

    const html = `
        <form onsubmit="guardarMotorizadoEdicion(event, ${m.idRepartidor})">
            <div class="form-group">
                <label>Nombres</label>
                <input type="text" id="editMotorNom" value="${m.nombres}" required>
            </div>
            <div class="form-group">
                <label>Apellidos</label>
                <input type="text" id="editMotorApe" value="${m.apellidos || ''}">
            </div>
            <div class="form-group">
                <label>Teléfono</label>
                <input type="text" id="editMotorTel" value="${m.telefono || ''}">
            </div>
            <div class="form-group">
                <label>Vehículo</label>
                <input type="text" id="editMotorVeh" value="${m.vehiculo || ''}">
            </div>
            <div class="form-group">
                <label>Placa</label>
                <input type="text" id="editMotorPla" value="${m.placa || ''}">
            </div>
            <button type="submit" style="width: 100%; justify-content: center; margin-top: 10px;">Guardar Cambios</button>
        </form>
    `;
    mostrarModal("Editar Motorizado", html);
}

async function guardarMotorizadoEdicion(e, id) {
    e.preventDefault();
    const payload = {
        nombres: document.getElementById("editMotorNom").value,
        apellidos: document.getElementById("editMotorApe").value,
        telefono: document.getElementById("editMotorTel").value,
        vehiculo: document.getElementById("editMotorVeh").value,
        placa: document.getElementById("editMotorPla").value,
        estado: true
    };

    try {
        const response = await fetch(`/api/repartidores/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            cargarDatos();
            closeModal();
        } else {
            alert("Error al actualizar motorizado");
        }
    } catch (err) {
        console.error(err);
    }
}

// ==========================================
// GESTIÓN DE QUEJAS
// ==========================================
function renderQuejas() {
    const container = document.getElementById("quejasContainer");
    if (!container) return;
    
    container.innerHTML = '<div class="quejas-list"></div>';
    const quejasListDiv = container.querySelector(".quejas-list");
    
    quejasLista.forEach(q => {
        const estadoClass = q.estado === "Resuelto" ? "badge-resuelto" : 
                            (q.estado === "Pendiente" ? "badge-pendiente" : "badge-en-revisión");
        quejasListDiv.innerHTML += `
            <div class="queja-item">
                <div style="flex:1">
                    <strong><i class="fas fa-user-circle"></i> ${q.usuario}</strong> 
                    <span style="color:#f97316;">| Pedido #${q.pedidoId}</span><br>
                    <small><i class="fas fa-calendar"></i> ${q.fecha} | ${q.motivo}</small>
                    <div style="margin-top: 8px;"><span class="badge ${estadoClass}">${q.estado}</span></div>
                </div>
                ${q.estado !== "Resuelto" ? 
                    `<button onclick="resolverQueja(${q.id})"><i class="fas fa-check-double"></i> Resolver</button>` : 
                    `<span style="color:#10b981;"><i class="fas fa-check-circle"></i> Resuelta</span>`}
            </div>
        `;
    });
}

function resolverQueja(id) {
    const queja = quejasLista.find(q => q.id === id);
    if (queja) {
        queja.estado = "Resuelto";
        renderQuejas();
        actualizarDashboard();
        mostrarModal("Soporte Técnico", `Se resolvió la queja del usuario ${queja.usuario}.`);
    }
}

// ==========================================
// GESTIÓN DE USUARIOS
// ==========================================
function renderUsuarios() {
    const container = document.getElementById("usuariosLista");
    if (!container) return;
    container.innerHTML = "";

    usuariosList.forEach(u => {
        const rol = u.estado === false ? "Inactivo" : "Usuario";
        const rolColor = u.estado === false ? "#ef4444" : "#3b82f6";
        const correoVal = u.correo || 'Sin correo';
        const telfVal = u.telefono || 'Sin teléfono';
        const nombreCompleto = `${u.nombres} ${u.apellidos || ''}`;

        container.innerHTML += `
            <div class="usuario-row">
                <i class="fas fa-user-circle fa-2x" style="color: ${rolColor};"></i>
                <div style="flex:1">
                    <b>${nombreCompleto}</b> 
                    <span style="color: ${rolColor}; font-size: 0.8rem;">(${u.estado ? 'Activo' : 'Inactivo'})</span><br>
                    <small><i class="fas fa-envelope"></i> ${correoVal} | <i class="fas fa-phone"></i> ${telfVal}</small>
                </div>
                <div style="text-align: right; display: flex; gap: 8px;">
                    <button onclick="verUsuario(${u.idUsuario})"><i class="fas fa-edit"></i> Gestionar</button>
                    <button style="background: #ef4444;" onclick="eliminarUsuario(${u.idUsuario})"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            </div>
        `;
    });
}

function verUsuario(id) {
    const u = usuariosList.find(user => user.idUsuario === id);
    if (!u) return;

    const html = `
        <form onsubmit="guardarUsuarioEdicion(event, ${u.idUsuario})">
            <div class="form-group">
                <label>Nombres</label>
                <input type="text" id="editUserNom" value="${u.nombres}" required>
            </div>
            <div class="form-group">
                <label>Apellidos</label>
                <input type="text" id="editUserApe" value="${u.apellidos || ''}">
            </div>
            <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" id="editUserCorr" value="${u.correo || ''}" required>
            </div>
            <div class="form-group">
                <label>Teléfono</label>
                <input type="text" id="editUserTel" value="${u.telefono || ''}">
            </div>
            <div class="form-group">
                <label>Dirección</label>
                <input type="text" id="editUserDir" value="${u.direccion || ''}">
            </div>
            <div class="form-group">
                <label>Estado</label>
                <select id="editUserEst">
                    <option value="true" ${u.estado === true ? 'selected' : ''}>Activo</option>
                    <option value="false" ${u.estado === false ? 'selected' : ''}>Inactivo</option>
                </select>
            </div>
            <!-- Contraseña oculta de respaldo -->
            <input type="hidden" id="editUserPass" value="${u.contrasena || '123456'}">
            
            <button type="submit" style="width: 100%; justify-content: center; margin-top: 10px;">Guardar Cambios</button>
        </form>
    `;

    mostrarModal("Editar Usuario", html);
}

async function guardarUsuarioEdicion(e, id) {
    e.preventDefault();
    const payload = {
        nombres: document.getElementById("editUserNom").value,
        apellidos: document.getElementById("editUserApe").value,
        correo: document.getElementById("editUserCorr").value,
        telefono: document.getElementById("editUserTel").value,
        direccion: document.getElementById("editUserDir").value,
        estado: document.getElementById("editUserEst").value === "true",
        contrasena: document.getElementById("editUserPass").value
    };

    try {
        const response = await fetch(`/api/usuarios/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            cargarDatos();
            closeModal();
        } else {
            alert("Error al actualizar datos del usuario.");
        }
    } catch (err) {
        console.error(err);
    }
}

async function eliminarUsuario(id) {
    if (!confirm("¿Está seguro de eliminar permanentemente este usuario?")) return;
    try {
        const response = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
        if (response.ok) {
            cargarDatos();
        } else {
            alert("Error al eliminar usuario.");
        }
    } catch (e) {
        console.error(e);
    }
}

// ==========================================
// GESTIÓN DE PRODUCTOS
// ==========================================
function renderProductos() {
    const tbody = document.getElementById("tablaProductos");
    if (!tbody) return;
    tbody.innerHTML = "";

    productosList.forEach(p => {
        const catNom = p.categoria ? p.categoria.nombre : "Sin categoría";
        const restNom = p.restaurante ? p.restaurante.nombre : "Sin restaurante";
        const precVal = p.precio || 0;
        
        tbody.innerHTML += `
            <tr class="prod-row" data-name="${p.nombre.toLowerCase()}">
                <td>#${p.idProducto}</td>
                <td><b>${p.nombre}</b></td>
                <td>S/ ${precVal.toFixed(2)}</td>
                <td>${p.stock || 0}</td>
                <td>${catNom}</td>
                <td>${restNom}</td>
                <td style="display: flex; gap: 8px;">
                    <button class="btn-outline" onclick="editarProducto(${p.idProducto})"><i class="fas fa-edit"></i></button>
                    <button style="background: #ef4444;" onclick="eliminarProducto(${p.idProducto})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function filtrarProductosAdmin() {
    const val = document.getElementById("buscarAdminProductos").value.toLowerCase().trim();
    document.querySelectorAll(".prod-row").forEach(row => {
        const name = row.getAttribute("data-name");
        row.style.display = name.includes(val) ? "" : "none";
    });
}

function nuevoProducto() {
    let restOpts = "";
    restaurantesList.forEach(r => {
        restOpts += `<option value="${r.idRestaurante}">${r.nombre}</option>`;
    });

    let catOpts = "";
    categoriasList.forEach(c => {
        catOpts += `<option value="${c.idCategoria}">${c.nombre}</option>`;
    });

    const html = `
        <form onsubmit="guardarProducto(event)">
            <div class="form-group">
                <label>Nombre del Producto</label>
                <input type="text" id="prodNom" placeholder="Ej: Pizza Americana" required>
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea id="prodDesc" placeholder="Detalles de ingredientes..."></textarea>
            </div>
            <div class="form-group" style="display: flex; gap: 10px;">
                <div style="flex:1;">
                    <label>Precio (S/)</label>
                    <input type="number" step="0.1" id="prodPrec" value="15.0" required>
                </div>
                <div style="flex:1;">
                    <label>Stock</label>
                    <input type="number" id="prodStock" value="50" required>
                </div>
            </div>
            <div class="form-group">
                <label>Categoría</label>
                <select id="prodCat" required>${catOpts}</select>
            </div>
            <div class="form-group">
                <label>Restaurante</label>
                <select id="prodRest" required>${restOpts}</select>
            </div>
            <button type="submit" style="width: 100%; justify-content: center; margin-top: 10px;">Crear Producto</button>
        </form>
    `;
    mostrarModal("Nuevo Producto", html);
}

async function guardarProducto(e) {
    e.preventDefault();
    const payload = {
        nombre: document.getElementById("prodNom").value,
        descripcion: document.getElementById("prodDesc").value,
        precio: parseFloat(document.getElementById("prodPrec").value),
        stock: parseInt(document.getElementById("prodStock").value),
        disponible: true,
        restaurante: { idRestaurante: parseInt(document.getElementById("prodRest").value) },
        categoria: { idCategoria: parseInt(document.getElementById("prodCat").value) }
    };

    try {
        const response = await fetch("/api/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            cargarDatos();
            closeModal();
        } else {
            alert("Error al guardar producto.");
        }
    } catch (err) {
        console.error(err);
    }
}

function editarProducto(id) {
    const p = productosList.find(prod => prod.idProducto === id);
    if (!p) return;

    let restOpts = "";
    restaurantesList.forEach(r => {
        const sel = p.restaurante && p.restaurante.idRestaurante === r.idRestaurante ? "selected" : "";
        restOpts += `<option value="${r.idRestaurante}" ${sel}>${r.nombre}</option>`;
    });

    let catOpts = "";
    categoriasList.forEach(c => {
        const sel = p.categoria && p.categoria.idCategoria === c.idCategoria ? "selected" : "";
        catOpts += `<option value="${c.idCategoria}" ${sel}>${c.nombre}</option>`;
    });

    const html = `
        <form onsubmit="guardarProductoEdicion(event, ${p.idProducto})">
            <div class="form-group">
                <label>Nombre del Producto</label>
                <input type="text" id="editProdNom" value="${p.nombre}" required>
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea id="editProdDesc">${p.descripcion || ''}</textarea>
            </div>
            <div class="form-group" style="display: flex; gap: 10px;">
                <div style="flex:1;">
                    <label>Precio (S/)</label>
                    <input type="number" step="0.1" id="editProdPrec" value="${p.precio}" required>
                </div>
                <div style="flex:1;">
                    <label>Stock</label>
                    <input type="number" id="editProdStock" value="${p.stock || 0}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Categoría</label>
                <select id="editProdCat" required>${catOpts}</select>
            </div>
            <div class="form-group">
                <label>Restaurante</label>
                <select id="editProdRest" required>${restOpts}</select>
            </div>
            <button type="submit" style="width: 100%; justify-content: center; margin-top: 10px;">Guardar Cambios</button>
        </form>
    `;
    mostrarModal("Editar Producto", html);
}

async function guardarProductoEdicion(e, id) {
    e.preventDefault();
    const payload = {
        nombre: document.getElementById("editProdNom").value,
        descripcion: document.getElementById("editProdDesc").value,
        precio: parseFloat(document.getElementById("editProdPrec").value),
        stock: parseInt(document.getElementById("editProdStock").value),
        disponible: true,
        restaurante: { idRestaurante: parseInt(document.getElementById("editProdRest").value) },
        categoria: { idCategoria: parseInt(document.getElementById("editProdCat").value) }
    };

    try {
        const response = await fetch(`/api/productos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            cargarDatos();
            closeModal();
        } else {
            alert("Error al actualizar producto.");
        }
    } catch (err) {
        console.error(err);
    }
}

async function eliminarProducto(id) {
    if (!confirm("¿Está seguro de eliminar este producto?")) return;
    try {
        const response = await fetch(`/api/productos/${id}`, { method: "DELETE" });
        if (response.ok) {
            cargarDatos();
        } else {
            alert("Error al eliminar producto.");
        }
    } catch (e) {
        console.error(e);
    }
}

// ==========================================
// GESTIÓN DE CATEGORÍAS
// ==========================================
function renderCategorias() {
    const tbody = document.getElementById("tablaCategorias");
    if (!tbody) return;
    tbody.innerHTML = "";

    categoriasList.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>#${c.idCategoria}</td>
                <td><b>${c.nombre}</b></td>
                <td>${c.descripcion || 'Sin descripción'}</td>
                <td style="display: flex; gap: 8px;">
                    <button class="btn-outline" onclick="editarCategoria(${c.idCategoria})"><i class="fas fa-edit"></i></button>
                    <button style="background: #ef4444;" onclick="eliminarCategoria(${c.idCategoria})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function nuevaCategoria() {
    const html = `
        <form onsubmit="guardarCategoria(event)">
            <div class="form-group">
                <label>Nombre de la Categoría</label>
                <input type="text" id="catNom" placeholder="Ej: Bebidas" required>
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea id="catDesc" placeholder="Gaseosas, cervezas, etc..."></textarea>
            </div>
            <button type="submit" style="width: 100%; justify-content: center; margin-top: 10px;">Crear Categoría</button>
        </form>
    `;
    mostrarModal("Nueva Categoría", html);
}

async function guardarCategoria(e) {
    e.preventDefault();
    const payload = {
        nombre: document.getElementById("catNom").value,
        descripcion: document.getElementById("catDesc").value
    };

    try {
        const response = await fetch("/api/categorias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            cargarDatos();
            closeModal();
        } else {
            alert("Error al guardar categoría.");
        }
    } catch (err) {
        console.error(err);
    }
}

function editarCategoria(id) {
    const c = categoriasList.find(cat => cat.idCategoria === id);
    if (!c) return;

    const html = `
        <form onsubmit="guardarCategoriaEdicion(event, ${c.idCategoria})">
            <div class="form-group">
                <label>Nombre de la Categoría</label>
                <input type="text" id="editCatNom" value="${c.nombre}" required>
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea id="editCatDesc">${c.descripcion || ''}</textarea>
            </div>
            <button type="submit" style="width: 100%; justify-content: center; margin-top: 10px;">Guardar Cambios</button>
        </form>
    `;
    mostrarModal("Editar Categoría", html);
}

async function guardarCategoriaEdicion(e, id) {
    e.preventDefault();
    const payload = {
        nombre: document.getElementById("editCatNom").value,
        descripcion: document.getElementById("editCatDesc").value
    };

    try {
        const response = await fetch(`/api/categorias/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            cargarDatos();
            closeModal();
        } else {
            alert("Error al actualizar categoría.");
        }
    } catch (err) {
        console.error(err);
    }
}

async function eliminarCategoria(id) {
    if (!confirm("¿Está seguro de eliminar esta categoría?")) return;
    try {
        const response = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
        if (response.ok) {
            cargarDatos();
        } else {
            alert("Error al eliminar categoría.");
        }
    } catch (e) {
        console.error(e);
    }
}

// ==========================================
// MODAL & NAVEGACIÓN
// ==========================================
function mostrarModal(titulo, contenidoHtml) {
    const modalBody = document.getElementById("modalBody");
    modalBody.innerHTML = `<h3 style="color:#f97316; margin-bottom: 15px;">${titulo}</h3><div style="margin-top: 10px; line-height: 1.6;">${contenidoHtml}</div>`;
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

window.onclick = function(e) {
    const modal = document.getElementById("modal");
    if (e.target === modal) closeModal();
}

window.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
});

// Registrar funciones globales para interactuar con botones onclick en HTML
window.showSection = showSection;
window.verPedido = verPedido;
window.guardarEstadoPedido = guardarEstadoPedido;
window.aceptarMotorizado = aceptarMotorizado;
window.rechazarMotorizado = rechazarMotorizado;
window.editarMotorizado = editarMotorizado;
window.eliminarMotorizado = eliminarMotorizado;
window.guardarMotorizadoEdicion = guardarMotorizadoEdicion;
window.resolverQueja = resolverQueja;
window.verUsuario = verUsuario;
window.guardarUsuarioEdicion = guardarUsuarioEdicion;
window.eliminarUsuario = eliminarUsuario;
window.filtrarProductosAdmin = filtrarProductosAdmin;
window.nuevoProducto = nuevoProducto;
window.guardarProducto = guardarProducto;
window.editarProducto = editarProducto;
window.guardarProductoEdicion = guardarProductoEdicion;
window.eliminarProducto = eliminarProducto;
window.nuevaCategoria = nuevaCategoria;
window.guardarCategoria = guardarCategoria;
window.editarCategoria = editarCategoria;
window.guardarCategoriaEdicion = guardarCategoriaEdicion;
window.eliminarCategoria = eliminarCategoria;
window.closeModal = closeModal;