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
  getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const CFG = window.SITE_CONFIG;
const MAX_PHOTOS = 6;

const app  = initializeApp(CFG.firebase);
const auth = getAuth(app);
const db   = getFirestore(app);

let selectedBadge = null;
let photoSlots = Array(MAX_PHOTOS).fill(null);
let unsubscribeProducts = null;

// ── INJECT STATIC TEXT ──
function injectStaticContent() {
  document.title = CFG.shopName + " — Admin";
  document.querySelectorAll('[data-cfg-logo]').forEach(el => el.textContent = CFG.shopName);
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

// ── AJOUTER PRODUIT ──
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

  const filesToUpload = photoSlots.map((s, i) => s ? { file: s.file, index: i } : null).filter(Boolean);

  const btn = document.getElementById('addBtn');
  btn.disabled = true; btn.textContent = 'Enregistrement...';

  try {
    let uploadedUrls = [];
    if (filesToUpload.length > 0) {
      document.getElementById('progressWrap').classList.add('show');
      document.getElementById('uploadStatus').classList.add('show');
      document.getElementById('progressBar').style.width = '0%';
      for (let i = 0; i < filesToUpload.length; i++) {
        const url = await uploadFile(filesToUpload[i].file, i, filesToUpload.length);
        uploadedUrls.push(url);
      }
      document.getElementById('progressWrap').classList.remove('show');
      document.getElementById('uploadStatus').classList.remove('show');
    }

    const sizes  = sizesRaw  ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean)  : ['Unique'];
    const colors = colorsRaw ? colorsRaw.split(',').map(c => c.trim()).filter(Boolean) : [];

    await addDoc(collection(db, "produits"), {
      name, desc, price, oldPrice, category,
      badge: selectedBadge, sizes, colors,
      image:  uploadedUrls[0] || null,
      images: uploadedUrls.slice(1),
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.email
    });

    ['prodName','prodDesc','prodPrice','prodOldPrice','prodSizes','prodColors'].forEach(id => document.getElementById(id).value = '');
    photoSlots = Array(MAX_PHOTOS).fill(null);
    buildPhotoSlots();
    document.querySelectorAll('.badge-opt').forEach(b => b.classList.remove('selected'));
    document.querySelector('.badge-opt').classList.add('selected');
    selectedBadge = null;

    const banner = document.getElementById('successBanner');
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 4000);

  } catch(err) {
    alert('Erreur : ' + err.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Ajouter le produit';
  }
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
    renderList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, () => { txt.textContent = 'Erreur'; });
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
        <strong>${p.name}${p.badge?`<span class="product-badge-pill">${p.badge}</span>`:''}</strong>
        <div class="meta-price">${p.price.toLocaleString(CFG.currencyLocale)} ${CFG.currency}${p.oldPrice?` · <s>${p.oldPrice.toLocaleString(CFG.currencyLocale)} ${CFG.currency}</s>`:''} · ${categoryLabel}</div>
        <div class="meta-details">${p.sizes.join(', ')}${p.colors&&p.colors.length?' · '+p.colors.join(', '):''} · ${imgs.length} photo${imgs.length>1?'s':''}</div>
      </div>
      <button class="delete-btn" onclick="deleteProduct('${p.id}')">Supprimer</button>
    </div>`;
  }).join('');
}

// ── INIT ──
injectStaticContent();
