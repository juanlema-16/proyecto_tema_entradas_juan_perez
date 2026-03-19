let currentUser = null;
let currentEvent = null;

// Check authentication
function checkAuth() {
  const user = localStorage.getItem('currentUser');
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  currentUser = JSON.parse(user);
}

// Load event detail
function loadEventDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  
  if (!eventId) {
    window.location.href = 'events.html';
    return;
  }
  
  const events = JSON.parse(localStorage.getItem('events') || '[]');
  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    document.getElementById('eventDetail').innerHTML = `
      <div class="card" style="padding: 2rem; text-align: center;">
        <p style="font-size: 1.25rem; margin-bottom: 1rem;">Evento no encontrado</p>
        <button class="btn btn-primary" onclick="window.location.href='events.html'">Volver a eventos</button>
      </div>
    `;
    return;
  }
  
  currentEvent = event;
  displayEventDetail(event);
}

// Display event detail
function displayEventDetail(event) {
  const detailContainer = document.getElementById('eventDetail');
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-GT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  detailContainer.innerHTML = `
    <div class="detail-grid">
      <div class="image-badges">
        <img src="${event.imageUrl}" alt="${event.name}" class="detail-image">
        ${event.suspended ? '<div class="badge-overlay badge-right" style="top: 1rem; right: 1rem;"><span class="badge badge-red" style="font-size: 1rem; padding: 0.5rem 1rem;">Suspendido</span></div>' : ''}
      </div>
      
      <div class="detail-info">
        <div>
          <span class="badge badge-purple" style="margin-bottom: 0.5rem;">${event.category}</span>
          <h1>${event.name}</h1>
          <p>${event.description}</p>
        </div>
        
        <div class="detail-list">
          <div class="detail-list-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>${formatDate(event.date)}</span>
          </div>
          <div class="detail-list-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>${event.time}</span>
          </div>
          <div class="detail-list-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${event.city}</span>
          </div>
          <div class="detail-list-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span>${event.availableTickets} tickets disponibles</span>
          </div>
        </div>
        
        <div class="detail-pricing">
          <p class="price-large">
            Q${event.price.toFixed(2)} <span class="price-small">por ticket</span>
          </p>
          
          ${!event.suspended ? `
            <div class="quantity-group">
              <label for="quantity" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Cantidad de tickets</label>
              <input type="number" id="quantity" class="input" value="1" min="1" max="${event.availableTickets}" onchange="updateTotal()">
            </div>
            <div class="button-group">
              <button class="btn btn-primary" style="flex: 1; font-size: 1rem;" onclick="addToCart()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Agregar al Carrito
              </button>
              <button class="btn btn-secondary" style="font-size: 1rem;" onclick="window.location.href='cart.html'">
                Ver Carrito
              </button>
            </div>
            <p class="total-price" id="totalPrice">Total: Q${event.price.toFixed(2)}</p>
          ` : `
            ${currentUser.role !== 'admin' ? `
              <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1rem;">
                <p style="color: #991b1b;">Este evento está temporalmente suspendido y no está disponible para compra.</p>
              </div>
            ` : ''}
          `}
        </div>
      </div>
    </div>
  `;
}

// Update total
function updateTotal() {
  if (!currentEvent) return;
  
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const total = currentEvent.price * quantity;
  document.getElementById('totalPrice').textContent = `Total: Q${total.toFixed(2)}`;
}

// Add to cart
function addToCart() {
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  
  if (quantity > currentEvent.availableTickets) {
    showToast('No hay suficientes tickets disponibles', 'error');
    return;
  }
  
  const cart = JSON.parse(localStorage.getItem(`cart_${currentUser.id}`) || '[]');
  const existingItem = cart.find(item => item.eventId === currentEvent.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      eventId: currentEvent.id,
      quantity: quantity
    });
  }
  
  localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
  showToast(`${quantity} ticket(s) agregado(s) al carrito`, 'success');
}

// Show toast
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadEventDetail();
});
