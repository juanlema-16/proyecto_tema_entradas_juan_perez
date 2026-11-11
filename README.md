# 🎟️ TODOTICKET-GT — Venta de entradas para eventos

Aplicación web para descubrir y comprar entradas de **conciertos y eventos en Guatemala**.
Tiene inicio de sesión, catálogo de eventos, carrito de compras con pago simulado y un panel de administración.

## ✨ Funcionalidades
- 🔐 **Login y registro** de usuarios con roles (`admin` / `user`).
- 🎤 **Catálogo de eventos** con filtros y una página de detalle por evento.
- 🛒 **Carrito**: agregar entradas, calcular el total y simular el pago con tarjeta.
- 🛠️ **Panel de administrador**: CRUD de eventos, ciudades y categorías, activar o desactivar eventos y ver las ventas.
- 💾 Persistencia en el navegador con **localStorage** (datos iniciales en `data.json`).

## 🛠️ Tecnologías
HTML5 · CSS3 · JavaScript (Vanilla) · localStorage

## 📂 Estructura
| Archivo | Descripción |
|---|---|
| `index.html` / `auth.js` | Login y registro |
| `events.html` / `events.js` | Listado de eventos |
| `event-detail.html` / `event-detail.js` | Detalle y compra de un evento |
| `cart.html` / `cart.js` | Carrito y pago |
| `admin.html` / `admin.js` | Panel de administración |
| `components.js` | Componentes reutilizables |
| `data.json` | Datos iniciales (usuarios, eventos, ciudades) |
| `styles.css` | Estilos |

## ▶️ Cómo ejecutarlo
1. Clona el repositorio:
   ```bash
   git clone https://github.com/juanlema-16/proyecto_tema_entradas_juan_perez.git
   ```
2. Ábrelo en VS Code y ejecuta `index.html` con la extensión **Live Server** (se necesita un servidor local para leer `data.json`).

### Usuarios de prueba
| Rol | Correo | Contraseña |
|---|---|---|
| Admin | admin@eventos.gt | admin123 |
| Usuario | usuario@eventos.gt | user123 |

## 👤 Autor
**Juan José Pérez Lema** — [GitHub](https://github.com/juanlema-16) · [LinkedIn](https://linkedin.com/in/juan-lema-a2b812396)
