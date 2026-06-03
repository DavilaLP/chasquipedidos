let cart = [];

function loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error("Error al parsear el carrito", e);
            cart = [];
        }
    }
    renderCart();
}

function renderCart() {
    const cartPanel = document.querySelector(".cart-panel");
    if (!cartPanel) return;

    const headerHtml = `
        <div class="panel-header">
            <h2>Tu pedido</h2>
            <span>${cart.length} productos</span>
        </div>
    `;

    if (cart.length === 0) {
        cartPanel.innerHTML = headerHtml + `
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">Tu carrito está vacío</p>
                <a href="/" class="btn btn-primary" style="background: #3b82f6; border: none; padding: 8px 16px; border-radius: 6px; text-decoration: none; color: white;">Volver al catálogo</a>
            </div>
        `;
        updateTotal();
        return;
    }

    let itemsHtml = "";
    cart.forEach((item, index) => {
        const imgUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop";
        itemsHtml += `
            <div class="cart-item" data-index="${index}">
                <img src="${imgUrl}" alt="${item.name}">
                <div class="item-content">
                    <h4>${item.name}</h4>
                    <p>Entrega rápida</p>
                    <div class="quantity">
                        <button onclick="changeQty(${index}, -1)">-</button>
                        <span class="qty">${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="item-price">S/ ${item.price.toFixed(2)}</div>
                <button onclick="removeItem(${index})">✕</button>
            </div>
        `;
    });

    cartPanel.innerHTML = headerHtml + itemsHtml;
    updateTotal();
}

function updateTotal() {
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    const subtotalEl = document.querySelectorAll(".total-row span")[1];
    const deliveryEl = document.querySelectorAll(".total-row span")[3];
    const finalEl = document.querySelector(".final-total span:last-child");

    const delivery = cart.length > 0 ? 8 : 0;
    const finalTotal = total + delivery;

    if (subtotalEl) subtotalEl.innerText = "S/ " + total.toFixed(2);
    if (deliveryEl) deliveryEl.innerText = "S/ " + delivery.toFixed(2);
    if (finalEl) finalEl.innerText = "S/ " + finalTotal.toFixed(2);
}

function changeQty(index, change) {
    if (cart[index]) {
        cart[index].quantity = Math.max(1, cart[index].quantity + change);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
}

function removeItem(index) {
    if (cart[index]) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
}

async function procesarPedido() {
    if (cart.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const addressInput = document.querySelector(".address-box input");
    const referenceInput = document.querySelector(".address-box textarea");

    const addressVal = addressInput ? addressInput.value.trim() : "";
    const referenceVal = referenceInput ? referenceInput.value.trim() : "";

    if (!addressVal) {
        alert("Por favor, ingresa tu dirección de entrega.");
        if (addressInput) addressInput.focus();
        return;
    }

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    const finalTotal = total + (cart.length > 0 ? 8 : 0);

    const payload = {
        direccionEntrega: addressVal,
        observaciones: referenceVal,
        metodoPago: "Contraentrega",
        total: finalTotal,
        items: cart.map(item => ({
            nombre: item.name,
            precio: item.price,
            cantidad: item.quantity
        }))
    };

    try {
        const response = await fetch("/api/pedidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const order = await response.json();
            localStorage.removeItem("cart");
            window.location.href = `/seguimiento?id=${order.idPedido}`;
        } else {
            const errorText = await response.text();
            alert("Error al procesar el pedido: " + errorText);
        }
    } catch (error) {
        console.error("Error al enviar el pedido", error);
        alert("Error de red al procesar el pedido. Intente nuevamente.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCart();

    const payBtn = document.querySelector(".pay-btn");
    if (payBtn) {
        payBtn.addEventListener("click", procesarPedido);
    }
});