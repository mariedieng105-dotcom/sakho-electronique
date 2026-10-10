/* =========================================================
   SAKHO ÉLECTRONIC – produits en base (Supabase) + mode admin
   - Tous les visiteurs lisent les produits depuis Supabase et
     reçoivent les changements en temps réel.
   - L'admin se connecte avec un mot de passe vérifié par Supabase
     (jamais écrit dans le code) pour ajouter / modifier / supprimer.
   ========================================================= */
(function () {
  const cfg = window.SAKHO_CONFIG || {};
  const CONFIGURED = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const db = CONFIGURED ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const BUCKET = 'products';
  const MAX_SOURCE = 30 * 1024 * 1024;  // photo d'origine (téléphone) acceptée jusqu'à 30 Mo
  const MAX_SIDE = 1200;                 // la photo est réduite à 1200 px de côté maximum
  const JPEG_QUALITY = 0.85;

  let isAdmin = false;

  const $ = id => document.getElementById(id);

  /* ---------- Lecture des produits ---------- */
  function fromRow(r) {
    return {
      id: r.id, name: r.name, desc: r.description || '', price: r.price,
      img: r.image_url, cat: r.category, sort: r.sort_order,
    };
  }

  async function loadProducts() {
    if (!db) return;
    const { data, error } = await db.from('products')
      .select('id, name, description, price, category, image_url, sort_order')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Lecture des produits impossible :', error.message);
      return; // on garde la liste affichée
    }
    setProducts(data.map(fromRow), true);
  }

  // Plusieurs changements rapprochés → une seule relecture
  let reloadTimer;
  function scheduleReload() {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(loadProducts, 250);
  }

  function subscribeRealtime() {
    db.channel('produits')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, scheduleReload)
      .subscribe(status => {
        // À la (re)connexion, on relit pour ne rien rater pendant la coupure
        if (status === 'SUBSCRIBED') scheduleReload();
      });
    // Retour sur l'onglet après une veille : on se resynchronise
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') scheduleReload();
    });
  }

  /* ---------- Connexion admin ---------- */
  function setAdmin(on) {
    isAdmin = on;
    document.body.classList.toggle('is-admin', on);
    $('adminBar').hidden = !on;
  }

  function applySession(session) {
    const email = session && session.user && session.user.email;
    setAdmin(Boolean(email) && email.toLowerCase() === String(cfg.ADMIN_EMAIL).toLowerCase());
  }

  function openLogin() {
    if (isAdmin) return;
    const dlg = $('adminLogin');
    $('adminLoginError').textContent = CONFIGURED ? ''
      : cfg.SUPABASE_URL
        ? 'Connexion à la base impossible pour le moment. Vérifiez votre connexion Internet et rechargez la page.'
        : 'La base de données n’est pas encore configurée (voir supabase/INSTRUCTIONS.md).';
    $('adminPassword').value = '';
    $('adminLoginSubmit').disabled = !CONFIGURED;
    dlg.showModal();
    $('adminPassword').focus();
  }

  async function onLogin(e) {
    e.preventDefault();
    const btn = $('adminLoginSubmit');
    const err = $('adminLoginError');
    const password = $('adminPassword').value;
    if (!password) { err.textContent = 'Entrez le mot de passe.'; return; }
    btn.disabled = true;
    btn.textContent = 'Vérification…';
    err.textContent = '';
    const { data, error } = await db.auth.signInWithPassword({ email: cfg.ADMIN_EMAIL, password });
    btn.disabled = false;
    btn.textContent = 'Entrer';
    if (error) {
      err.textContent = /invalid/i.test(error.message)
        ? 'Mot de passe incorrect.'
        : 'Connexion impossible. Réessayez dans un instant.';
      $('adminPassword').select();
      return;
    }
    applySession(data.session);
    $('adminLogin').close();
    if (!isAdmin) alert('Ce compte n’a pas les droits d’administration.');
  }

  async function logout() {
    await db.auth.signOut();
    setAdmin(false);
  }

  /* ---------- Éditeur de produit ---------- */
  let editingId = null;
  let previewUrl = null;

  function openEditor(product) {
    editingId = product ? product.id : null;
    const f = $('productForm');
    f.reset();
    $('productFormTitle').textContent = product ? 'Modifier le produit' : 'Ajouter un produit';
    $('productFormError').textContent = '';
    f.elements.name.value = product ? product.name : '';
    f.elements.description.value = product ? product.desc : '';
    f.elements.price.value = product && product.price != null ? product.price : '';
    f.elements.category.value = product ? product.cat : 'smartphones';
    setPreview(product ? imgSrc(product) : '');
    $('productImage').required = !product;
    $('productEditor').showModal();
    f.elements.name.focus();
  }

  function setPreview(src) {
    const img = $('productPreview');
    img.hidden = !src;
    if (src) img.src = src;
  }

  function onImagePicked() {
    const file = $('productImage').files[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    if (!file) return;
    previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  }

  // Lit la photo (l'orientation du téléphone est respectée par le navigateur)
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }

  // Réduit la photo (souvent 3 à 8 Mo sur un téléphone) en JPEG léger
  async function compressImage(file) {
    let img;
    try {
      img = await loadImage(file);
    } catch (e) {
      throw new Error('Impossible de lire cette photo. Choisissez une photo au format JPG ou PNG.');
    }
    const w = img.naturalWidth, h = img.naturalHeight;
    const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';  // fond blanc pour les images transparentes
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob) throw new Error('Impossible de préparer cette photo. Essayez avec une autre.');
    return blob;
  }

  async function uploadImage(file) {
    const blob = await compressImage(file);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await db.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (error) throw new Error('Envoi de la photo impossible : ' + error.message);
    return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  // Supprime une photo de notre stockage (sans bloquer si ça échoue)
  async function removeStoredImage(url) {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const i = String(url || '').indexOf(marker);
    if (i === -1) return;
    const path = decodeURIComponent(url.slice(i + marker.length));
    const { error } = await db.storage.from(BUCKET).remove([path]);
    if (error) console.warn('Ancienne photo non supprimée :', error.message);
  }

  async function onSave(e) {
    e.preventDefault();
    const f = $('productForm');
    const err = $('productFormError');
    const btn = $('productSave');
    const name = f.elements.name.value.trim();
    const description = f.elements.description.value.trim();
    const priceRaw = f.elements.price.value.trim().replace(/\s/g, '');
    const category = f.elements.category.value;
    const file = $('productImage').files[0];

    if (!name) { err.textContent = 'Le nom est obligatoire.'; f.elements.name.focus(); return; }
    if (priceRaw && !/^\d{1,9}$/.test(priceRaw)) { err.textContent = 'Le prix doit être un nombre entier en FCFA (ex. 250000), ou vide.'; return; }
    if (!editingId && !file) { err.textContent = 'Choisissez une photo du produit.'; return; }
    if (file && file.type && !file.type.startsWith('image/')) { err.textContent = 'Le fichier choisi n’est pas une photo.'; return; }
    if (file && file.size > MAX_SOURCE) { err.textContent = 'Photo trop lourde (30 Mo maximum).'; return; }

    btn.disabled = true;
    btn.textContent = 'Enregistrement…';
    err.textContent = '';
    try {
      const old = editingId ? PRODUCT_BY_ID[editingId] : null;
      const row = {
        name, description, category,
        price: priceRaw ? parseInt(priceRaw, 10) : null,
        updated_at: new Date().toISOString(),
      };
      if (file) row.image_url = await uploadImage(file);

      let res;
      if (editingId) {
        res = await db.from('products').update(row).eq('id', editingId).select('id');
      } else {
        const maxSort = PRODUCTS.reduce((m, p) => Math.max(m, p.sort || 0), 0);
        row.sort_order = maxSort + 1;
        res = await db.from('products').insert(row).select('id');
      }
      if (res.error) throw new Error(res.error.message);
      if (!res.data || !res.data.length) throw new Error('Action refusée : votre session a peut-être expiré. Reconnectez-vous.');
      if (file && old) removeStoredImage(old.img);

      $('productEditor').close();
      await loadProducts();
      toast(editingId ? 'Produit modifié ✓' : 'Produit ajouté ✓');
    } catch (ex) {
      err.textContent = ex.message || 'Enregistrement impossible.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enregistrer';
    }
  }

  async function deleteProduct(id) {
    const p = PRODUCT_BY_ID[id];
    if (!p || !confirm(`Supprimer « ${p.name} » ? Cette action est définitive.`)) return;
    const { data, error } = await db.from('products').delete().eq('id', id).select('id');
    if (error || !data || !data.length) {
      alert('Suppression impossible' + (error ? ' : ' + error.message : ' : reconnectez-vous.'));
      return;
    }
    removeStoredImage(p.img);
    await loadProducts();
    toast('Produit supprimé');
  }

  /* ---------- Petit message de confirmation ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $('adminToast');
    el.textContent = msg;
    el.hidden = false;
    el.classList.remove('is-shown');
    void el.offsetWidth;
    el.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* ---------- Branchements ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    $('adminKey').addEventListener('click', openLogin);
    $('adminLoginForm').addEventListener('submit', onLogin);
    $('adminLoginCancel').addEventListener('click', () => $('adminLogin').close());
    if (location.hash === '#admin') openLogin();
    window.addEventListener('hashchange', () => { if (location.hash === '#admin') openLogin(); });

    if (!db) {
      if (cfg.SUPABASE_URL && !window.supabase) console.error('Librairie Supabase non chargée.');
      return; // produits par défaut, pas de mode admin
    }

    $('adminLogout').addEventListener('click', logout);
    $('adminAdd').addEventListener('click', () => openEditor(null));
    $('productForm').addEventListener('submit', onSave);
    $('productForm').addEventListener('input', () => { $('productFormError').textContent = ''; });
    $('productCancel').addEventListener('click', () => $('productEditor').close());
    $('productImage').addEventListener('change', onImagePicked);

    // Boutons Modifier / Supprimer sur les cartes (visibles en mode admin)
    $('products').addEventListener('click', e => {
      const btn = e.target.closest('[data-admin]');
      if (!btn || !isAdmin) return;
      const id = btn.closest('.product').dataset.id;
      if (btn.dataset.admin === 'edit') openEditor(PRODUCT_BY_ID[id]);
      if (btn.dataset.admin === 'delete') deleteProduct(id);
    });

    // Ne pas appeler d'autres méthodes Supabase dans ce rappel (recommandation Supabase)
    db.auth.onAuthStateChange((event, session) => applySession(session));
    loadProducts();
    subscribeRealtime();
  });
})();
