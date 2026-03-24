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

// --- LÓGICA DE PAGO MEJORADA ---

function openPaymentModal() {
  // Asegúrate de que en tu CSS .payment-modal.active tenga display: flex o visibility: visible
  const modal = document.getElementById('paymentModal');
  modal.classList.add('active');
  modal.style.display = 'flex'; // Forzamos el display si el CSS no lo hace
  document.body.style.overflow = 'hidden'; 
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  modal.classList.remove('active');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto'; 
}

function updateCardVisual() {
  const nameInput = document.getElementById('cardName');
  const numInput = document.getElementById('cardNum');
  const expInput = document.getElementById('cardExp');

  // 1. Limpiar y formatear Número de Tarjeta (solo números, max 16)
  let numValue = numInput.value.replace(/\D/g, ''); // Elimina lo que no sea número
  if (numValue.length > 16) numValue = numValue.slice(0, 16);
  numInput.value = numValue.replace(/(\d{4})(?=\d)/g, '$1 '); // Agrega espacios visuales al input

  // 2. Formatear Expiración (MM/AA)
  let expValue = expInput.value.replace(/\D/g, '');
  if (expValue.length > 4) expValue = expValue.slice(0, 4);
  if (expValue.length >= 3) {
    expInput.value = expValue.slice(0, 2) + '/' + expValue.slice(2);
  } else {
    expInput.value = expValue;
  }

  // 3. Actualizar el dibujo de la tarjeta
  document.getElementById('cardNameDisplay').textContent = nameInput.value.toUpperCase() || "NOMBRE COMPLETO";
  
  // El número en la tarjeta se ve con asteriscos si está vacío
  const rawNum = numInput.value;
  document.getElementById('cardNumDisplay').textContent = rawNum || "**** **** **** ****";
  
  document.getElementById('cardExpDisplay').textContent = expInput.value || "MM/AA";
}

function processPayment(event) {
  event.preventDefault();
  
  // Validaciones básicas antes de procesar
  const cardNum = document.getElementById('cardNum').value.replace(/\s/g, '');
  if (cardNum.length < 10) {
    alert("Por favor, ingresa un número de tarjeta válido de 10 dígitos.");
    return;
  }

  const loader = document.getElementById('paymentLoading');
  loader.style.display = 'flex';

  setTimeout(() => {
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    const currentEvents = JSON.parse(localStorage.getItem('events') || '[]');

    // Usamos una variable para controlar si todo salió bien
    let success = true;

    cart.forEach(item => {
      const eventIdx = currentEvents.findIndex(e => e.id === item.eventId);
      if (eventIdx !== -1) {
        if (currentEvents[eventIdx].availableTickets >= item.quantity) {
          sales.push({
            id: `V-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            eventId: item.eventId,
            userId: currentUser.id,
            userName: currentUser.name,
            quantity: item.quantity,
            total: currentEvents[eventIdx].price * item.quantity,
            date: new Date().toISOString()
          });
          currentEvents[eventIdx].availableTickets -= item.quantity;
        } else {
          success = false;
          alert(`Lo sentimos, ya no hay boletos suficientes para: ${currentEvents[eventIdx].name}`);
        }
      }
    });

    if (success) {
      localStorage.setItem('sales', JSON.stringify(sales));
      localStorage.setItem('events', JSON.stringify(currentEvents));
      localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify([]));

      loader.innerHTML = `
        <div style="text-align: center;">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p style="margin-top: 1rem; color: #10b981; font-weight: 700;">¡Pago Exitoso!</p>
        </div>
      `;

      setTimeout(() => {
        window.location.href = 'events.html';
      }, 2000);
    } else {
      loader.style.display = 'none'; // Si falló por stock, ocultamos el cargando
    }
  }, 2000);
}

checkAuth();
loadCart();