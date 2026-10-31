/* --- CONFIGURACIÓN GLOBAL --- */
const STRINGWEB_CONFIG = {
    whatsappNumber: "573108111774",
    whatsappBase: "https://wa.me/"
};

// Año en footer
document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());

// Menú Hamburguesa Móvil
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
menuToggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
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