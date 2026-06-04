function initRegistro() {
    // Obtener el formulario principal de registro
    const form = document.getElementById('formRegistro');
    if (!form) return;
    
    // Elementos de radio para tipo de usuario y contenedor de opciones
    const radioCliente = document.getElementById('cliente');
    const radioMotorizado = document.getElementById('motorizado');
    const opcionesMotorizado = document.getElementById('opcionesMotorizado');
    
    // Configurar la visibilidad del panel de motorizado según la selección
    if (radioCliente && radioMotorizado) {
        radioCliente.addEventListener('change', function() {
            if (this.checked) {
                opcionesMotorizado.style.display = 'none';
            }
        });
        
        radioMotorizado.addEventListener('change', function() {
            if (this.checked) {
                opcionesMotorizado.style.display = 'block';
            }
        });
    }
    
    // Elementos para el tipo de vehículo
    const radioMoto = document.getElementById('moto');
    const radioCarro = document.getElementById('carro');
    const radioBicicleta = document.getElementById('bicicleta');
    const campoModelo = document.getElementById('campoModelo');
    
    // Mostrar campo del modelo del vehículo solo si es moto o carro
    function toggleCampoModelo() {
        if (radioMoto && radioCarro) {
            if (radioMoto.checked || radioCarro.checked) {
                campoModelo.style.display = 'block';
            } else {
                campoModelo.style.display = 'none';
            }
        }
    }
    
    if (radioMoto) radioMoto.addEventListener('change', toggleCampoModelo);
    if (radioCarro) radioCarro.addEventListener('change', toggleCampoModelo);
    if (radioBicicleta) radioBicicleta.addEventListener('change', toggleCampoModelo);
    
    // Manejo del evento de envío del formulario
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitar recarga de la página
        
        // Ejecutar validaciones del cliente antes de enviar
        if (!validarFormularioRegistro()) {
            mostrarToast('Por favor, corrige los errores en el formulario', 'error');
        } else {
            // Preparar datos para el envío mediante fetch
            const formData = new FormData(form);
            
            // Enviar petición asíncrona al backend
            fetch('/api/registro', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    mostrarToast('¡Registro exitoso! Ya puedes iniciar sesión', 'success');
                    form.reset();
                    if (opcionesMotorizado) opcionesMotorizado.style.display = 'none';
                    if (campoModelo) campoModelo.style.display = 'none';
                    
                    // Opcional: Redirigir al login después de 2 segundos
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else {
                    mostrarToast('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarToast('Error de conexión con el servidor', 'error');
            });
        }
    });
    
    // Filtro para el campo de teléfono (solo números, max 9)
    const telefonoInput = document.querySelector('[name="telefono"]');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
        });
    }
    
    // Filtro para el campo nombre (solo letras y espacios)
    const nombreInput = document.querySelector('[name="nombreCompleto"]');
    if (nombreInput) {
        nombreInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^a-zA-ZáéíóúñÑÁÉÍÓÚ\s]/g, '');
        });
    }
}

/**
 * Función que valida todos los campos del formulario de registro
 * @returns {boolean} true si todo es válido, de lo contrario false
 */
function validarFormularioRegistro() {
    let isValid = true;
    
    const nombre = document.querySelector('[name="nombreCompleto"]');
    if (nombre && nombre.value.trim().length < 3) {
        mostrarErrorRegistro('nombreCompleto', 'El nombre debe tener al menos 3 caracteres');
        isValid = false;
    } else if (nombre) {
        limpiarErrorRegistro('nombreCompleto');
    }
    
    const email = document.querySelector('[name="email"]');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email.value)) {
        mostrarErrorRegistro('email', 'Ingresa un correo electrónico válido');
        isValid = false;
    } else if (email) {
        limpiarErrorRegistro('email');
    }
    
    const password = document.querySelector('[name="password"]');
    if (password && password.value.length < 6) {
        mostrarErrorRegistro('password', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    } else if (password) {
        limpiarErrorRegistro('password');
    }
    
    const telefono = document.querySelector('[name="telefono"]');
    if (telefono && telefono.value.length < 9) {
        mostrarErrorRegistro('telefono', 'El teléfono debe tener al menos 9 dígitos');
        isValid = false;
    } else if (telefono) {
        limpiarErrorRegistro('telefono');
    }
    
    const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked');
    if (tipoUsuario && tipoUsuario.value === 'MOTORIZADO') {
        const tipoVehiculo = document.querySelector('input[name="tipoVehiculo"]:checked');
        if (!tipoVehiculo) {
            mostrarErrorRegistro('tipoVehiculo', 'Selecciona un tipo de vehículo');
            isValid = false;
        } else {
            limpiarErrorRegistro('tipoVehiculo');
        }
        
        const licencia = document.querySelector('[name="licencia"]');
        if (licencia && (!licencia.files || licencia.files.length === 0)) {
            mostrarErrorRegistro('licencia', 'Debes subir tu licencia');
            isValid = false;
        } else if (licencia && licencia.files[0] && licencia.files[0].size > 5 * 1024 * 1024) {
            mostrarErrorRegistro('licencia', 'La licencia no debe superar los 5MB');
            isValid = false;
        } else {
            limpiarErrorRegistro('licencia');
        }
        
        const tipoVehiculoSeleccionado = tipoVehiculo ? tipoVehiculo.value : null;
        const modelo = document.querySelector('[name="modeloVehiculo"]');
        if ((tipoVehiculoSeleccionado === 'MOTO' || tipoVehiculoSeleccionado === 'CARRO') && modelo && modelo.value.trim() === '') {
            mostrarErrorRegistro('modeloVehiculo', 'Ingresa el modelo de tu vehículo');
            isValid = false;
        } else if (modelo) {
            limpiarErrorRegistro('modeloVehiculo');
        }
    }
    
    return isValid;
}

function mostrarErrorRegistro(campo, mensaje) {
    const input = document.querySelector(`[name="${campo}"]`);
    if (!input) return;
    
    input.style.borderColor = '#ef4444';
    
    let errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) errorDiv.remove();
    
    errorDiv = document.createElement('small');
    errorDiv.className = 'error-message';
    errorDiv.innerText = mensaje;
    input.parentElement.appendChild(errorDiv);
}

function limpiarErrorRegistro(campo) {
    const input = document.querySelector(`[name="${campo}"]`);
    if (input) {
        input.style.borderColor = '';
        const errorDiv = input.parentElement.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
    }
}

function mostrarToast(mensaje, tipo = 'success') {
    const color = tipo === 'success' ? '#22c55e' : '#ef4444';
    const icono = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    const toast = document.createElement('div');
    toast.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; background: ${color}; color: white; padding: 12px 24px; border-radius: 12px; z-index: 9999; animation: slideIn 0.3s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
            <i class="fas ${icono}"></i> ${mensaje}
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', initRegistro);