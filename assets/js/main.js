/* =========================================================
   SAKHO ÉLECTRONIC – script du site vitrine
   Pour modifier les produits : éditez simplement la liste
   PRODUCTS ci-dessous (nom, description, prix, image, catégorie).
   Laissez price à null pour afficher « Prix sur demande ».
   Gardez un id unique (sans espace) par produit : il sert au panier.
   ========================================================= */

const WHATSAPP_NUMBER = '221779329678';

// URL de l'application Web Google Apps Script qui enregistre les commandes
// dans le Google Sheet (voir apps-script/INSTRUCTIONS.md).
const ORDER_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzw3r2D1VpUCeDmGd9eekVggUbKhcpSIupj65jcLvn7-IqPSDbeA7Wl1t60x-iTdzh5XQ/exec';

const PRODUCTS = [
  { id: 'iphone', name: 'iPhone', desc: 'Les derniers modèles Apple, neufs et garantis.', price: null, img: 'p-iphone.jpg', cat: 'smartphones' },
  { id: 'samsung-galaxy', name: 'Samsung Galaxy', desc: 'Gamme Galaxy S, A et Z pour tous les budgets.', price: null, img: 'p-samsung.jpg', cat: 'smartphones' },
  { id: 'xiaomi', name: 'Xiaomi', desc: 'Redmi et Xiaomi : performance au meilleur prix.', price: null, img: 'p-xiaomi.jpg', cat: 'smartphones' },
  { id: 'infinix', name: 'Infinix', desc: 'Grands écrans et grosse autonomie.', price: null, img: 'cat-smartphones.jpg', cat: 'smartphones' },
  { id: 'tecno', name: 'Tecno', desc: 'Smartphones fiables, photo et batterie au top.', price: null, img: 'p-samsung.jpg', cat: 'smartphones' },
  { id: 'ordinateurs-portables', name: 'Ordinateurs portables', desc: 'HP, Lenovo, Asus, MacBook… pour le travail et les études.', price: null, img: 'p-laptop.jpg', cat: 'ordinateurs' },
  { id: 'airpods', name: 'AirPods', desc: 'Écouteurs sans fil Apple avec boîtier de charge.', price: null, img: 'p-airpods.jpg', cat: 'audio' },
  { id: 'ecouteurs-bluetooth', name: 'Écouteurs Bluetooth', desc: 'Casques et écouteurs sans fil, son de qualité.', price: null, img: 'cat-audio.jpg', cat: 'audio' },
  { id: 'montres-connectees', name: 'Montres connectées', desc: 'Suivi santé, sport et notifications au poignet.', price: null, img: 'p-montre.jpg', cat: 'montres' },
  { id: 'chargeurs', name: 'Chargeurs', desc: 'Chargeurs rapides USB-C et adaptateurs secteur.', price: null, img: 'p-chargeur.jpg', cat: 'chargeurs' },
  { id: 'coques', name: 'Coques', desc: 'Coques de protection pour tous les modèles.', price: null, img: 'p-coque.jpg', cat: 'accessoires' },
  { id: 'cables-usb', name: 'Câbles USB', desc: 'Câbles USB-C, Lightning et micro-USB résistants.', price: null, img: 'cat-cables.jpg', cat: 'chargeurs' },
];

const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
const CART_KEY = 'sakho-cart';
const MAX_QTY = 20;

function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function money(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

function formatPrice(price) {
  if (price == null) return '<span class="product__price product__price--ask">Prix sur demande</span>';
  return `<span class="product__price">${money(price)}</span>`;
}

/* ---------- Panier (conservé dans le navigateur) ---------- */
let cart = loadCart();

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(l => l && PRODUCT_BY_ID[l.id])
      .map(l => ({ id: l.id, qty: Math.min(MAX_QTY, Math.max(1, parseInt(l.qty, 10) || 1)) }));
  } catch (e) {
    return [];
  }
}

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* stockage indisponible */ }
}

function cartCount() {
  return cart.reduce((n, l) => n + l.qty, 0);
}

