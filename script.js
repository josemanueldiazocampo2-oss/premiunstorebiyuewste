const defaultProducts = [
    {
        id: 1,
        name: "Neon Cyber Headphones",
        price: 199.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        description: "Immersive sound with active noise cancellation and RBG lighting integration."
    },
    {
        id: 2,
        name: "Ergonomic Mesh Chair",
        price: 349.00,
        category: "Furniture",
        image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80",
        description: "Designed for all-day comfort with breathable mesh and lumbar support."
    }
];

const defaultCategories = ["Electronics", "Furniture", "Accessories"];

// Storage Helpers
function getStore() {
    const products = JSON.parse(localStorage.getItem('products')) || defaultProducts;
    const categories = JSON.parse(localStorage.getItem('categories')) || defaultCategories;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    return { products, categories, orders };
}

function saveStore(products, categories, orders) {
    if (products) localStorage.setItem('products', JSON.stringify(products));
    if (categories) localStorage.setItem('categories', JSON.stringify(categories));
    if (orders) localStorage.setItem('orders', JSON.stringify(orders));
}

// === CART LOGIC ===
let cart = [];

function addToCart(productId) {
    const { products } = getStore();
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartUI();
        alert("Producto agregado al carrito");
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = cart.length;

    const cartList = document.getElementById('cartList');
    const cartTotal = document.getElementById('cartTotal');

    if (cartList && cartTotal) {
        cartList.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <span>${item.name}</span>
                <span>${formatPrice(item.price)} <button onclick="removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer;">X</button></span>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotal.textContent = formatPrice(total);
    }
}

function submitOrder(e) {
    e.preventDefault();
    if (cart.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    const order = {
        id: Date.now(),
        customer: {
            name: document.getElementById('cName').value,
            contact: document.getElementById('cContact').value,
            address: document.getElementById('cAddress').value,
            cedula: document.getElementById('cCedula').value
        },
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price, 0),
        date: new Date().toLocaleString()
    };

    const { orders } = getStore();
    orders.push(order);
    saveStore(null, null, orders);

    cart = [];
    updateCartUI();
    document.getElementById('checkoutForm').reset();
    document.getElementById('cartModal').classList.remove('active');
    alert("¡Pedido enviado con éxito!");
}

// Utility: Format Currency
const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

// === CLIENT LOGIC ===
function initClient() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const { products } = getStore();
    renderProducts(products); // Initial Render
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(product => `
        <div class="product-card glass-panel">
            <div class="card-img-container" onclick="openProductModal(${product.id})">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            </div>
            <div class="card-info" onclick="openProductModal(${product.id})">
                <span class="card-category">${product.category}</span>
                <h3>${product.name}</h3>
                <div class="card-price">${formatPrice(product.price)}</div>
            </div>
            <button class="btn" style="width:100%; justify-content:center; margin-top:0.5rem;" onclick="addToCart(${product.id})">
                Agregar al Carrito
            </button>
        </div>
    `).join('');
}

function openProductModal(id) {
    const { products } = getStore();
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('modalImage').src = product.image; // Potentially unsafe but simple for this demo
    document.getElementById('modalCategory').textContent = product.category;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalPrice').textContent = formatPrice(product.price);
    document.getElementById('modalDesc').textContent = product.description;

    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}


// === ADMIN LOGIC ===
function initAdmin() {
    const productForm = document.getElementById('addProductForm');
    if (!productForm) return;

    renderCategoryOptions();
    renderInventory();
    renderOrders(); // New function for orders

    // Handle Add Category
    document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('newCategoryName');
        const name = input.value.trim();
        if (!name) return;

        const { products, categories } = getStore();
        if (!categories.includes(name)) {
            categories.push(name);
            saveStore(null, categories, null);
            renderCategoryOptions();
            input.value = '';
            alert('Category added!');
        }
    });

    // Handle Add Product
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const { products } = getStore();

        const newProduct = {
            id: Date.now(),
            name: document.getElementById('pName').value,
            price: parseFloat(document.getElementById('pPrice').value),
            category: document.getElementById('pCategory').value,
            image: document.getElementById('pImage').value,
            description: document.getElementById('pDesc').value
        };

        products.push(newProduct);
        saveStore(products, null, null);
        renderInventory();
        productForm.reset();
        // Feedback
        const btn = productForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = "Product Added!";
        setTimeout(() => btn.textContent = originalText, 2000);
    });
}

