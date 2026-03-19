let allEvents = [];
let currentUser = null;

// Check authentication
function checkAuth() {
  const user = localStorage.getItem('currentUser');
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  currentUser = JSON.parse(user);
  
  // Update UI with user info
  document.getElementById('userName').textContent = currentUser.name;
  
  if (currentUser.role === 'admin') {
    const badge = document.createElement('span');
    badge.className = 'badge badge-purple';
    badge.innerHTML = '★ Admin';
    document.getElementById('userBadge').appendChild(badge);
    document.getElementById('adminBtn').classList.remove('hidden');
  }
  
  updateCartCount();
}

// Load events
async function loadEvents() {
  const events = JSON.parse(localStorage.getItem('events') || '[]');
  allEvents = events;
  
  // Load filters
  const response = await fetch('data.json');
  const data = await response.json();
  
  const cityFilter = document.getElementById('cityFilter');
  data.cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });
  
  const categoryFilter = document.getElementById('categoryFilter');
  data.categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  filterEvents();
}

// Filter events
function filterEvents() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const selectedCity = document.getElementById('cityFilter').value;
  const selectedCategory = document.getElementById('categoryFilter').value;
  
  const filtered = allEvents.filter(event => {
    if (event.suspended && currentUser.role !== 'admin') return false;
    
    const matchesSearch = event.name.toLowerCase().includes(searchTerm) || 
                         event.description.toLowerCase().includes(searchTerm);
    const matchesCity = selectedCity === 'Todas' || event.city === selectedCity;
    const matchesCategory = selectedCategory === 'Todas' || event.category === selectedCategory;
    
    return matchesSearch && matchesCity && matchesCategory;
  });
  
  displayEvents(filtered);
}

// Display events
function displayEvents(events) {
  const grid = document.getElementById('eventsGrid');
  const noEvents = document.getElementById('noEvents');
  const eventCount = document.getElementById('eventCount');
  
  eventCount.textContent = `${events.length} evento${events.length !== 1 ? 's' : ''} encontrado${events.length !== 1 ? 's' : ''}`;
  
  if (events.length === 0) {
    grid.innerHTML = '';
    noEvents.classList.remove('hidden');
    return;
  }
  
  noEvents.classList.add('hidden');
  
  grid.innerHTML = events.map(event => `
    <div class="card event-card">
      <div class="image-badges">
        <img src="${event.imageUrl}" alt="${event.name}" class="event-image">
        <div class="badge-overlay badge-left">
          <span class="badge badge-purple">${event.category}</span>
        </div>
        ${event.suspended ? '<div class="badge-overlay badge-right"><span class="badge badge-red">Suspendido</span></div>' : ''}
      </div>
      <div class="event-content">
        <h3 class="event-title">${event.name}</h3>
        <p class="event-description">${event.description}</p>
        <div class="event-details">
          <div class="event-detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>${formatDate(event.date)} - ${event.time}</span>
          </div>
          <div class="event-detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${event.city}</span>
          </div>
          <div class="event-detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span>${event.availableTickets} tickets disponibles</span>
          </div>
        </div>
        <div class="event-price">Q${event.price.toFixed(2)}</div>
      </div>
      <div class="event-footer">
        <button class="btn btn-primary btn-full" onclick="viewEvent('${event.id}')" ${event.suspended && currentUser.role !== 'admin' ? 'disabled' : ''}>
          Ver Detalles
        </button>
      </div>
    </div>
  `).join('');
}

// Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' });
}

// View event detail
function viewEvent(id) {
  window.location.href = `event-detail.html?id=${id}`;
}

// Update cart count
function updateCartCount() {
  if (!currentUser) return;
  const cart = JSON.parse(localStorage.getItem(`cart_${currentUser.id}`) || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = totalItems;
}

// Logout
function handleLogout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
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
  loadEvents();
});
