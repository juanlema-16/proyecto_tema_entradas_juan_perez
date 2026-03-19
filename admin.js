let currentUser = null;
let events = [];
let sales = [];
let editingEventId = null;
let cities = [];
let categories = [];

function checkAuth() {
  const user = localStorage.getItem('currentUser');
  if (!user) { window.location.href = 'index.html'; return; }
  currentUser = JSON.parse(user);
  if (currentUser.role !== 'admin') { window.location.href = 'events.html'; }
}

async function loadData() {
  const response = await fetch('data.json');
  const data = await response.json();
  
  // Cargar Categorías (Prioridad LocalStorage)
  const savedCats = localStorage.getItem('categories');
  categories = savedCats ? JSON.parse(savedCats) : data.categories.filter(c => c !== 'Todas');
  if (!savedCats) localStorage.setItem('categories', JSON.stringify(categories));

  // Cargar Ciudades (Prioridad LocalStorage)
  const savedCities = localStorage.getItem('cities');
  cities = savedCities ? JSON.parse(savedCities) : data.cities.filter(c => c !== 'Todas');
  if (!savedCities) localStorage.setItem('cities', JSON.stringify(cities));

  events = JSON.parse(localStorage.getItem('events') || '[]');
  sales = JSON.parse(localStorage.getItem('sales') || '[]');
  
  populateSelects();
  displayEvents();
  displaySales();
  displayCategories();
  displayCities();
}

function populateSelects() {
  const selects = [
    { id: 'addCity', options: cities }, { id: 'editCity', options: cities },
    { id: 'addCategory', options: categories }, { id: 'editCategory', options: categories }
  ];
  selects.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) el.innerHTML = s.options.map(o => `<option value="${o}">${o}</option>`).join('');
  });
}

function switchTab(tab) {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach(t => t.classList.remove('active'));
  contents.forEach(c => c.classList.remove('active'));
  
  document.getElementById(`${tab}Tab`).classList.add('active');
  const activeIdx = tab === 'events' ? 0 : tab === 'sales' ? 1 : tab === 'categories' ? 2 : 3;
  tabs[activeIdx].classList.add('active');

  if(tab === 'categories') displayCategories();
  if(tab === 'cities') displayCities();
}