function renderCategoryOptions() {
    const { categories } = getStore();
    const select = document.getElementById('pCategory');
    if (select) {
        select.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

function renderInventory() {
    const { products } = getStore();
    const list = document.getElementById('inventoryList');

    list.innerHTML = products.map(p => `
        <div class="inventory-item">
            <img src="${p.image}" class="item-thumbnail" onerror="this.src='https://via.placeholder.com/50'">
            <div class="item-details">
                <div style="font-weight:bold">${p.name}</div>
                <div style="font-size:0.85rem; color:#aaa">${p.category} - ${formatPrice(p.price)}</div>
            </div>
            <button class="delete-btn" onclick="deleteProduct(${p.id})">
                Remove
            </button>
        </div>
    `).join('');
}

function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    let { products } = getStore();
    products = products.filter(p => p.id !== id);
    saveStore(products, null, null);
    renderInventory();
}

function renderOrders() {
    const list = document.getElementById('ordersList');
    if (!list) return;

    const { orders } = getStore();

    if (orders.length === 0) {
        list.innerHTML = '<div style="padding:1rem;">No hay pedidos pendientes.</div>';
        return;
    }

    list.innerHTML = orders.map(order => `
        <div class="glass-panel" style="padding:1rem; margin-bottom:1rem; position:relative;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                <strong>${order.date}</strong>
                <span style="color:#818cf8; font-weight:bold;">${formatPrice(order.total)}</span>
            </div>
            <div style="margin-bottom:0.5rem; font-size:0.9rem;">
                <strong>Cliente:</strong> ${order.customer.name}<br>
                <strong>Tel:</strong> ${order.customer.contact} | <strong>Cédula:</strong> ${order.customer.cedula}<br>
                <strong>Dir:</strong> ${order.customer.address}
            </div>
            <ul style="padding-left:1.5rem; margin-bottom:1rem; font-size:0.9rem;">
                ${order.items.map(item => `<li>${item.name} - ${formatPrice(item.price)}</li>`).join('')}
            </ul>
            <button class="btn" style="background:#10b981; width:100%; justify-content:center;" onclick="completeOrder(${order.id})">
                Marcar Completado
            </button>
        </div>
    `).join('');
}

function completeOrder(id) {
    if (!confirm("¿Marcar este pedido como completado?")) return;

    let { orders } = getStore();
    orders = orders.filter(o => o.id !== id);
    saveStore(null, null, orders);
    renderOrders();
}

// Global Init
document.addEventListener('DOMContentLoaded', () => {
    // Check if on client or admin page
    if (document.getElementById('productsGrid')) {
        initClient();

        // Filter Logic (Optional)
        const filterSelect = document.getElementById('categoryFilter');
        if (filterSelect) {
            const { categories } = getStore();
            categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                filterSelect.appendChild(opt);
            });

            filterSelect.addEventListener('change', (e) => {
                const { products } = getStore();
                const cat = e.target.value;
                if (cat === 'all') renderProducts(products);
                else renderProducts(products.filter(p => p.category === cat));
            });
        }

        // Cart Modal logic
        const cartBtn = document.getElementById('openCartBtn');
        const cartModal = document.getElementById('cartModal');
        const checkoutForm = document.getElementById('checkoutForm');

        if (cartBtn) cartBtn.addEventListener('click', () => {
            updateCartUI();
            cartModal.classList.add('active');
        });

        if (checkoutForm) checkoutForm.addEventListener('submit', submitOrder);

    } else {
        initAdmin();
    }

    // Modal Close Listeners
    document.querySelectorAll('.close-modal, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target === el) closeProductModal();
        });
    });
});
