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
    const team = JSON.parse(localStorage.getItem('team')) || [];
    const hostSet = localStorage.getItem('hostSet') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    return { products, categories, orders, team, hostSet, currentUser };
}

function saveStore(products, categories, orders, team) {
    if (products) localStorage.setItem('products', JSON.stringify(products));
    if (categories) localStorage.setItem('categories', JSON.stringify(categories));
    if (orders) localStorage.setItem('orders', JSON.stringify(orders));
    if (team) localStorage.setItem('team', JSON.stringify(team));
}

// === AUTHENTICATION ===
let currentAdminUser = null;

function initAuth() {
    const { hostSet, currentUser } = getStore();
    const setupScreen = document.getElementById('setupScreen');
    const loginScreen = document.getElementById('loginScreen');
    const adminInterface = document.getElementById('adminInterface');
    
    if (!loginScreen || !adminInterface) return;
    
    // If no host is set, this is the first time - show setup screen
    if (!hostSet) {
        if (setupScreen) {
            setupScreen.style.display = 'flex';
            loginScreen.style.display = 'none';
            adminInterface.style.display = 'none';
            
            // Setup setup form
            const setupForm = document.getElementById('setupForm');
            if (setupForm) {
                setupForm.addEventListener('submit', handleSetup);
            }
        }
        return;
    }
    
    // If there's a current session, use it
    if (currentUser) {
        currentAdminUser = currentUser;
        showAdminInterface();
        return;
    }
    
    // Show login screen
    if (setupScreen) setupScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
    adminInterface.style.display = 'none';
    
    // Setup login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

function handleSetup(e) {
    e.preventDefault();
    const username = document.getElementById('setupUsername').value.trim();
    const password = document.getElementById('setupPassword').value;
    const passwordConfirm = document.getElementById('setupPasswordConfirm').value;
    const setupError = document.getElementById('setupError');
    
    // Validate
    if (password !== passwordConfirm) {
        if (setupError) {
            setupError.textContent = 'Las contraseñas no coinciden';
            setupError.style.display = 'block';
        }
        return;
    }
    
    if (password.length < 4) {
        if (setupError) {
            setupError.textContent = 'La contraseña debe tener al menos 4 caracteres';
            setupError.style.display = 'block';
        }
        return;
    }
    
    // Create host user
    const hostUser = {
        id: Date.now(),
        username: username,
        password: password,
        role: 'host',
        createdAt: new Date().toISOString()
    };
    
    saveStore(null, null, null, [hostUser]);
    localStorage.setItem('hostSet', 'true');
    localStorage.setItem('currentUser', JSON.stringify(hostUser));
    currentAdminUser = hostUser;
    
    // Hide setup, show admin
    const setupScreen = document.getElementById('setupScreen');
    if (setupScreen) setupScreen.style.display = 'none';
    
    showAdminInterface();
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// === IMAGE UPLOAD ===
let currentImageData = null;
let currentImageType = 'url'; // 'url' or 'file'

function initImageUpload() {
    // Tab switching
    const imageTabs = document.querySelectorAll('.image-tab');
    imageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Update active tab
            imageTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding panel
            document.querySelectorAll('.image-input-panel').forEach(panel => {
                panel.classList.remove('active');
                panel.style.display = 'none';
            });
            
            const targetPanel = document.getElementById(`image${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Input`);
            if (targetPanel) {
                targetPanel.classList.add('active');
                targetPanel.style.display = 'block';
            }
            
            currentImageType = tabName;
            updateImageData();
        });
    });
    
    // File input change
    const fileInput = document.getElementById('pImageFile');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // URL input change
    const urlInput = document.getElementById('pImage');
    if (urlInput) {
        urlInput.addEventListener('input', () => {
            if (currentImageType === 'url') {
                currentImageData = urlInput.value;
                document.getElementById('pImageData').value = urlInput.value;
            }
        });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        currentImageData = event.target.result;
        document.getElementById('pImageData').value = currentImageData;
        
        // Show preview
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        if (preview && previewImg) {
            previewImg.src = currentImageData;
            preview.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

function clearImagePreview() {
    currentImageData = null;
    document.getElementById('pImageData').value = '';
    document.getElementById('pImageFile').value = '';
    
    const preview = document.getElementById('imagePreview');
    if (preview) preview.style.display = 'none';
}

function updateImageData() {
    const urlInput = document.getElementById('pImage');
    const fileInput = document.getElementById('pImageFile');
    const hiddenInput = document.getElementById('pImageData');
    
    if (currentImageType === 'url') {
        currentImageData = urlInput ? urlInput.value : '';
    }
    // For file type, currentImageData is set by handleFileSelect
    
    if (hiddenInput) hiddenInput.value = currentImageData || '';
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginError = document.getElementById('loginError');
    
    const { team } = getStore();
    const user = team.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentAdminUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showAdminInterface();
        if (loginError) loginError.style.display = 'none';
    } else {
        if (loginError) {
            loginError.textContent = 'Usuario o contraseña incorrectos';
            loginError.style.display = 'block';
        }
    }
}

function handleLogout() {
    currentAdminUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
}

function showAdminInterface() {
    const loginScreen = document.getElementById('loginScreen');
    const adminInterface = document.getElementById('adminInterface');
    const currentUserDisplay = document.getElementById('currentUserDisplay');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminInterface) adminInterface.style.display = 'block';
    if (currentUserDisplay && currentAdminUser) {
        currentUserDisplay.textContent = `Conectado como: ${currentAdminUser.username} (${currentAdminUser.role})`;
    }
    
    // Initialize admin features
    initAdminNavigation();
    initAdmin();
    updateTeamSectionVisibility();
}

