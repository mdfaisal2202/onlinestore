// PRODUCT CATALOG
const products = [
  { id: 1, name: "Cashmere Wool Blazer", category: "clothes", price: 349.99, rating: 4.9, image: "https://placehold.co/600x800/1A1A1A/D4AF37?text=Blazer", reviews: 234, sizes: ["S","M","L","XL"] },
  { id: 2, name: "Italian Leather Chelsea", category: "shoes", price: 289.99, rating: 4.8, image: "https://placehold.co/600x800/2A2A2A/D4AF37?text=Chelsea", reviews: 187, sizes: ["7","8","9","10","11"] },
  { id: 3, name: "Skeleton Automatic Watch", category: "watches", price: 599.99, rating: 4.9, image: "https://placehold.co/600x800/1F1F1F/D4AF37?text=Watch", reviews: 312, variants: ["Gold","Silver"] },
  { id: 4, name: "Polarized Aviator Gold", category: "sunglasses", price: 249.99, rating: 4.7, image: "https://placehold.co/600x800/2A2A2A/D4AF37?text=Aviator", reviews: 156, variants: ["Gold Frame","Black Frame"] },
  { id: 5, name: "Croco Embossed Bag", category: "accessories", price: 459.99, rating: 4.8, image: "https://placehold.co/600x800/1E1E1E/D4AF37?text=Bag", reviews: 98, colors: ["Black","Tan"] },
  { id: 6, name: "Silk Evening Dress", category: "clothes", price: 529.99, rating: 4.9, image: "https://placehold.co/600x800/111111/D4AF37?text=Dress", reviews: 203, sizes: ["XS","S","M","L"] },
  { id: 7, name: "Monk Strap Dress Shoes", category: "shoes", price: 399.99, rating: 4.8, image: "https://placehold.co/600x800/222222/D4AF37?text=Monk", reviews: 112, sizes: ["8","9","10"] },
  { id: 8, name: "Moonphase Chronograph", category: "watches", price: 899.99, rating: 5.0, image: "https://placehold.co/600x800/1C1C1C/D4AF37?text=Moonphase", reviews: 89, variants: ["Leather","Metal"] },
  { id: 9, name: "Limited Edition Shades", category: "sunglasses", price: 379.99, rating: 4.8, image: "https://placehold.co/600x800/252525/D4AF37?text=Shades", reviews: 67, variants: ["Gradient","Mirror"] },
  { id: 10, name: "Premium Leather Belt", category: "accessories", price: 129.99, rating: 4.6, image: "https://placehold.co/600x800/2E2E2E/D4AF37?text=Belt", reviews: 230, sizes: ["32","34","36","38"] }
];

let cart = [];
let wishlist = [];
let activeCategory = "all";
let searchTerm = "";
let sortBy = "default";
let userLocation = null;
let deliveryDays = 5;

function saveData() {
  localStorage.setItem("uc_cart", JSON.stringify(cart));
  localStorage.setItem("uc_wishlist", JSON.stringify(wishlist));
  updateCartBadge();
}

function loadData() {
  const c = localStorage.getItem("uc_cart");
  if(c) cart = JSON.parse(c);
  const w = localStorage.getItem("uc_wishlist");
  if(w) wishlist = JSON.parse(w);
  updateCartBadge();
}

function updateCartBadge() {
  document.getElementById("cartCount").innerText = cart.reduce((s,i)=>s+i.qty,0);
}

function showToast(msg) {
  const t = document.getElementById("toastMsg");
  t.innerText = msg;
  t.style.opacity = "1";
  setTimeout(() => t.style.opacity = "0", 2000);
}

function addToCart(product, selectedVariant) {
  const existing = cart.find(i => i.id === product.id && i.variant === selectedVariant);
  if(existing) existing.qty++;
  else cart.push({ ...product, qty: 1, variant: selectedVariant, variantText: selectedVariant });
  saveData();
  renderCartUI();
  showToast(`✨ ${product.name} added`);
}

function updateQuantity(id, variant, delta) {
  let idx = cart.findIndex(i => i.id === id && i.variant === variant);
  if(idx !== -1) {
    let newQty = cart[idx].qty + delta;
    if(newQty <= 0) cart.splice(idx,1);
    else cart[idx].qty = newQty;
    saveData();
    renderCartUI();
    updateCartBadge();
  }
}

function removeCartItem(id, variant) {
  cart = cart.filter(i => !(i.id === id && i.variant === variant));
  saveData();
  renderCartUI();
  updateCartBadge();
}

function toggleWishlist(productId) {
  if(wishlist.includes(productId)) wishlist = wishlist.filter(id => id !== productId);
  else wishlist.push(productId);
  saveData();
  renderProducts();
  renderWishlistUI();
}

