let cart = [];
let allProducts = [];
let allCategories = [];
let activeCategoryName = ""; // Empty string means "Todos"

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

// --- CARGA DINÁMICA DE PRODUCTOS Y CATEGORÍAS ---

async function fetchCatalogData() {
    try {
        // Cargar categorías y productos simultáneamente
        const [catRes, prodRes] = await Promise.all([
            fetch('/api/categorias'),
            fetch('/api/productos')
        ]);
        
        if (catRes.ok) allCategories = await catRes.json();
        if (prodRes.ok) {
            const rawProducts = await prodRes.json();
            // Deduplicar productos por nombre a nivel de datos para sincronizar los contadores
            const uniqueProds = [];
            const seenNames = new Set();
            rawProducts.forEach(p => {
                const normName = p.nombre.trim().toLowerCase();
                if (!seenNames.has(normName)) {
                    seenNames.add(normName);
                    uniqueProds.push(p);
                }
            });
            allProducts = uniqueProds;
        }
        
        renderCategories();
        renderProducts();
    } catch (e) {
        console.error("Error al cargar los datos del catálogo:", e);
        const grid = document.getElementById('restaurantsGrid');
        if (grid) {
            grid.innerHTML = '<div class="card text-center p-4 w-100" style="color: #ef4444; background: rgba(239, 68, 68, 0.1);">Error de conexión al cargar el catálogo de productos.</div>';
        }
    }
}

function renderCategories() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;
    
    // Calcular cantidad de productos por categoría (solo productos disponibles)
    const availableProducts = allProducts.filter(p => p.disponible !== false);
    
    // Filtrar categorías duplicadas por nombre para asegurar que la barra lateral no se repita
    const uniqueCategories = [];
    const seenCategories = new Set();
    allCategories.forEach(cat => {
        const normName = cat.nombre.trim().toLowerCase();
        if (!seenCategories.has(normName)) {
            seenCategories.add(normName);
            uniqueCategories.push(cat);
        }
    });
    
    let html = `
        <li>
            <a href="#" class="cat-link active" data-category="">
                Todos <span class="count">${availableProducts.length}</span>
            </a>
        </li>
    `;
    
    uniqueCategories.forEach(cat => {
        // Contar productos que tengan el mismo nombre de categoría (independientemente del ID)
        const prodCount = availableProducts.filter(p => p.categoria && p.categoria.nombre.trim().toLowerCase() === cat.nombre.trim().toLowerCase()).length;
        html += `
            <li>
                <a href="#" class="cat-link" data-category="${cat.nombre}">
                    ${cat.nombre} <span class="count">${prodCount}</span>
                </a>
            </li>
        `;
    });
    
    categoriesList.innerHTML = html;
    
    // Agregar event listeners a las categorías creadas
    const links = categoriesList.querySelectorAll('.cat-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Quitar clase active
            links.forEach(l => {
                l.classList.remove('active');
                l.style.color = "#cbd5e1";
                l.style.fontWeight = "400";
            });
            
            link.classList.add('active');
            link.style.color = "#60a5fa";
            link.style.fontWeight = "600";
            
            activeCategoryName = link.getAttribute('data-category');
            renderProducts();
        });
    });
}

function renderProducts() {
    const grid = document.getElementById('restaurantsGrid');
    if (!grid) return;
    
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    
    // Filtrar productos
    let filtered = allProducts.filter(p => p.disponible !== false);
    
    // Filtrar por categoría activa
    if (activeCategoryName) {
        filtered = filtered.filter(p => p.categoria && p.categoria.nombre.toLowerCase() === activeCategoryName.toLowerCase());
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
        filtered = filtered.filter(p => {
            const nameMatch = p.nombre.toLowerCase().includes(searchTerm);
            const descMatch = p.descripcion ? p.descripcion.toLowerCase().includes(searchTerm) : false;
            const restMatch = p.restaurante ? p.restaurante.nombre.toLowerCase().includes(searchTerm) : false;
            return nameMatch || descMatch || restMatch;
        });
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="card text-center p-5 w-100" style="color: #94a3b8; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px;">No se encontraron productos en esta sección.</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(p => {
        // Imágenes ilustrativas según categoría para no mostrar tarjetas vacías
        let imgUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=140&fit=crop"; // default comida
        
        const catName = p.categoria ? p.categoria.nombre.toLowerCase() : "";
        if (catName.includes("pizza")) {
            imgUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=140&fit=crop";
        } else if (catName.includes("hamburguesa")) {
            imgUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=140&fit=crop";
        } else if (catName.includes("pollo")) {
            imgUrl = "https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?w=300&h=140&fit=crop";
        } else if (catName.includes("bebida")) {
            imgUrl = "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&h=140&fit=crop";
        } else if (catName.includes("postre") || catName.includes("dulce")) {
            imgUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=140&fit=crop";
        }

        const restName = p.restaurante ? p.restaurante.nombre : "ChasquiPedidos";
        const desc = p.descripcion || "Disfruta de la mejor calidad al instante.";
        
        return `
            <div class="restaurant-card">
                <div class="restaurant-img">
                    <img src="${imgUrl}" alt="${p.nombre}">
                    <span class="restaurant-offer">${p.categoria ? p.categoria.nombre : 'Producto'}</span>
                </div>
                <div class="restaurant-info">
                    <div class="restaurant-header">
                        <h4>${p.nombre}</h4>
                        <div class="rating">
                            <span style="font-size: 0.8rem; opacity: 0.8; font-weight: normal; color: #60a5fa;"><i class="fas fa-store"></i> ${restName}</span>
                        </div>
                    </div>
                    <p class="restaurant-desc" style="margin-bottom: 8px; min-height: 40px; font-size: 0.85rem; color: #cbd5e1;">${desc}</p>
                    <p class="restaurant-desc" style="font-size: 0.75rem;"><i class="fas fa-clock"></i> 20-30 min · <i class="fas fa-box"></i> Stock: ${p.stock}</p>
                    <div class="restaurant-footer" style="margin-top: 10px;">
                        <div class="price">S/ ${p.precio.toFixed(2)}</div>
                        <button class="add-to-cart" onclick="addToCart('${p.nombre.replace(/'/g, "\\'")}', ${p.precio})">
                            <i class="fas fa-plus"></i> Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
    
    // Efectos de transición en hover
    const cards = document.querySelectorAll(".restaurant-card");
    cards.forEach(card => {
        card.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-5px) scale(1.01)";
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "translateY(0) scale(1)";
        });
    });
}

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
    if (searchInput) {
        searchInput.addEventListener("input", renderProducts);
    }
    
    // Cargar catálogo de base de datos
    fetchCatalogData();
});

console.log("home.js dinámico cargado exitosamente");