// === ADMIN NAVIGATION ===
function initAdminNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.admin-section');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const sectionName = tab.dataset.section;
            
            // Update active tab
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding section
            sections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(`section-${sectionName}`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Refresh content based on section
            if (sectionName === 'orders') {
                renderOrders();
            } else if (sectionName === 'team') {
                renderTeam();
            } else if (sectionName === 'products') {
                renderInventory();
            }
        });
    });
}

function updateTeamSectionVisibility() {
    const addMemberSection = document.getElementById('addMemberSection');
    const viewOnlySection = document.getElementById('viewOnlySection');
    const teamTab = document.getElementById('teamTab');
    
    if (!currentAdminUser || !addMemberSection || !viewOnlySection) return;
    
    // Only host can add/edit team members
    if (currentAdminUser.role === 'host') {
        addMemberSection.style.display = 'block';
        viewOnlySection.style.display = 'none';
    } else {
        addMemberSection.style.display = 'none';
        viewOnlySection.style.display = 'block';
    }
}

// === TEAM MANAGEMENT ===
function initTeamManagement() {
    const addMemberForm = document.getElementById('addMemberForm');
    if (!addMemberForm) return;
    
    addMemberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!currentAdminUser || currentAdminUser.role !== 'host') {
            alert('Solo el administrador principal puede agregar miembros');
            return;
        }
        
        const username = document.getElementById('memberUsername').value.trim();
        const password = document.getElementById('memberPassword').value;
        const role = document.getElementById('memberRole').value;
        
        const { team } = getStore();
        
        // Check if username already exists
        if (team.some(m => m.username === username)) {
            alert('Este nombre de usuario ya existe');
            return;
        }
        
        const newMember = {
            id: Date.now(),
            username,
            password,
            role,
            createdAt: new Date().toISOString(),
            createdBy: currentAdminUser.username
        };
        
        team.push(newMember);
        saveStore(null, null, null, team);
        
        renderTeam();
        addMemberForm.reset();
        
        // Feedback
        const btn = addMemberForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = '¡Miembro Agregado!';
        setTimeout(() => btn.textContent = originalText, 2000);
    });
}

