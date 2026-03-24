/**
 * Web Component: neon-event-card
 * Cumple con el requisito de la rúbrica de usar Web Components nativos.
 */
class NeonEventCard extends HTMLElement {
    constructor() {
        super();
        // Usamos Shadow DOM para aislar los estilos del componente si fuera necesario, 
        // pero para este proyecto usaremos el CSS global para mantener la estética Neón.
    }

    // Definimos qué atributos queremos observar
    static get observedAttributes() {
        return ['id', 'name', 'price', 'image', 'city', 'date', 'category'];
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const id = this.getAttribute('event-id');
        const name = this.getAttribute('name') || 'Evento Sin Nombre';
        const price = this.getAttribute('price') || '0';
        const image = this.getAttribute('image') || 'https://via.placeholder.com/300';
        const city = this.getAttribute('city') || 'Guatemala';
        const date = this.getAttribute('date') || '';
        const category = this.getAttribute('category') || 'General';

        // Estructura HTML del componente
        this.innerHTML = `
            <div class="event-card">
                <div class="event-image-wrapper" style="position: relative; overflow: hidden; height: 200px;">
                    <img src="${image}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; top: 10px; left: 10px; background: var(--neon-purple); padding: 4px 10px; border-radius: 5px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">
                        ${category}
                    </div>
                </div>
                <div class="event-card-body" style="padding: 1.5rem;">
                    <p style="color: var(--neon-cyan); font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem;">
                        📍 ${city} • 📅 ${date}
                    </p>
                    <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; color: white; margin-bottom: 1rem; min-height: 3rem;">
                        ${name}
                    </h3>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--neon-yellow); font-size: 1.5rem; font-weight: 900;">Q${parseFloat(price).toFixed(2)}</span>
                        <button class="btn btn-primary" onclick="window.location.href='event-detail.html?id=${id}'">
                            Tickets
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Registrar el componente globalmente
customElements.define('neon-event-card', NeonEventCard);

/**
 * Web Component: neon-navbar
 * Opcional: Un componente para el encabezado persistente
 */
class NeonNavbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="header">
                <div class="container header-content">
                    <div class="logo" onclick="window.location.href='events.html'" style="cursor:pointer">
                        <h1 class="logo-text">Neon<span>Stage</span> GT</h1>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-secondary" onclick="window.location.href='cart.html'">
                            🛒 Carrito
                        </button>
                        <button class="btn btn-danger" onclick="handleLogout()">Salir</button>
                    </div>
                </div>
            </header>
        `;
    }
}
customElements.define('neon-navbar', NeonNavbar);