const products = [
    { id: 1, name: "Cashmere Wool Blazer", category: "clothes", price: 299.99, original: 399.99, rating: 4.9, image: "https://picsum.photos/id/1015/600/800", reviews: 234, sizes: ["S","M","L","XL"] },
    { id: 2, name: "Italian Leather Chelsea Boots", category: "shoes", price: 259.99, original: 329.99, rating: 4.8, image: "https://picsum.photos/id/201/600/800", reviews: 187, sizes: ["7","8","9","10"] },
    { id: 3, name: "Skeleton Automatic Watch", category: "watches", price: 599.99, original: 799.99, rating: 4.9, image: "https://picsum.photos/id/301/600/800", reviews: 312, variants: ["Gold","Silver"] },
    { id: 4, name: "Polarized Aviator Sunglasses", category: "sunglasses", price: 189.99, original: 249.99, rating: 4.7, image: "https://picsum.photos/id/401/600/800", reviews: 156 },
    { id: 5, name: "Croco Embossed Leather Bag", category: "accessories", price: 399.99, original: 499.99, rating: 4.8, image: "https://picsum.photos/id/501/600/800", reviews: 98 },
    { id: 6, name: "Silk Evening Dress", category: "clothes", price: 479.99, original: 599.99, rating: 4.9, image: "https://picsum.photos/id/106/600/800", reviews: 203 }
];

let cart = [];
let wishlist = [];
let activeCategory = "all";
let searchTerm = "";
let sortBy = "default";

function saveData() {
    localStorage.setItem("uc_cart", JSON.stringify(cart));
    localStorage.setItem("uc_wishlist", JSON.stringify(wishlist));
}

function loadData() {
    cart = JSON.parse(localStorage.getItem("uc_cart") || "[]");
    wishlist = JSON.parse(localStorage.getItem("uc_wishlist") || "[]");
    updateCounts();
}

function updateCounts() {
    document.getElementById("cartCount").textContent = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    document.getElementById("wishCount").textContent = wishlist.length;
}

function showToast(msg) {
    const toast = document.getElementById("toastMsg");
    toast.textContent = msg;
    toast.style.opacity = "1";
    setTimeout(() => toast.style.opacity = "0", 2800);
}

function addToCart(product, variant = "Standard") {
    const existing = cart.find(i => i.id === product.id && i.variant === variant);
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else cart.push({ ...product, qty: 1, variant, variantText: variant });
    saveData();
    updateCounts();
    showToast(`${product.name} added to cart`);
    renderCart();
}

function renderProducts() {
    let filtered = products.filter(p => 
        (activeCategory === "all" || p.category === activeCategory) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "priceLow") filtered.sort((a,b) => a.price - b.price);
    if (sortBy === "priceHigh") filtered.sort((a,b) => b.price - a.price);
    if (sortBy === "rating") filtered.sort((a,b) => b.rating - a.rating);

    const grid = document.getElementById("productGrid");
    grid.innerHTML = filtered.map(p => {
        const isWish = wishlist.includes(p.id);
        return `
            <div class="product-card">
                <img src="${p.image}" class="product-img" alt="${p.name}">
                <div class="product-info">
                    <div class="product-title">${p.name}</div>
                    <div class="price">$${p.price.toFixed(2)} 
                        ${p.original ? `<span class="original-price">$${p.original}</span>` : ''}
                    </div>
                    <div class="rating">⭐ ${p.rating} (${p.reviews})</div>
                    <button class="add-to-cart" onclick="addToCartFromId(${p.id})">Add to Cart</button>
                    <button onclick="toggleWishlist(${p.id})" style="margin-top:8px;width:100%;background:#f8f8f8;padding:8px;border:none;cursor:pointer;">
                        ${isWish ? '❤️' : '♡'} Wishlist
                    </button>
                </div>
            </div>`;
    }).join('');
}

window.addToCartFromId = (id) => {
    const prod = products.find(p => p.id === id);
    if (prod) addToCart(prod);
};

window.toggleWishlist = (id) => {
    if (wishlist.includes(id)) wishlist = wishlist.filter(i => i !== id);
    else wishlist.push(id);
    saveData();
    updateCounts();
    renderProducts();
    showToast("Wishlist updated");
};

function renderCart() {
    const container = document.getElementById("cartItemsList");
    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        total += item.price * (item.qty || 1);
        return `
            <div style="display:flex;gap:16px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #eee;">
                <img src="${item.image}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;">
                <div style="flex:1;">
                    <strong>${item.name}</strong><br>
                    <small>${item.variantText || ''}</small>
                    <div style="margin-top:8px;">
                        <button onclick="changeQty(${index}, -1)" style="padding:4px 10px;">−</button>
                        <span style="margin:0 12px;">${item.qty || 1}</span>
                        <button onclick="changeQty(${index}, 1)" style="padding:4px 10px;">+</button>
                    </div>
                </div>
                <div style="text-align:right;">
                    $${(item.price * (item.qty || 1)).toFixed(2)}
                    <br><button onclick="removeFromCart(${index})" style="color:#f00;margin-top:8px;">Remove</button>
                </div>
            </div>`;
    }).join('');

    document.getElementById("cartTotalAmount").innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
}

window.changeQty = (index, delta) => {
    cart[index].qty = (cart[index].qty || 1) + delta;
    if (cart[index].qty < 1) cart.splice(index, 1);
    saveData();
    updateCounts();
    renderCart();
};

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    saveData();
    updateCounts();
    renderCart();
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadData();
    renderProducts();

    // Search
    document.getElementById("searchBtn").addEventListener("click", () => {
        searchTerm = document.getElementById("searchInput").value.toLowerCase();
        renderProducts();
    });

    // Category links
    document.querySelectorAll(".dept-link").forEach(link => {
        link.addEventListener("click", (e) => {
            document.querySelectorAll(".dept-link").forEach(l => l.classList.remove("active"));
            e.target.classList.add("active");
            activeCategory = e.target.dataset.cat;
            renderProducts();
        });
    });

    // Sort
    document.getElementById("sortSelect").addEventListener("change", (e) => {
        sortBy = e.target.value;
        renderProducts();
    });

    // Cart Modal
    document.getElementById("cartIconBtn").addEventListener("click", () => {
        document.getElementById("cartModal").classList.add("open");
        renderCart();
    });

    document.getElementById("closeCartModal").addEventListener("click", () => {
        document.getElementById("cartModal").classList.remove("open");
    });

    // Wishlist Modal
    document.getElementById("wishlistIcon").addEventListener("click", () => {
        document.getElementById("wishlistModal").classList.add("open");
        const list = document.getElementById("wishlistItemsList");
        const items = products.filter(p => wishlist.includes(p.id));
        list.innerHTML = items.length ? items.map(p => `
            <div style="display:flex;gap:12px;margin:12px 0;">
                <img src="${p.image}" style="width:70px;height:70px;object-fit:cover;">
                <div><strong>${p.name}</strong><br>$${p.price}</div>
            </div>`).join('') : "<p>Your wishlist is empty</p>";
    });

    document.getElementById("closeWishModal").addEventListener("click", () => {
        document.getElementById("wishlistModal").classList.remove("open");
    });

    // Checkout
    document.getElementById("checkoutBtnFinal").addEventListener("click", () => {
        if (cart.length > 0) {
            alert("🎉 Thank you for shopping at Unique Collection!\nYour order has been placed successfully.");
            cart = [];
            saveData();
            updateCounts();
            document.getElementById("cartModal").classList.remove("open");
        }
    });
});