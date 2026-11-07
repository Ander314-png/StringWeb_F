/* --- CONFIGURACIÓN GLOBAL --- */
const STRINGWEB_CONFIG = {
    whatsappNumber: "573108111774",
    whatsappBase: "https://wa.me/"
};

// Año en footer
document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());

/* --- MENÚ HAMBURGUESA MÓVIL DEFINITIVO --- */
document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.getElementById("main-nav");

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        // Cierra el menú automáticamente al hacer clic en cualquier opción de navegación
        mainNav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mainNav.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }
});

// Animaciones Reveal al hacer scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// MODO OSCURO / CLARO (Cyber Violet Toggle)
const themeBtn = document.getElementById("theme-btn");
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}
themeBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// PARTÍCULAS.JS (Solo si existe el contenedor en el inicio)
if (document.getElementById("particles-js")) {
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 40, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#8b5cf6" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.4, "random": true },
            "size": { "value": 3, "random": true },
            "line_linked": { "enable": true, "distance": 150, "color": "#6d28d9", "opacity": 0.25, "width": 1 },
            "move": { "enable": true, "speed": 1.5, "direction": "none", "out_mode": "out" }
        },
        "interactivity": {
            "events": { "onhover": { "enable": true, "mode": "grab" } }
        }
    });
}

// CARRITO DE COMPRAS EDITABLE (Catálogo)
let carrito = JSON.parse(localStorage.getItem("carrito_stringweb")) || [];

const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const openCartBtn = document.getElementById("open-cart-btn");
const closeCartBtn = document.getElementById("close-cart");

openCartBtn?.addEventListener("click", () => {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
});
closeCartBtn?.addEventListener("click", () => {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
});
cartOverlay?.addEventListener("click", () => {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
});

function guardarCarrito() {
    localStorage.setItem("carrito_stringweb", JSON.stringify(carrito));
    actualizarCarritoUI();
}

function agregarAlCarrito(nombre, precio) {
    const itemExistente = carrito.find(item => item.nombre === nombre);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    guardarCarrito();
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
}

function cambiarCantidad(index, delta) {
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    guardarCarrito();
}

function actualizarCarritoUI() {
    const lista = document.getElementById("cart-items-list");
    const contador = document.getElementById("cart-counter");
    const totalElem = document.getElementById("cart-total-amount");
    
    if (!lista) return;

    lista.innerHTML = "";
    let total = 0;
    let totalItems = 0;

    if (carrito.length === 0) {
        lista.innerHTML = "<p style='text-align:center; color:var(--muted); margin-top:20px;'>Tu carrito está vacío.</p>";
    }

    carrito.forEach((item, index) => {
        let subtotal = item.precio * item.cantidad;
        total += subtotal;
        totalItems += item.cantidad;

        const li = document.createElement("li");
        li.className = "cart-item-row";
        li.innerHTML = `
            <div>
                <strong>${item.nombre}</strong><br>
                <small>$${item.precio.toLocaleString()} COP c/u</small>
            </div>
            <div style="text-align:right;">
                <div class="cart-item-controls">
                    <button onclick="cambiarCantidad(${index}, -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${index}, 1)">+</button>
                </div>
                <small><strong>$${subtotal.toLocaleString()}</strong></small>
            </div>
        `;
        lista.appendChild(li);
    });

    if (contador) contador.textContent = totalItems;
    if (totalElem) totalElem.textContent = `$${total.toLocaleString()} COP`;
}

// Inicializar vista del carrito al cargar
actualizarCarritoUI();

function finalizarCompraWhatsApp() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    let mensaje = "Hola StringWeb 👋, quiero adquirir los siguientes servicios:%0A%0A";
    let total = 0;
    carrito.forEach(item => {
        let sub = item.precio * item.cantidad;
        mensaje += `- ${item.nombre} (x${item.cantidad}): $${sub.toLocaleString()} COP%0A`;
        total += sub;
    });
    mensaje += `%0A*Total a pagar: $${total.toLocaleString()} COP*`;
    window.open(`${STRINGWEB_CONFIG.whatsappBase}${STRINGWEB_CONFIG.whatsappNumber}?text=${mensaje}`, "_blank");
}