function getFilteredProducts() {
  let filtered = products.filter(p => (activeCategory === "all" || p.category === activeCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  if(sortBy === "priceLow") filtered.sort((a,b)=>a.price - b.price);
  else if(sortBy === "priceHigh") filtered.sort((a,b)=>b.price - a.price);
  else if(sortBy === "rating") filtered.sort((a,b)=>b.rating - a.rating);
  return filtered;
}

function renderProducts() {
  const filtered = getFilteredProducts();
  document.getElementById("resultCount").innerText = filtered.length;
  const grid = document.getElementById("productGrid");
  if(filtered.length === 0) { grid.innerHTML = "✨ No luxury pieces found"; return; }
  grid.innerHTML = filtered.map(p => {
    const isWished = wishlist.includes(p.id);
    const variantOptions = p.sizes ? p.sizes : (p.variants ? p.variants : (p.colors ? p.colors : ["Standard"]));
    return `${p.name}$${p.price.toFixed(2)}⭐ ${p.rating} (${p.reviews} reviews)${variantOptions.map(v=>`${v}`).join('')} Add`;
  }).join('');
  document.querySelectorAll('.add-cart').forEach(btn => btn.addEventListener('click', (e) => { let id = parseInt(btn.dataset.id); let prod = products.find(p=>p.id===id); let variant = document.getElementById(`variant-${id}`).value; if(prod) addToCart(prod, variant); }));
  document.querySelectorAll('.wish-btn').forEach(btn => btn.addEventListener('click', (e) => { let id = parseInt(btn.dataset.id); toggleWishlist(id); }));
}

function renderCartUI() {
  const container = document.getElementById("cartItemsList");
  if(!container) return;
  if(cart.length === 0) { container.innerHTML = "Your cart is empty"; document.getElementById("cartTotalAmount").innerHTML = "Total: $0.00"; return; }
  let total = 0;
  let html = "";
  cart.forEach(item => { total += item.price * item.qty; html += `${item.name}${item.variantText}$${item.price} x ${item.qty}+ - Remove`; });
  container.innerHTML = html;
  document.getElementById("cartTotalAmount").innerHTML = `Total: $${total.toFixed(2)} + Free Shipping`;
  document.querySelectorAll('.qty-inc').forEach(btn => btn.addEventListener('click', (e) => updateQuantity(parseInt(btn.dataset.id), btn.dataset.variant, 1)));
  document.querySelectorAll('.qty-dec').forEach(btn => btn.addEventListener('click', (e) => updateQuantity(parseInt(btn.dataset.id), btn.dataset.variant, -1)));
  document.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', (e) => removeCartItem(parseInt(btn.dataset.id), btn.dataset.variant)));
}

function renderWishlistUI() {
  const container = document.getElementById("wishlistItemsList");
  if(!container) return;
  const wishItems = products.filter(p => wishlist.includes(p.id));
  if(wishItems.length === 0) { container.innerHTML = "No wishlist items"; return; }
  container.innerHTML = wishItems.map(p => `${p.name}$${p.price}Add to Cart`).join('');
  document.querySelectorAll('.add-cart-wish').forEach(btn => btn.addEventListener('click', (e) => { let id = parseInt(btn.dataset.id); let prod = products.find(p=>p.id===id); if(prod) addToCart(prod, "Standard"); }));
}

function detectLocation() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
        const data = await response.json();
        const city = data.address?.city || data.address?.town || "your city";
        userLocation = city;
        document.getElementById("locationText").innerHTML = ` ${city}`;
        deliveryDays = Math.floor(Math.random() * 5) + 3;
        document.getElementById("deliveryEstimate").innerHTML = `🚚 Est. delivery: ${deliveryDays} business days • Free returns`;
        showToast(`📍 Location set to ${city}`);
      } catch(e) { document.getElementById("locationText").innerHTML = "📍 Location detected"; }
    }, () => { document.getElementById("locationText").innerHTML = "📍 Enable location"; });
  }
}

function checkout() {
  if(cart.length === 0) { alert("Your cart is empty"); return; }
  let total = cart.reduce((s,i)=>s+(i.price*i.qty),0);
  alert(`✨ ORDER CONFIRMED ✨\n${userLocation ? `📍 Shipping to: ${userLocation}` : "📍 Worldwide shipping"}\nDelivery: ${deliveryDays} business days\nTotal: $${total.toFixed(2)}\n\nThank you for shopping at Unique Collection.`);
  cart = []; saveData(); renderCartUI(); updateCartBadge(); document.getElementById("cartModal").classList.remove("open"); showToast("Order placed!");
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loadData(); renderProducts(); renderCartUI();
  document.querySelectorAll(".cat-pill").forEach(pill => pill.addEventListener("click", () => {
    document.querySelectorAll(".cat-pill").forEach(p=>p.classList.remove("active"));
    pill.classList.add("active");
    activeCategory = pill.dataset.cat;
    renderProducts();
  }));
  document.getElementById("searchBtn").addEventListener("click", () => { searchTerm = document.getElementById("searchInput").value; renderProducts(); });
  document.getElementById("searchInput").addEventListener("keypress", (e) => { if(e.key === "Enter") { searchTerm = e.target.value; renderProducts(); } });
  document.getElementById("sortSelect").addEventListener("change", (e) => { sortBy = e.target.value; renderProducts(); });
  document.getElementById("detectLocationBtn").addEventListener("click", detectLocation);
  document.getElementById("cartIconBtn").onclick = () => { renderCartUI(); document.getElementById("cartModal").classList.add("open"); };
  document.getElementById("closeCartModal").onclick = () => document.getElementById("cartModal").classList.remove("open");
  document.getElementById("wishlistIcon").onclick = () => { renderWishlistUI(); document.getElementById("wishlistModal").classList.add("open"); };
  document.getElementById("closeWishModal").onclick = () => document.getElementById("wishlistModal").classList.remove("open");
  document.getElementById("checkoutBtnFinal").onclick = checkout;
  document.getElementById("locationBtn").addEventListener("click", detectLocation);
  window.onclick = (e) => { if(e.target.classList && e.target.classList.contains("modal")) e.target.classList.remove("open"); };
  detectLocation();
});