function cartTotals() {
  let total = 0;
  let hasUnpriced = false;
  let hasPriced = false;
  cart.forEach(l => {
    const p = PRODUCT_BY_ID[l.id];
    if (p.price == null) hasUnpriced = true;
    else { hasPriced = true; total += p.price * l.qty; }
  });
  return { total, hasUnpriced, hasPriced };
}

function totalLabel() {
  const { total, hasUnpriced, hasPriced } = cartTotals();
  if (!hasPriced) return 'Prix sur demande';
  return hasUnpriced ? `${money(total)} + articles sur demande` : money(total);
}

function addToCart(id) {
  const line = cart.find(l => l.id === id);
  if (line) line.qty = Math.min(MAX_QTY, line.qty + 1);
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
}

function setQty(id, qty) {
  if (qty < 1) cart = cart.filter(l => l.id !== id);
  else cart.forEach(l => { if (l.id === id) l.qty = Math.min(MAX_QTY, qty); });
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function renderCart() {
  const count = cartCount();
  const badge = document.getElementById('cartCount');
  badge.textContent = count;
  badge.hidden = count === 0;

  const empty = cart.length === 0;
  document.getElementById('cartEmpty').hidden = !empty;
  document.getElementById('cartFoot').hidden = empty;

  document.getElementById('cartList').innerHTML = cart.map(l => {
    const p = PRODUCT_BY_ID[l.id];
    const price = p.price == null ? 'Prix sur demande' : money(p.price * l.qty);
    return `
      <li class="cart-item" data-id="${p.id}">
        <img src="assets/img/${p.img}" alt="" class="cart-item__img">
        <div class="cart-item__info">
          <p class="cart-item__name">${escapeHtml(p.name)}</p>
          <p class="cart-item__price${p.price == null ? ' cart-item__price--ask' : ''}">${price}</p>
          <div class="qty">
            <button type="button" class="qty__btn" data-action="dec" aria-label="Diminuer la quantité de ${escapeHtml(p.name)}">–</button>
            <span class="qty__value" aria-live="polite">${l.qty}</span>
            <button type="button" class="qty__btn" data-action="inc" aria-label="Augmenter la quantité de ${escapeHtml(p.name)}"${l.qty >= MAX_QTY ? ' disabled' : ''}>+</button>
          </div>
        </div>
        <button type="button" class="cart-item__remove" data-action="remove" aria-label="Retirer ${escapeHtml(p.name)} du panier">
          <svg viewBox="0 0 24 24"><use href="#i-trash"/></svg>
        </button>
      </li>`;
  }).join('');

  const { hasUnpriced } = cartTotals();
  document.getElementById('cartTotal').textContent = totalLabel();
  document.getElementById('cartNotice').hidden = !hasUnpriced;

  // Si le panier est vidé pendant la commande, revenir à la liste.
  if (empty && currentView === 'checkout') showView('items');
}

/* ---------- Tiroir du panier ---------- */
let currentView = 'items';
let lastFocus = null;

const VIEW_TITLES = { items: 'Mon panier', checkout: 'Ma commande', done: 'Commande envoyée' };

function showView(view) {
  currentView = view;
  document.querySelectorAll('.cart__view').forEach(v => { v.hidden = v.dataset.view !== view; });
  document.getElementById('cartTitle').textContent = VIEW_TITLES[view];
  document.getElementById('cartBack').hidden = view !== 'checkout';
  document.getElementById('cart').scrollTop = 0;
}

function openCart(view = 'items') {
  const drawer = document.getElementById('cart');
  lastFocus = document.activeElement;
  showView(view);
  document.getElementById('cartOverlay').hidden = false;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  document.getElementById('cartOpen').setAttribute('aria-expanded', 'true');
  document.body.classList.add('no-scroll');
  drawer.focus();
}

function closeCart() {
  const drawer = document.getElementById('cart');
  if (!drawer.classList.contains('is-open')) return;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  document.getElementById('cartOverlay').hidden = true;
  document.getElementById('cartOpen').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
  if (currentView === 'done') showView('items');
  if (lastFocus) lastFocus.focus();
}

/* ---------- Commande ---------- */
function normalizePhone(raw) {
  return raw.replace(/[\s.\-()]/g, '');
}

// Format international pour le Google Sheet : +221XXXXXXXXX
function internationalPhone(raw) {
  const p = normalizePhone(raw);
  if (p.startsWith('+221')) return p;
  if (p.startsWith('00221')) return '+' + p.slice(2);
  return '+221' + p;
}

// Mobiles sénégalais (70, 71, 75, 76, 77, 78) et fixes (33), avec ou sans +221 / 00221.
function isValidPhone(raw) {
  return /^(?:\+221|00221)?(?:7[015678]\d{7}|33\d{7})$/.test(normalizePhone(raw));
}

function setFieldError(input, message) {
  const field = input.closest('.field');
  field.classList.toggle('field--invalid', Boolean(message));
  field.querySelector('.field__error').textContent = message || '';
  if (input.type !== 'radio') input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function validateOrderForm(form) {
  const f = form.elements;
  const checks = [
    [f.name, f.name.value.trim().length >= 2 ? '' : 'Veuillez indiquer votre nom complet.'],
    [f.phone, !f.phone.value.trim() ? 'Veuillez indiquer votre numéro de téléphone.'
      : isValidPhone(f.phone.value) ? '' : 'Numéro invalide. Exemple : 77 123 45 67.'],
    [f.address, f.address.value.trim().length >= 3 ? '' : 'Veuillez indiquer votre adresse ou quartier.'],
    [f.payment[0], form.querySelector('input[name="payment"]:checked') ? '' : 'Veuillez choisir un mode de paiement.'],
  ];
  let firstInvalid = null;
  checks.forEach(([input, msg]) => {
    setFieldError(input, msg);
    if (msg && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

function makeOrderId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `SAK-${ymd}-${rand}`;
}

function buildOrder(form) {
  const f = form.elements;
  const items = cart.map(l => {
    const p = PRODUCT_BY_ID[l.id];
    return { name: p.name, qty: l.qty, price: p.price };
  });
  return {
    orderId: makeOrderId(),
    name: f.name.value.trim(),
    phone: internationalPhone(f.phone.value),
    address: f.address.value.trim(),
    city: f.city.value.trim() || 'Dakar',
    payment: form.querySelector('input[name="payment"]:checked').value,
    items,
    itemsText: items.map(i => `${i.name} × ${i.qty}`).join(', '),
    total: totalLabel(),
    note: f.note.value.trim(),
  };
}

function orderWhatsappMessage(order) {
  return [
    `Bonjour Sakho Électronic, je souhaite passer la commande ${order.orderId} :`,
    ...order.items.map(i => `- ${i.name} × ${i.qty}`),
    `Total : ${order.total}`,
    `Nom : ${order.name}`,
    `Téléphone : ${order.phone}`,
    `Adresse : ${order.address}, ${order.city}`,
    `Paiement : ${order.payment}`,
    order.note ? `Note : ${order.note}` : '',
  ].filter(Boolean).join('\n');
}

async function sendOrder(order) {
  if (!/^https:\/\//.test(ORDER_ENDPOINT)) throw new Error('ORDER_ENDPOINT non configuré');
  // text/plain évite la requête de pré-vérification CORS, non gérée par Apps Script.
  const res = await fetch(ORDER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Erreur inconnue');
}

function renderOrderSummary() {
  document.getElementById('orderSummary').innerHTML = `
    <p class="order-form__summary-title">Récapitulatif</p>
    <ul>${cart.map(l => `<li><span>${escapeHtml(PRODUCT_BY_ID[l.id].name)}</span><span>× ${l.qty}</span></li>`).join('')}</ul>
    <p class="order-form__summary-total"><span>Total</span><strong>${escapeHtml(totalLabel())}</strong></p>`;
}

async function onOrderSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const errorBox = document.getElementById('orderError');
  const submit = document.getElementById('orderSubmit');
  errorBox.hidden = true;
  if (cart.length === 0) { showView('items'); return; }
  if (!validateOrderForm(form)) return;

  const order = buildOrder(form);
  submit.disabled = true;
  submit.textContent = 'Envoi en cours…';
  try {
    await sendOrder(order);
    document.getElementById('doneId').textContent = order.orderId;
    clearCart();
    form.reset();
    form.elements.city.value = 'Dakar';
    showView('done');
  } catch (err) {
    console.error('Envoi de la commande impossible :', err);
    errorBox.innerHTML = `La commande n'a pas pu être envoyée. Vérifiez votre connexion et réessayez.
      <br>Si le problème continue, vous pouvez
      <a href="${waLink(orderWhatsappMessage(order))}" target="_blank" rel="noopener">envoyer la commande par WhatsApp</a>.`;
    errorBox.hidden = false;
  } finally {
    submit.disabled = false;
    submit.textContent = 'Envoyer ma commande';
  }
}

/* ---------- Produits ---------- */
function renderProducts() {
  const grid = document.getElementById('products');
  grid.innerHTML = PRODUCTS.map(p => `
      <article class="product" data-cat="${p.cat}">
        <div class="product__img"><img src="assets/img/${p.img}" alt="${escapeHtml(p.name)}" loading="lazy"></div>
        <div class="product__body">
          <h3 class="product__name">${escapeHtml(p.name)}</h3>
          <p class="product__desc">${escapeHtml(p.desc)}</p>
          ${formatPrice(p.price)}
          <button type="button" class="btn btn--primary btn--block add-to-cart" data-id="${p.id}">
            <svg class="ico" viewBox="0 0 24 24"><use href="#i-cart"/></svg> <span>Ajouter au panier</span>
          </button>
        </div>
      </article>`).join('');
}

function applyFilter(filter) {
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c.dataset.filter === filter));
  document.querySelectorAll('.product').forEach(p => {
    p.hidden = !(filter === 'all' || p.dataset.cat === filter);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCart();

  // Ajout au panier
  document.getElementById('products').addEventListener('click', e => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    addToCart(btn.dataset.id);
    const label = btn.querySelector('span');
    btn.classList.add('is-added');
    label.textContent = 'Ajouté ✓';
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.classList.remove('is-added'); label.textContent = 'Ajouter au panier'; }, 1400);
    const badge = document.getElementById('cartCount');
    badge.classList.remove('is-bump');
    void badge.offsetWidth;
    badge.classList.add('is-bump');
  });

  // Quantités / suppression dans le panier
  document.getElementById('cartList').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.closest('.cart-item').dataset.id;
    const line = cart.find(l => l.id === id);
    if (!line) return;
    if (btn.dataset.action === 'inc') setQty(id, line.qty + 1);
    if (btn.dataset.action === 'dec') setQty(id, line.qty - 1);
    if (btn.dataset.action === 'remove') setQty(id, 0);
  });

  document.getElementById('cartOpen').addEventListener('click', () => openCart());
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('cartBack').addEventListener('click', () => showView('items'));
  document.querySelectorAll('[data-close-cart]').forEach(el => el.addEventListener('click', closeCart));
  document.getElementById('cartClear').addEventListener('click', () => {
    if (confirm('Vider le panier ?')) clearCart();
  });
  document.getElementById('toCheckout').addEventListener('click', () => {
    renderOrderSummary();
    document.getElementById('orderError').hidden = true;
    showView('checkout');
    document.getElementById('f-name').focus();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  const orderForm = document.getElementById('orderForm');
  orderForm.addEventListener('submit', onOrderSubmit);
  // Effacer l'erreur d'un champ dès que le client le corrige
  orderForm.addEventListener('input', e => {
    if (e.target.closest('.field--invalid')) setFieldError(e.target, '');
  });

  // Synchroniser le panier entre plusieurs onglets
  window.addEventListener('storage', e => {
    if (e.key === CART_KEY) { cart = loadCart(); renderCart(); }
  });

  // Filtres produits
  document.querySelectorAll('.chip').forEach(chip =>
    chip.addEventListener('click', () => applyFilter(chip.dataset.filter)));
  document.querySelectorAll('.cat').forEach(cat =>
    cat.addEventListener('click', () => applyFilter(cat.dataset.filter)));

  // Menu mobile
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const closeMenu = () => {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  };
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 833) closeMenu(); });

  // Ombre du header au défilement
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Lien actif selon la section visible
  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  document.getElementById('year').textContent = new Date().getFullYear();
});
