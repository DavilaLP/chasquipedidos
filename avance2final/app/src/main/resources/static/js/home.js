let cart = [];

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity++;
        existingItem.total = existingItem.price * existingItem.quantity;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1,
            total: price
        });
    }
    
    updateCart();
    showToast(`${name} agregado al carrito`);
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    const cartItemsDiv = document.getElementById('cartItems');
    const cartCounter = document.getElementById('cartCounter');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    let total = 0;
    let itemCount = 0;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Tu carrito está vacío</p>
                <small>Agrega productos para continuar</small>
            </div>
        `;
        cartCounter.textContent = '0';
        cartTotal.textContent = 'S/ 0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    let html = '';
    cart.forEach((item, index) => {
        total += item.total;
        itemCount += item.quantity;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h6>${item.name}</h6>
                    <p>S/ ${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="remove-item" onclick="removeItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsDiv.innerHTML = html;
    cartCounter.textContent = itemCount;
    cartTotal.textContent = `S/ ${total.toFixed(2)}`;
    checkoutBtn.disabled = false;
}

function updateQuantity(index, change) {
    const item = cart[index];
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeItem(index);
    } else {
        item.quantity = newQuantity;
        item.total = item.price * newQuantity;
        updateCart();
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; background: #22c55e; color: white; padding: 12px 24px; border-radius: 12px; z-index: 9999; animation: slideIn 0.3s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
            <i class="fas fa-check-circle"></i> ${message}
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

const cards = document.querySelectorAll(".restaurant-card");
cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-5px) scale(1.01)";
    });
    card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0) scale(1)";
    });
});

// --- BUSCADOR Y FILTRADO EN TIEMPO REAL ---
document.addEventListener("DOMContentLoaded", () => {
    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCart();
        } catch (e) {
            console.error("Error al parsear el carrito guardado", e);
        }
    }

    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            window.location.href = "/carrito";
        });
    }

    const searchInput = document.getElementById("searchInput");
    const restaurantCards = document.querySelectorAll(".restaurant-card");
    const categoryLinks = document.querySelectorAll(".categories-list li a");

    function filterRestaurants() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        restaurantCards.forEach(card => {
            const name = card.querySelector(".restaurant-header h4").textContent.toLowerCase();
            const desc = card.querySelector(".restaurant-desc").textContent.toLowerCase();

            if (name.includes(searchTerm) || desc.includes(searchTerm)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterRestaurants);
    }

    // Filtrar por categorías del Sidebar
    categoryLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Quitar estilo activo de otros links y ponerlo en el seleccionado
            categoryLinks.forEach(l => {
                l.style.color = "#cbd5e1";
                l.style.fontWeight = "400";
            });
            link.style.color = "#60a5fa";
            link.style.fontWeight = "600";

            // Obtener texto de la categoría sin el contador numérico
            const tempNode = link.cloneNode(true);
            const countBadge = tempNode.querySelector(".count");
            if (countBadge) countBadge.remove();
            const categoryText = tempNode.textContent.trim().toLowerCase();

            restaurantCards.forEach(card => {
                const name = card.querySelector(".restaurant-header h4").textContent.toLowerCase();
                const desc = card.querySelector(".restaurant-desc").textContent.toLowerCase();
                
                let match = false;
                if (categoryText === "hamburguesas" && (name.includes("burger") || desc.includes("hamburguesa"))) match = true;
                else if (categoryText === "pizza" && (name.includes("pizza") || desc.includes("pizza"))) match = true;
                else if (categoryText === "sushi" && (name.includes("sushi") || desc.includes("sushi"))) match = true;
                else if (categoryText === "pollo" && (name.includes("pollería") || name.includes("pollo") || desc.includes("pollo"))) match = true;
                else if (categoryText === "tacos" && (name.includes("tacos") || desc.includes("tacos"))) match = true;
                else if (categoryText === "ensaladas" && (name.includes("salad") || desc.includes("ensalada"))) match = true;
                else if (categoryText === "pastas" && (name.includes("pastas") || desc.includes("pastas") || desc.includes("tallarines"))) match = true;
                else if (categoryText === "asiática" && (name.includes("asia") || desc.includes("wok") || desc.includes("chifa") || desc.includes("asiática"))) match = true;
                
                if (match) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
});

console.log("Home.js cargado - Carrito y buscador funcionando");