// --- GESTIÓN DE CIUDADES ---
function displayCities() {
  const tbody = document.getElementById('citiesTableBody');
  if (!tbody) return;
  tbody.innerHTML = cities.map((city, index) => `
    <tr>
      <td>${city}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary" onclick="editCityPrompt('${city}', ${index})">Editar</button>
          <button class="btn btn-danger" onclick="deleteCity(${index})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function addCityPrompt() {
  const name = prompt("Nombre de la nueva ciudad:");
  if (name && name.trim() !== "") {
    cities.push(name.trim());
    saveCities();
  }
}

function editCityPrompt(oldName, index) {
  const newName = prompt("Editar ciudad:", oldName);
  if (newName && newName.trim() !== "") {
    cities[index] = newName.trim();
    saveCities();
  }
}

function deleteCity(index) {
  if (confirm(`¿Eliminar ciudad "${cities[index]}"?`)) {
    cities.splice(index, 1);
    saveCities();
  }
}

function saveCities() {
  localStorage.setItem('cities', JSON.stringify(cities));
  displayCities();
  populateSelects();
  showToast('Ciudades actualizadas');
}

// --- GESTIÓN DE CATEGORÍAS ---
function displayCategories() {
  const tbody = document.getElementById('categoriesTableBody');
  if (!tbody) return;
  tbody.innerHTML = categories.map((cat, index) => `
    <tr>
      <td>${cat}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary" onclick="editCategoryPrompt('${cat}', ${index})">Editar</button>
          <button class="btn btn-danger" onclick="deleteCategory(${index})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function addCategoryPrompt() {
  const name = prompt("Nueva categoría:");
  if (name && name.trim() !== "") { categories.push(name.trim()); saveCats(); }
}

function editCategoryPrompt(oldName, index) {
  const newName = prompt("Editar categoría:", oldName);
  if (newName && newName.trim() !== "") { categories[index] = newName.trim(); saveCats(); }
}

function deleteCategory(index) {
  if (confirm(`¿Eliminar categoría "${categories[index]}"?`)) { categories.splice(index, 1); saveCats(); }
}

function saveCats() {
  localStorage.setItem('categories', JSON.stringify(categories));
  displayCategories();
  populateSelects();
  showToast('Categorías actualizadas');
}

// --- RESTO DE LÓGICA (EVENTOS Y VENTAS) ---
function displayEvents() {
  const tbody = document.getElementById('eventsTableBody');
  tbody.innerHTML = events.map(e => `
    <tr>
      <td>${e.name}</td>
      <td>${e.date} ${e.time}</td>
      <td>${e.city}</td>
      <td>Q${e.price}</td>
      <td>${e.availableTickets}</td>
      <td><span class="badge ${e.suspended ? 'badge-red' : 'badge-green'}">${e.suspended ? 'Suspendido' : 'Activo'}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary" onclick="openEditModal('${e.id}')">Editar</button>
          <button class="btn ${e.suspended ? 'btn-primary' : 'btn-danger'}" onclick="toggleStatus('${e.id}')">${e.suspended ? 'Activar' : 'Suspender'}</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function displaySales() {
  const tbody = document.getElementById('salesTableBody');
  let total = 0;
  tbody.innerHTML = sales.map(s => {
    total += s.total;
    return `<tr><td>${s.id.slice(0,5)}</td><td>${s.userName}</td><td>${s.quantity}</td><td>Q${s.total}</td><td>${s.date.split('T')[0]}</td></tr>`;
  }).join('');
  document.getElementById('totalSales').textContent = `Total: Q${total.toFixed(2)}`;
}

function toggleStatus(id) {
  const event = events.find(e => e.id === id);
  if (event) { event.suspended = !event.suspended; localStorage.setItem('events', JSON.stringify(events)); displayEvents(); }
}

function openAddModal() { document.getElementById('addModal').classList.add('active'); }
function closeAddModal() { document.getElementById('addModal').classList.remove('active'); document.getElementById('addEventForm').reset(); }

function handleAddEvent(e) {
  e.preventDefault();
  const newEv = {
    id: Date.now().toString(),
    name: document.getElementById('addName').value,
    description: document.getElementById('addDescription').value,
    date: document.getElementById('addDate').value,
    time: document.getElementById('addTime').value,
    city: document.getElementById('addCity').value,
    category: document.getElementById('addCategory').value,
    price: parseFloat(document.getElementById('addPrice').value),
    imageUrl: document.getElementById('addImageUrl').value,
    availableTickets: parseInt(document.getElementById('addTickets').value),
    suspended: false
  };
  events.push(newEv);
  localStorage.setItem('events', JSON.stringify(events));
  displayEvents(); closeAddModal();
}

function openEditModal(id) {
  const e = events.find(ev => ev.id === id);
  if (!e) return;
  editingEventId = id;
  document.getElementById('editName').value = e.name;
  document.getElementById('editCity').value = e.city;
  document.getElementById('editCategory').value = e.category;
  document.getElementById('editModal').classList.add('active');
}

function handleUpdateEvent(e) {
  e.preventDefault();
  const idx = events.findIndex(ev => ev.id === editingEventId);
  events[idx] = { ...events[idx], name: document.getElementById('editName').value, city: document.getElementById('editCity').value, category: document.getElementById('editCategory').value };
  localStorage.setItem('events', JSON.stringify(events));
  displayEvents(); closeEditModal();
}

function closeEditModal() { document.getElementById('editModal').classList.remove('active'); }

function showToast(msg) {
  const t = document.createElement('div'); t.className = 'toast success'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2000);
}

checkAuth();
loadData();