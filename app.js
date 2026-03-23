const products = window.CARRY_HAVEN_PRODUCTS || [];
const productGrid = document.getElementById('product-grid');
const filterButtons = document.querySelectorAll('.collection-card');
const cartButton = document.getElementById('cart-button');
const cartDrawer = document.getElementById('cart-drawer');
const closeCart = document.getElementById('close-cart');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const checkoutButton = document.getElementById('checkout-button');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckout = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');
const checkoutMessage = document.getElementById('checkout-message');

let activeFilter = 'all';
let cart = [];

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function renderProducts() {
  const filtered = activeFilter === 'all'
    ? products
    : products.filter(p => p.category === activeFilter);

  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image"></div>
      <div class="product-body">
        <span class="badge">${product.accent}</span>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-meta">
          <div class="price">${money(product.price)}</div>
          <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to cart</button>
        </div>
      </div>
    </article>
  `).join('');
}

function syncCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = count;
}

function renderCart() {
  syncCartCount();

  if (!cart.length) {
    cartItemsEl.innerHTML = '<div class="cart-item"><strong>Your cart is empty.</strong><span class="muted">Add a few placeholder products to test the storefront.</span></div>';
    cartTotalEl.textContent = money(0);
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-top">
        <strong>${item.name}</strong>
        <span>${money(item.price * item.qty)}</span>
      </div>
      <div class="qty-row">
        <button onclick="changeQty(${item.id}, -1)">−</button>
        <span>Qty: ${item.qty}</span>
        <button onclick="changeQty(${item.id}, 1)">+</button>
      </div>
      <button class="remove-link" onclick="removeFromCart(${item.id})">Remove</button>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotalEl.textContent = money(total);
}

window.addToCart = function(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  renderCart();
  cartDrawer.classList.add('open');
};

window.changeQty = function(id, delta) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(entry => entry.id !== id);
  }
  renderCart();
};

window.removeFromCart = function(id) {
  cart = cart.filter(item => item.id !== id);
  renderCart();
};

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    renderProducts();
  });
});

cartButton.addEventListener('click', () => cartDrawer.classList.add('open'));
closeCart.addEventListener('click', () => cartDrawer.classList.remove('open'));
cartDrawer.addEventListener('click', (e) => {
  if (e.target === cartDrawer) cartDrawer.classList.remove('open');
});
checkoutButton.addEventListener('click', () => {
  if (!cart.length) return;
  checkoutModal.classList.add('open');
});
closeCheckout.addEventListener('click', () => checkoutModal.classList.remove('open'));
checkoutModal.addEventListener('click', (e) => {
  if (e.target === checkoutModal) checkoutModal.classList.remove('open');
});

checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!cart.length) {
    checkoutMessage.textContent = 'Your cart is empty.';
    return;
  }
  const formData = new FormData(checkoutForm);
  const name = formData.get('name');
  checkoutMessage.textContent = `Demo order submitted for ${name}. Connect this form to your live checkout before launch.`;
  checkoutForm.reset();
  cart = [];
  renderCart();
  setTimeout(() => {
    checkoutModal.classList.remove('open');
    checkoutMessage.textContent = '';
  }, 1600);
});

renderProducts();
renderCart();