// GENERAR FACTURA EN PDF (Ventana de impresión limpia)
function generarFacturaPDF() {
    if (carrito.length === 0) {
        alert("Añade servicios al carrito antes de generar la factura.");
        return;
    }
    document.getElementById("invoice-date").textContent = new Date().toLocaleDateString();
    const tbody = document.getElementById("invoice-table-body");
    tbody.innerHTML = "";
    let total = 0;

    carrito.forEach(item => {
        let sub = item.precio * item.cantidad;
        total += sub;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="padding: 10px; border: 1px solid #ddd;">${item.nombre}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.cantidad}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">$${sub.toLocaleString()} COP</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("invoice-total-text").textContent = `Total: $${total.toLocaleString()} COP`;
    window.print();
}

// Formulario de Contacto
const contactForm = document.getElementById("contact-form");
const successBox = document.getElementById("form-success");

contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    const texto = `Hola StringWeb 👋,%0AMi nombre es *${data.name}* (${data.business}).%0AWhatsApp: ${data.whatsapp}%0ACorreo: ${data.email || "No indicó"}%0ATiene web: ${data.hasWebsite}%0A%0AMensaje: ${data.message || "Quiero orientación."}`;
    window.open(`${STRINGWEB_CONFIG.whatsappBase}${STRINGWEB_CONFIG.whatsappNumber}?text=${texto}`, "_blank");
    
    if (successBox) {
        successBox.hidden = false;
        successBox.textContent = "¡Perfecto! Se ha abierto WhatsApp con tu mensaje listo.";
    }
});

/* --- GESTIÓN DE LA GALERÍA (Unsplash) --- */
const UNSPLASH_ACCESS_KEY = 'TU_ACCESS_KEY_AQUI'; // Reemplaza esto con tu Access Key de Unsplash

const galleryGrid = document.getElementById('galleryGrid');
const gallerySearchInput = document.getElementById('searchInput');
const gallerySearchBtn = document.getElementById('searchBtn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeBtn = document.getElementById('closeBtn');

async function buscarFotosGaleria() {
    if (!galleryGrid) return; // Se ejecuta solo si estamos en galeria.html

    const query = gallerySearchInput ? gallerySearchInput.value : 'boyaca colombia';
    galleryGrid.innerHTML = '<p style="text-align:center; color:var(--muted); grid-column: 1/-1;">Cargando fotos...</p>';

    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(query)}&per_page=12&client_id=${UNSPLASH_ACCESS_KEY}`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            galleryGrid.innerHTML = '<p style="text-align:center; color:var(--muted); grid-column: 1/-1;">No se encontraron fotos.</p>';
            return;
        }

        galleryGrid.innerHTML = data.results.map(foto => `
            <div class="gallery-card" data-full="${foto.urls.regular}" style="position: relative; border-radius: 10px; overflow: hidden; background: #18181b; cursor: pointer; aspect-ratio: 4/3;">
                <img src="${foto.urls.small}" alt="${foto.alt_description || 'Foto de Unsplash'}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
                <div class="gallery-overlay" style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); opacity: 0; transition: opacity 0.3s ease; display: flex; align-items: flex-end; padding: 1rem; color: #fff; font-size: 0.85rem;">
                    <span>📷 ${foto.user.name}</span>
                </div>
            </div>
        `).join('');

        // Efecto hover y apertura de Lightbox
        document.querySelectorAll('.gallery-card').forEach(card => {
            const overlay = card.querySelector('.gallery-overlay');
            card.addEventListener('mouseenter', () => overlay.style.opacity = '1');
            card.addEventListener('mouseleave', () => overlay.style.opacity = '0');

            card.addEventListener('click', () => {
                const imgUrl = card.getAttribute('data-full');
                if (lightboxImg && lightbox) {
                    lightboxImg.src = imgUrl;
                    lightbox.classList.add('active');
                }
            });
        });

    } catch (error) {
        console.error('Error al conectar con Unsplash:', error);
        galleryGrid.innerHTML = '<p style="text-align:center; color:var(--muted); grid-column: 1/-1;">Error al cargar las fotos. Revisa tu Access Key de Unsplash.</p>';
    }
}

// Event Listeners para la galería
if (gallerySearchBtn) {
    gallerySearchBtn.addEventListener('click', buscarFotosGaleria);
}

if (gallerySearchInput) {
    gallerySearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') buscarFotosGaleria();
    });
}

if (closeBtn && lightbox) {
    closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.remove('active');
    });
}

// Carga automática al entrar a galeria.html
document.addEventListener('DOMContentLoaded', buscarFotosGaleria);