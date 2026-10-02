/* =========================================================
   SAKHO ÉLECTRONIC – script du site vitrine
   Pour modifier les produits : éditez simplement la liste
   PRODUCTS ci-dessous (nom, description, prix, image, catégorie).
   Laissez price à null pour afficher « Prix sur demande ».
   ========================================================= */

const WHATSAPP_NUMBER = '221779329678';

const PRODUCTS = [
  { name: 'iPhone', desc: 'Les derniers modèles Apple, neufs et garantis.', price: null, img: 'p-iphone.jpg', cat: 'smartphones' },
  { name: 'Samsung Galaxy', desc: 'Gamme Galaxy S, A et Z pour tous les budgets.', price: null, img: 'p-samsung.jpg', cat: 'smartphones' },
  { name: 'Xiaomi', desc: 'Redmi et Xiaomi : performance au meilleur prix.', price: null, img: 'p-xiaomi.jpg', cat: 'smartphones' },
  { name: 'Infinix', desc: 'Grands écrans et grosse autonomie.', price: null, img: 'cat-smartphones.jpg', cat: 'smartphones' },
  { name: 'Tecno', desc: 'Smartphones fiables, photo et batterie au top.', price: null, img: 'p-samsung.jpg', cat: 'smartphones' },
  { name: 'Ordinateurs portables', desc: 'HP, Lenovo, Asus, MacBook… pour le travail et les études.', price: null, img: 'p-laptop.jpg', cat: 'ordinateurs' },
  { name: 'AirPods', desc: 'Écouteurs sans fil Apple avec boîtier de charge.', price: null, img: 'p-airpods.jpg', cat: 'audio' },
  { name: 'Écouteurs Bluetooth', desc: 'Casques et écouteurs sans fil, son de qualité.', price: null, img: 'cat-audio.jpg', cat: 'audio' },
  { name: 'Montres connectées', desc: 'Suivi santé, sport et notifications au poignet.', price: null, img: 'p-montre.jpg', cat: 'montres' },
  { name: 'Chargeurs', desc: 'Chargeurs rapides USB-C et adaptateurs secteur.', price: null, img: 'p-chargeur.jpg', cat: 'chargeurs' },
  { name: 'Coques', desc: 'Coques de protection pour tous les modèles.', price: null, img: 'p-coque.jpg', cat: 'accessoires' },
  { name: 'Câbles USB', desc: 'Câbles USB-C, Lightning et micro-USB résistants.', price: null, img: 'cat-cables.jpg', cat: 'chargeurs' },
];

function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatPrice(price) {
  if (price == null) return '<span class="product__price product__price--ask">Prix sur demande</span>';
  return `<span class="product__price">${Number(price).toLocaleString('fr-FR')} FCFA</span>`;
}

function renderProducts() {
  const grid = document.getElementById('products');
  grid.innerHTML = PRODUCTS.map(p => {
    const msg = `Bonjour Sakho Électronic, je suis intéressé(e) par ${p.name}. Pouvez-vous me donner plus d'informations ?`;
    return `
      <article class="product" data-cat="${p.cat}">
        <div class="product__img"><img src="assets/img/${p.img}" alt="${escapeHtml(p.name)}" loading="lazy"></div>
        <div class="product__body">
          <h3 class="product__name">${escapeHtml(p.name)}</h3>
          <p class="product__desc">${escapeHtml(p.desc)}</p>
          ${formatPrice(p.price)}
          <a class="btn btn--primary btn--block" href="${waLink(msg)}" target="_blank" rel="noopener">
            <svg class="ico" viewBox="0 0 24 24"><use href="#i-wa"/></svg> Commander
          </a>
        </div>
      </article>`;
  }).join('');
}

function applyFilter(filter) {
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c.dataset.filter === filter));
  document.querySelectorAll('.product').forEach(p => {
    p.hidden = !(filter === 'all' || p.dataset.cat === filter);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();

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
  window.addEventListener('resize', () => { if (window.innerWidth > 960) closeMenu(); });

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