function renderTeam() {
    const list = document.getElementById('teamList');
    if (!list) return;
    
    const { team } = getStore();
    
    if (team.length === 0) {
        list.innerHTML = '<div style="padding:1rem; color: var(--text-muted);">No hay miembros en el equipo.</div>';
        return;
    }
    
    list.innerHTML = team.map(member => {
        const isHost = member.role === 'host';
        const roleClass = isHost ? 'host' : (member.role === 'admin' ? 'admin' : '');
        const roleText = isHost ? 'Administrador Principal' : (member.role === 'admin' ? 'Administrador' : 'Editor');
        const initial = member.username.charAt(0).toUpperCase();
        
        return `
            <div class="team-member">
                <div class="member-avatar">${initial}</div>
                <div class="member-info">
                    <div class="member-name">${member.username}</div>
                    <div class="member-role ${roleClass}">${roleText}</div>
                </div>
                ${!isHost && currentAdminUser && currentAdminUser.role === 'host' ? `
                    <div class="member-actions">
                        <button class="delete-btn" onclick="deleteTeamMember(${member.id})">Eliminar</button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function deleteTeamMember(memberId) {
    if (!confirm('¿Estás seguro de eliminar este miembro?')) return;
    
    if (!currentAdminUser || currentAdminUser.role !== 'host') {
        alert('Solo el administrador principal puede eliminar miembros');
        return;
    }
    
    let { team } = getStore();
    team = team.filter(m => m.id !== memberId);
    saveStore(null, null, null, team);
    renderTeam();
}

// === CART LOGIC ===
let cart = [];
let currentModalProductId = null;

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
                <span>${formatPrice(item.price)} <button onclick="removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer; padding: 0.25rem 0.5rem;">X</button></span>
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
    renderProducts(products);
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = products.map(product => `
        <div class="product-card glass-panel">
            <div class="card-img-container" onclick="openProductModal(${product.id})">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            </div>
            <div class="card-info" onclick="openProductModal(${product.id})">
                <span class="card-category">${product.category}</span>
                <h3>${product.name}</h3>
                <div class="card-price">${formatPrice(product.price)}</div>
            </div>
            <button class="btn" style="width:100%; justify-content:center; margin-top:0.5rem;" onclick="event.stopPropagation(); addToCart(${product.id})">
                Agregar al Carrito
            </button>
        </div>
    `).join('');
}

function openProductModal(id) {
    const { products } = getStore();
    const product = products.find(p => p.id === id);
    if (!product) return;

    currentModalProductId = id;
    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalCategory').textContent = product.category;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalPrice').textContent = formatPrice(product.price);
    document.getElementById('modalDesc').textContent = product.description;

    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    currentModalProductId = null;
}

function closeCartModal() {
    document.getElementById('cartModal').classList.remove('active');
}

// === ADMIN LOGIC ===
function initAdmin() {
    const productForm = document.getElementById('addProductForm');
    if (!productForm) return;

    renderCategoryOptions();
    renderInventory();
    renderOrders();
    renderTeam();
    initTeamManagement();
    initImageUpload();

    // Handle Add Category
    const categoryForm = document.getElementById('addCategoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', (e) => {
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
                alert('¡Categoría agregada!');
            } else {
                alert('Esta categoría ya existe');
            }
        });
    }

    // Handle Add Product
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get image data
        const imageData = document.getElementById('pImageData').value;
        if (!imageData) {
            alert('Por favor proporciona una imagen (URL o archivo)');
            return;
        }

        const { products } = getStore();

        const newProduct = {
            id: Date.now(),
            name: document.getElementById('pName').value,
            price: parseFloat(document.getElementById('pPrice').value),
            category: document.getElementById('pCategory').value,
            image: imageData,
            description: document.getElementById('pDesc').value
        };

        products.push(newProduct);
        saveStore(products, null, null);
        renderInventory();
        productForm.reset();
        clearImagePreview();
        currentImageData = null;
        
        // Reset to URL tab
        document.querySelectorAll('.image-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.image-tab[data-tab="url"]').classList.add('active');
        document.querySelectorAll('.image-input-panel').forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
        });
        document.getElementById('imageUrlInput').classList.add('active');
        document.getElementById('imageUrlInput').style.display = 'block';
        currentImageType = 'url';
        
        // Feedback
        const btn = productForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = "¡Producto Agregado!";
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
    if (!list) return;

    list.innerHTML = products.map(p => `
        <div class="inventory-item">
            <img src="${p.image}" class="item-thumbnail" loading="lazy" onerror="this.src='https://via.placeholder.com/50'">
            <div class="item-details">
                <div style="font-weight:bold">${p.name}</div>
                <div style="font-size:0.85rem; color:#aaa">${p.category} - ${formatPrice(p.price)}</div>
            </div>
            <button class="delete-btn" onclick="deleteProduct(${p.id})">
                Eliminar
            </button>
        </div>
    `).join('');
}

function deleteProduct(id) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    let { products } = getStore();
    products = products.filter(p => p.id !== id);
    saveStore(products, null, null);
    renderInventory();
}

function renderOrders() {
    const list = document.getElementById('ordersList');
    if (!list) return;

    const { orders, products } = getStore();

    if (orders.length === 0) {
        list.innerHTML = '<div style="padding:1rem; color: var(--text-muted);">No hay pedidos pendientes.</div>';
        return;
    }

    list.innerHTML = orders.map(order => `
        <div class="glass-panel order-card">
            <div class="order-header">
                <span class="order-date">${order.date}</span>
                <span class="order-total">${formatPrice(order.total)}</span>
            </div>
            <div class="order-customer">
                <strong>Cliente:</strong> ${order.customer.name}<br>
                <strong>Tel:</strong> ${order.customer.contact} | <strong>Cédula:</strong> ${order.customer.cedula}<br>
                <strong>Dir:</strong> ${order.customer.address}
            </div>
            <ul class="order-items">
                ${order.items.map(item => {
                    // Find the product to get its image
                    const product = products.find(p => p.id === item.id) || item;
                    const imageUrl = product.image || 'https://via.placeholder.com/40';
                    return `
                        <li class="order-item">
                            <img src="${imageUrl}" class="order-item-img" loading="lazy" onerror="this.src='https://via.placeholder.com/40'">
                            <div class="order-item-info">
                                <span>${item.name}</span>
                                <span style="color: #818cf8; font-weight: 600;">${formatPrice(item.price)}</span>
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>
            <button class="btn complete-btn" onclick="completeOrder(${order.id})">
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
        // Client page
        initClient();

        // Filter Logic
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
        // Admin page
        initAuth();
    }

    // Modal Close Listeners
    document.querySelectorAll('.close-modal').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            closeProductModal();
            closeCartModal();
        });
    });
    
    // Close modal when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target === el) {
                closeProductModal();
                closeCartModal();
            }
        });
    });
    
    // Prevent modal content clicks from closing
    document.querySelectorAll('.modal-content').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
});

// Handle escape key to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProductModal();
        closeCartModal();
    }
});
