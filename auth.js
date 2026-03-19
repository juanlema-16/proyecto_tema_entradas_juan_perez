// Initialize default data
async function initializeData() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(data.defaultUsers));
    }
    
    if (!localStorage.getItem('events')) {
      localStorage.setItem('events', JSON.stringify(data.defaultEvents));
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Switch between login and register tabs
function switchTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabs = document.querySelectorAll('.tab');
  
  tabs.forEach(t => t.classList.remove('active'));
  
  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabs[0].classList.add('active');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    tabs[1].classList.add('active');
  }
}

// Handle login
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    showToast('Inicio de sesión exitoso', 'success');
    setTimeout(() => {
      window.location.href = 'events.html';
    }, 500);
  } else {
    showToast('Credenciales incorrectas', 'error');
  }
}

// Handle register
function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.find(u => u.email === email)) {
    showToast('El correo ya está registrado', 'error');
    return;
  }
  
  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    name,
    role: 'user'
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  const userSession = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role
  };
  localStorage.setItem('currentUser', JSON.stringify(userSession));
  
  showToast('Cuenta creada exitosamente', 'success');
  setTimeout(() => {
    window.location.href = 'events.html';
  }, 500);
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Check if user is already logged in
function checkAuth() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    window.location.href = 'events.html';
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  initializeData();
  checkAuth();
});
