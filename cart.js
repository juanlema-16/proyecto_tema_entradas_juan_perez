let currentUser = null;
let cart = [];
let events = [];

function checkAuth() {
  const user = localStorage.getItem('currentUser');
  if (!user) { window.location.href = 'index.html'; return; }
  currentUser = JSON.parse(user);
}

function loadCart() {
  events = JSON.parse(localStorage.getItem('events') || '[]');
  cart = JSON.parse(localStorage.getItem(`cart_${currentUser.id}`) || '[]');
  displayCart();
}

function displayCart() {
  const cartItems = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartSummary = document.getElementById('cartSummary');
  const itemCount = document.getElementById('itemCount');
  
  if (cart.length === 0) {
    cartItems.innerHTML = '';
    emptyCart.classList.remove('hidden');
    cartSummary.classList.add('hidden');
    itemCount.textContent = '0 artículos en tu carrito';
    return;
  }
  
  emptyCart.classList.add('hidden');
  cartSummary.classList.remove('hidden');
  itemCount.textContent = `${cart.length} artículo(s) en tu carrito`;
  
  let total = 0;
  cartItems.innerHTML = cart.map(item => {
    const event = events.find(e => e.id === item.eventId);
    if (!event) return '';
    const itemTotal = event.price * item.quantity;
    total += itemTotal;
    
    return `
      <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #f3f4f6;">
        <div style="display: flex; gap: 1rem; align-items: center;">
          <img src="${event.imageUrl}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
          <div>
            <h4 style="font-weight: 600;">${event.name}</h4>
            <p style="font-size: 0.875rem; color: #6b7280;">Q${event.price} x ${item.quantity}</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="font-weight: 700;">Q${itemTotal.toFixed(2)}</span>
          <button onclick="removeFromCart('${item.eventId}')" style="background: none; border: none; color: #ef4444; cursor: pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  document.getElementById('subtotal').textContent = `Q${total.toFixed(2)}`;
  document.getElementById('total').textContent = `Q${total.toFixed(2)}`;
}

function removeFromCart(eventId) {
  cart = cart.filter(item => item.eventId !== eventId);
  localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
  loadCart();
}

// --- LÓGICA DE PAGO ---
function openPaymentModal() {
  document.getElementById('paymentModal').classList.add('active');
  // Bloquea el scroll de la página de atrás
  document.body.style.overflow = 'hidden'; 
}

function closePaymentModal() {
  document.getElementById('paymentModal').classList.remove('active');
  // Devuelve el scroll a la página
  document.body.style.overflow = 'auto'; 
}
function updateCardVisual() {
  const name = document.getElementById('cardName').value;
  const num = document.getElementById('cardNum').value;
  const exp = document.getElementById('cardExp').value;

  document.getElementById('cardNameDisplay').textContent = name || "NOMBRE COMPLETO";
  document.getElementById('cardNumDisplay').textContent = num ? num.replace(/(.{4})/g, '$1 ') : "**** **** **** ****";
  document.getElementById('cardExpDisplay').textContent = exp || "MM/AA";
}

function processPayment(event) {
  event.preventDefault();
  
  // Mostrar animación de carga
  const loader = document.getElementById('paymentLoading');
  loader.style.display = 'flex';

  // Simular procesamiento del banco (2 segundos)
  setTimeout(() => {
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    const currentEvents = JSON.parse(localStorage.getItem('events') || '[]');

    cart.forEach(item => {
      const eventIdx = currentEvents.findIndex(e => e.id === item.eventId);
      if (eventIdx !== -1) {
        // Registrar venta
        sales.push({
          id: `V-${Date.now()}`,
          eventId: item.eventId,
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          quantity: item.quantity,
          total: currentEvents[eventIdx].price * item.quantity,
          date: new Date().toISOString()
        });
        // Restar stock
        currentEvents[eventIdx].availableTickets -= item.quantity;
      }
    });

    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('events', JSON.stringify(currentEvents));
    localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify([]));

    loader.innerHTML = `
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <p style="margin-top: 1rem; color: #10b981; font-weight: 700;">¡Pago Exitoso!</p>
    `;

    setTimeout(() => {
      window.location.href = 'events.html';
    }, 1500);
  }, 2000);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

checkAuth();
loadCart();