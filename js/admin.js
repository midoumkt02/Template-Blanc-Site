/* ============================================================
   ADMIN.JS — Logique de l'interface admin (admin.html)
   Lit toute sa configuration depuis config.js (SITE_CONFIG).
   Ne pas modifier pour un nouveau client — modifier config.js.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const CFG = window.SITE_CONFIG;
const MAX_PHOTOS = 6;
const BADGE_CLASSES = { 'Nouveau': 'badge-nouveau', 'Soldes': 'badge-soldes', 'Exclusif': 'badge-exclusif' };
function badgeClass(badge) {
  return BADGE_CLASSES[badge] || '';
}

const app  = initializeApp(CFG.firebase);
const auth = getAuth(app);
const db   = getFirestore(app);

let selectedBadge = null;
let photoSlots = Array(MAX_PHOTOS).fill(null);
let unsubscribeProducts = null;
let editingProductId = null;
let currentProducts = [];
let adminSearchQuery = '';
let adminCategoryFilter = 'all';

// ── INJECT STATIC TEXT ──
function injectStaticContent() {
  document.title = CFG.shopName + " — Admin";
  document.querySelectorAll('[data-cfg-logo]').forEach(el => el.textContent = CFG.shopName);
  document.querySelectorAll('[data-cfg-logo-image]').forEach(el => {
    if (CFG.logoImage) { el.src = CFG.logoImage; el.style.display = 'block'; }
    else { el.style.display = 'none'; }
  });
  const categorySelect = document.getElementById('prodCategory');
  if (categorySelect) {
    categorySelect.innerHTML = CFG.categories.map(c => `<option value="${c.value}">${c.label}</option>`).join('');
  }
}

// ── AUTH STATE ──
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminScreen').style.display = 'block';
    document.getElementById('headerEmail').textContent = user.email;
    buildPhotoSlots();
    startListener();
  } else {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminScreen').style.display = 'none';
    if (unsubscribeProducts) { unsubscribeProducts(); unsubscribeProducts = null; }
  }
});

// ── LOGIN ──
window.login = async function() {
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  const btn = document.getElementById('loginBtn');
  const loading = document.getElementById('loginLoading');
  const error = document.getElementById('loginError');

  error.style.display = 'none';
  if (!email || !password) {
    error.textContent = 'Veuillez remplir l\'email et le mot de passe.';
    error.style.display = 'block';
    return;
  }

  btn.disabled = true;
  loading.style.display = 'block';

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    error.textContent = 'Email ou mot de passe incorrect.';
    error.style.display = 'block';
    document.getElementById('passwordInput').value = '';
  } finally {
    btn.disabled = false;
    loading.style.display = 'none';
  }
};

window.logout = async function() {
  await signOut(auth);
  document.getElementById('emailInput').value = '';
  document.getElementById('passwordInput').value = '';
};

// ── PHOTO SLOTS ──
function buildPhotoSlots() {
  const grid = document.getElementById('photosGrid');
  grid.innerHTML = '';
  for (let i = 0; i < MAX_PHOTOS; i++) {
    const slot = document.createElement('div');
    slot.className = 'photo-slot';
    slot.id = `slot-${i}`;
    slot.innerHTML = `
      <input type="file" accept="image/*" onchange="handleSlotPhoto(${i}, this)">
      <img id="slotImg-${i}" src="" alt="">
      <button class="remove-photo" onclick="removeSlotPhoto(${i}, event)">×</button>
      <span class="slot-text">📷</span>
      <span class="slot-label">${i === 0 ? 'Principale' : `Photo ${i+1}`}</span>
    `;
    grid.appendChild(slot);

    const existing = photoSlots[i];
    if (existing && existing.url) {
      const img = slot.querySelector('img');
      img.src = existing.url;
      img.style.display = 'block';
      slot.classList.add('has-image');
    }
  }
}

window.handleSlotPhoto = function(i, input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert('Photo trop lourde (max 5MB)'); return; }
  photoSlots[i] = { file };
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById(`slotImg-${i}`).src = e.target.result;
    document.getElementById(`slotImg-${i}`).style.display = 'block';
    document.getElementById(`slot-${i}`).classList.add('has-image');
  };
  reader.readAsDataURL(file);
};

window.removeSlotPhoto = function(i, e) {
  e.stopPropagation();
  photoSlots[i] = null;
  const img = document.getElementById(`slotImg-${i}`);
  img.src = ''; img.style.display = 'none';
  document.getElementById(`slot-${i}`).classList.remove('has-image');
  document.getElementById(`slot-${i}`).querySelector('input').value = '';
};

// ── CLOUDINARY UPLOAD ──
async function uploadFile(file, index, total) {
  const bar = document.getElementById('progressBar');
  const status = document.getElementById('uploadStatus');
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CFG.cloudinary.uploadPreset);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CFG.cloudinary.cloudName}/image/upload`);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        const pct = Math.round(((index + e.loaded/e.total) / total) * 100);
        bar.style.width = pct + '%';
        status.textContent = `Envoi photo ${index+1}/${total}... ${Math.round(e.loaded/e.total*100)}%`;
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) resolve(JSON.parse(xhr.responseText).secure_url);
      else reject(new Error('Échec upload'));
    };
    xhr.onerror = () => reject(new Error('Erreur réseau'));
    xhr.send(fd);
  });
}

// ── BADGE ──
window.selectBadge = function(btn, value) {
  document.querySelectorAll('.badge-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedBadge = value;
};

// ── RÉSOUT LES URLS DES PHOTOS (garde les existantes, upload les nouvelles) ──
async function resolvePhotoUrls() {
  const results = new Array(MAX_PHOTOS).fill(null);
  const toUpload = [];
  photoSlots.forEach((s, i) => {
    if (!s) return;
    if (s.url) results[i] = s.url;
    else if (s.file) toUpload.push({ file: s.file, index: i });
  });

  if (toUpload.length > 0) {
    document.getElementById('progressWrap').classList.add('show');
    document.getElementById('uploadStatus').classList.add('show');
    document.getElementById('progressBar').style.width = '0%';
    for (let i = 0; i < toUpload.length; i++) {
      const url = await uploadFile(toUpload[i].file, i, toUpload.length);
      results[toUpload[i].index] = url;
    }
    document.getElementById('progressWrap').classList.remove('show');
    document.getElementById('uploadStatus').classList.remove('show');
  }

  return results.filter(Boolean);
}

// ── RESET FORMULAIRE (mode ajout) ──
function resetForm() {
  ['prodName','prodDesc','prodPrice','prodOldPrice','prodSizes','prodColors'].forEach(id => document.getElementById(id).value = '');
  photoSlots = Array(MAX_PHOTOS).fill(null);
  buildPhotoSlots();
  document.querySelectorAll('.badge-opt').forEach(b => b.classList.remove('selected'));
  document.querySelector('.badge-opt').classList.add('selected');
  selectedBadge = null;
  editingProductId = null;
  document.getElementById('formTitle').textContent = 'Ajouter un produit';
  document.getElementById('addBtn').textContent = 'Ajouter le produit';
  document.getElementById('cancelBtn').style.display = 'none';
}

// ── AJOUTER / MODIFIER PRODUIT ──
window.addProduct = async function() {
  if (!auth.currentUser) { alert('Session expirée, reconnectez-vous.'); return; }

  const name     = document.getElementById('prodName').value.trim();
  const desc     = document.getElementById('prodDesc').value.trim();
  const price    = parseInt(document.getElementById('prodPrice').value);
  const oldPrice = parseInt(document.getElementById('prodOldPrice').value) || null;
  const category = document.getElementById('prodCategory').value;
  const sizesRaw = document.getElementById('prodSizes').value.trim();
  const colorsRaw= document.getElementById('prodColors').value.trim();
  if (!name || !desc || !price) { alert('Veuillez remplir le nom, la description et le prix.'); return; }

  const btn = document.getElementById('addBtn');
  const isEditing = !!editingProductId;
  btn.disabled = true; btn.textContent = 'Enregistrement...';

  try {
    const uploadedUrls = await resolvePhotoUrls();
    const sizes  = sizesRaw  ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean)  : ['Unique'];
    const colors = colorsRaw ? colorsRaw.split(',').map(c => c.trim()).filter(Boolean) : [];

    const productData = {
      name, desc, price, oldPrice, category,
      badge: selectedBadge, sizes, colors,
      image:  uploadedUrls[0] || null,
      images: uploadedUrls.slice(1)
    };

    if (isEditing) {
      await updateDoc(doc(db, "produits", editingProductId), { ...productData, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, "produits"), {
        ...productData,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.email
      });
    }

    resetForm();

    const banner = document.getElementById('successBanner');
    banner.textContent = isEditing ? '✓ Produit modifié' : '✓ Produit ajouté — visible sur le site instantanément !';
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 4000);

  } catch(err) {
    alert('Erreur : ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = editingProductId ? 'Enregistrer les modifications' : 'Ajouter le produit';
  }
};

// ── PASSER EN MODE ÉDITION ──
window.editProduct = function(id) {
  const p = currentProducts.find(x => x.id === id);
  if (!p) return;

  document.getElementById('prodName').value = p.name || '';
  document.getElementById('prodDesc').value = p.desc || '';
  document.getElementById('prodPrice').value = p.price || '';
  document.getElementById('prodOldPrice').value = p.oldPrice || '';
  document.getElementById('prodCategory').value = p.category || '';
  document.getElementById('prodSizes').value = (p.sizes || []).join(', ');
  document.getElementById('prodColors').value = (p.colors || []).join(', ');

  selectedBadge = p.badge || null;
  document.querySelectorAll('.badge-opt').forEach(b => b.classList.remove('selected'));
  const badgeBtn = [...document.querySelectorAll('.badge-opt')].find(b =>
    (selectedBadge === null && b.textContent === 'Aucun') || b.textContent === selectedBadge);
  (badgeBtn || document.querySelector('.badge-opt')).classList.add('selected');

  photoSlots = Array(MAX_PHOTOS).fill(null);
  const imgs = [p.image, ...(p.images || [])].filter(Boolean);
  imgs.forEach((url, i) => { if (i < MAX_PHOTOS) photoSlots[i] = { url }; });
  buildPhotoSlots();

  editingProductId = id;
  document.getElementById('formTitle').textContent = 'Modifier le produit';
  document.getElementById('addBtn').textContent = 'Enregistrer les modifications';
  document.getElementById('cancelBtn').style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ── ANNULER L'ÉDITION ──
window.cancelEdit = function() {
  resetForm();
};

// ── SUPPRIMER ──
window.deleteProduct = async function(id) {
  if (!confirm('Supprimer ce produit définitivement ?')) return;
  try { await deleteDoc(doc(db, "produits", id)); }
  catch(err) { alert('Erreur : ' + err.message); }
};

// ── FIRESTORE LISTENER ──
function startListener() {
  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  const q = query(collection(db, "produits"), orderBy("createdAt", "desc"));
  unsubscribeProducts = onSnapshot(q, snap => {
    dot.className = 'status-dot green'; txt.textContent = 'Connecté';
    currentProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    applyAdminFilters();
  }, () => { txt.textContent = 'Erreur'; });
}

// ── RECHERCHE + FILTRE CATÉGORIE (liste produits admin) ──
function renderAdminCategoryFilters() {
  const wrap = document.getElementById('adminCategoryFilters');
  if (!wrap) return;
  const cats = [{ value: 'all', label: 'Tous' }, ...CFG.categories];
  wrap.innerHTML = cats.map(c =>
    `<button class="filter-btn${adminCategoryFilter === c.value ? ' active' : ''}" data-category="${c.value}">${c.label}</button>`
  ).join('');
  wrap.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      adminCategoryFilter = btn.dataset.category;
      renderAdminCategoryFilters();
      applyAdminFilters();
    });
  });
}

window.onAdminSearchInput = function(input) {
  adminSearchQuery = input.value.trim().toLowerCase();
  applyAdminFilters();
};

function applyAdminFilters() {
  let products = currentProducts;
  if (adminCategoryFilter !== 'all') products = products.filter(p => p.category === adminCategoryFilter);
  if (adminSearchQuery) products = products.filter(p => p.name.toLowerCase().includes(adminSearchQuery));
  renderList(products);
}

function renderList(products) {
  const list  = document.getElementById('productList');
  const label = document.getElementById('productCountLabel');
  label.textContent = products.length + (products.length > 1 ? ' produits' : ' produit');
  if (products.length === 0) {
    list.innerHTML = `<div class="empty-state">Aucun produit — ajoutez-en un via le formulaire</div>`;
    return;
  }
  list.innerHTML = products.map(p => {
    const imgs = [p.image, ...(p.images||[])].filter(Boolean);
    const categoryLabel = CFG.categories.find(c => c.value === p.category)?.label || p.category;
    const thumbsHTML = imgs.length === 0
      ? `<div class="product-thumb-placeholder">Pas de photo</div>`
      : imgs.slice(0,3).map(url => `<div class="product-thumb"><img src="${url}" alt=""></div>`).join('') +
        (imgs.length > 3 ? `<div class="product-thumb-more">+${imgs.length-3}</div>` : '');
    return `
    <div class="product-item">
      <div class="product-thumbs-row">${thumbsHTML}</div>
      <div class="product-meta">
        <strong>${p.name}${p.badge?`<span class="product-badge-pill ${badgeClass(p.badge)}">${p.badge}</span>`:''}</strong>
        <div class="meta-price">${p.price.toLocaleString(CFG.currencyLocale)} ${CFG.currency}${p.oldPrice?` · <s>${p.oldPrice.toLocaleString(CFG.currencyLocale)} ${CFG.currency}</s>`:''} <span class="category-pill">${categoryLabel}</span></div>
        <div class="meta-details">${p.sizes.join(', ')}${p.colors&&p.colors.length?' · '+p.colors.join(', '):''} · ${imgs.length} photo${imgs.length>1?'s':''}</div>
      </div>
      <div class="product-actions">
        <button class="edit-btn" onclick="editProduct('${p.id}')">Modifier</button>
        <button class="delete-btn" onclick="deleteProduct('${p.id}')">Supprimer</button>
      </div>
    </div>`;
  }).join('');
}

// ── INIT ──
injectStaticContent();
renderAdminCategoryFilters();
