/* ============================================================
   SITE.JS — Logique du site boutique (index.html)
   Lit toute sa configuration depuis config.js (SITE_CONFIG).
   Ne pas modifier pour un nouveau client — modifier config.js.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const CFG = window.SITE_CONFIG;

const app = initializeApp(CFG.firebase);
const db = getFirestore(app);

let allProducts = [];
let quantities = {};
let selectedSizes = {};
let activeCategory = 'all';

function formatPrice(p) {
  return p.toLocaleString(CFG.currencyLocale) + ' ' + CFG.currency;
}

function getImages(p) {
  const imgs = [];
  if (p.image) imgs.push(p.image);
  if (p.images && Array.isArray(p.images)) imgs.push(...p.images);
  return imgs;
}

// ── INJECT TEXTS FROM CONFIG ──
function injectStaticContent() {
  document.title = CFG.shopName + " — Boutique";
  document.querySelectorAll('[data-cfg-logo]').forEach(el => el.textContent = CFG.shopName);
  document.querySelectorAll('[data-cfg-logo-image]').forEach(el => {
    if (CFG.logoImage) { el.src = CFG.logoImage; el.style.display = 'block'; }
    else { el.style.display = 'none'; }
  });
  document.querySelectorAll('[data-cfg-tagline]').forEach(el => el.innerHTML = CFG.shopTagline);
  document.querySelectorAll('[data-cfg-description]').forEach(el => el.textContent = CFG.shopDescription);
  document.querySelectorAll('[data-cfg-hero-image]').forEach(el => el.src = CFG.heroImage);
  document.querySelectorAll('[data-cfg-footer-name]').forEach(el => el.textContent = CFG.shopName);
  document.querySelectorAll('[data-cfg-footer-desc]').forEach(el => el.textContent = CFG.shopFooterText);
  document.querySelectorAll('[data-cfg-contact-email]').forEach(el => el.textContent = CFG.contactEmail);
  document.querySelectorAll('[data-cfg-contact-hours]').forEach(el => el.textContent = CFG.contactHours);
  document.querySelectorAll('[data-cfg-footer-note]').forEach(el => el.textContent = CFG.footerNote);
  document.querySelectorAll('[data-cfg-year]').forEach(el => el.textContent = new Date().getFullYear());

  const linksWrap = document.querySelector('[data-cfg-footer-links]');
  if (linksWrap) {
    linksWrap.innerHTML = CFG.footerLinks.map(l => `<a href="${l.url}">${l.label}</a>`).join('');
  }
}

// ── FILTRE PAR CATÉGORIE ──
function renderCategoryFilters() {
  const wrap = document.getElementById('categoryFilters');
  if (!wrap) return;
  const cats = [{ value: 'all', label: 'Tous' }, ...CFG.categories];
  wrap.innerHTML = cats.map(c =>
    `<button class="filter-btn${activeCategory === c.value ? ' active' : ''}" data-category="${c.value}">${c.label}</button>`
  ).join('');
  wrap.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      renderCategoryFilters();
      renderGrid();
    });
  });
}

// ── ANALYTICS (Meta Pixel / Google Analytics) ──
function injectAnalytics() {
  const a = CFG.analytics;
  if (!a) return;

  if (a.googleAnalyticsId) {
    const loader = document.createElement('script');
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${a.googleAnalyticsId}`;
    document.head.appendChild(loader);

    const init = document.createElement('script');
    init.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${a.googleAnalyticsId}');
    `;
    document.head.appendChild(init);
  }

  if (a.metaPixelId) {
    const pixel = document.createElement('script');
    pixel.textContent = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${a.metaPixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(pixel);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${a.metaPixelId}&ev=PageView&noscript=1" alt="">`;
    document.body.appendChild(noscript);
  }
}

function trackOrderConversion(value) {
  const a = CFG.analytics;
  if (!a) return;
  if (a.metaPixelId && window.fbq) {
    window.fbq('track', 'Lead', { value, currency: CFG.currency });
  }
  if (a.googleAnalyticsId && window.gtag) {
    window.gtag('event', 'generate_lead', { value, currency: CFG.currency });
  }
}

// ── ÉCOUTE TEMPS RÉEL FIREBASE ──
function startListening() {
  const q = query(collection(db, "produits"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    allProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderGrid();
  });
}

function renderGrid() {
  const grid = document.getElementById('productGrid');
  const detail = document.getElementById('productDetail');
  detail.classList.remove('open');
  detail.innerHTML = '';

  const products = activeCategory === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === activeCategory);

  document.getElementById('productCount').textContent =
    products.length + ' pièce' + (products.length !== 1 ? 's' : '');

  if (products.length === 0) {
    grid.innerHTML = `<div class="empty-catalogue"><h3>Aucun produit</h3><p>Revenez bientôt !</p></div>`;
    return;
  }

  grid.innerHTML = products.map(p => {
    const imgs = getImages(p);
    const thumb = imgs[0] || null;
    return `
    <div class="product-card" id="card-${p.id}" onclick="openDetail('${p.id}')">
      <div class="product-img">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        ${thumb ? `<img src="${thumb}" alt="${p.name}">` : `<span>${p.name.split(' ').slice(0,2).join(' ')}</span>`}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-price">
          ${p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}</span>` : ''}
          ${formatPrice(p.price)}
        </div>
      </div>
    </div>`;
  }).join('');
}

window.openDetail = function(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  const detail = document.getElementById('productDetail');
  document.querySelectorAll('.product-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById('card-' + id);
  if (card) card.classList.add('active');
  if (!quantities[id]) quantities[id] = 1;
  if (!selectedSizes[id]) selectedSizes[id] = '';

  const imgs = getImages(p);
  const sizeBtns = p.sizes.map(s =>
    `<button class="size-btn${selectedSizes[id]===s?' selected':''}" onclick="selectSize('${id}','${s}')">${s}</button>`
  ).join('');

  let galleryHTML = '';
  if (imgs.length === 0) {
    galleryHTML = `<div class="gallery-wrap"><div class="gallery-main"><div class="gallery-placeholder">${p.name}</div></div></div>`;
  } else if (imgs.length === 1) {
    galleryHTML = `<div class="gallery-wrap"><div class="gallery-main"><img id="mainImg-${id}" src="${imgs[0]}" alt="${p.name}"></div></div>`;
  } else {
    const thumbs = imgs.map((img, i) => `
      <div class="gallery-thumb${i===0?' active':''}" onclick="switchImg('${id}', '${img}', this)">
        <img src="${img}" alt="Photo ${i+1}">
      </div>`).join('');
    galleryHTML = `
      <div class="gallery-wrap">
        <div class="gallery-main"><img id="mainImg-${id}" src="${imgs[0]}" alt="${p.name}"></div>
        <div class="gallery-thumbs">${thumbs}</div>
      </div>`;
  }

  const F = CFG.orderForm;

  detail.innerHTML = `
    ${galleryHTML}
    <div class="detail-content">
      <h3>${p.name}</h3>
      <p class="detail-desc">${p.desc}</p>
      <div class="price-block">
        ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
        <span class="price-main">${formatPrice(p.price)}</span>
      </div>
      <div class="order-form">
        <h4>${F.title}</h4>
        <div class="form-group" style="margin-bottom:16px">
          <label>${F.sizeLabel}</label>
          <div class="size-options" id="sizes-${id}">${sizeBtns}</div>
        </div>
        ${p.colors && p.colors.length ? `
        <div class="form-group" style="margin-bottom:16px">
          <label>${F.colorLabel}</label>
          <select id="color-${id}" style="max-width:200px">
            ${p.colors.map(c => `<option>${c}</option>`).join('')}
          </select>
        </div>` : ''}
        <div class="form-group" style="margin-bottom:20px">
          <label>${F.qtyLabel}</label>
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty('${id}',-1)">−</button>
            <div class="qty-display" id="qty-${id}">${quantities[id]}</div>
            <button class="qty-btn" onclick="changeQty('${id}',1)">+</button>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group"><label>${F.firstNameLabel}</label><input type="text" id="fname-${id}" placeholder="${F.firstNameLabel.replace(' *','')}"></div>
          <div class="form-group"><label>${F.lastNameLabel}</label><input type="text" id="lname-${id}" placeholder="${F.lastNameLabel}"></div>
          <div class="form-group full"><label>${F.phoneLabel}</label><input type="tel" id="phone-${id}" placeholder="0555 000 000"></div>
          <div class="form-group full"><label>${F.addressLabel}</label><input type="text" id="address-${id}" placeholder="Rue, numéro, quartier"></div>
          <div class="form-group">
            <label>${CFG.deliveryZoneLabel} *</label>
            <select id="wilaya-${id}">
              <option value="">-- Sélectionner --</option>
              ${CFG.deliveryZones.map(z => `<option>${z}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>${F.notesLabel}</label><textarea id="notes-${id}" placeholder="Instructions de livraison…"></textarea></div>
        </div>
        <button class="submit-btn" id="submitBtn-${id}" onclick="submitOrder('${id}')">${F.submitPrefix}${formatPrice(p.price)}${F.submitSuffix}</button>
        <div class="success-msg" id="success-${id}">
          <h5>${F.successTitle}</h5>
          <p>${F.successText}</p>
        </div>
      </div>
    </div>
  `;
  detail.classList.add('open');
  detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

window.switchImg = function(id, url, thumb) {
  const main = document.getElementById('mainImg-' + id);
  if (main) {
    main.style.opacity = '0';
    setTimeout(() => { main.src = url; main.style.opacity = '1'; }, 200);
  }
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
};

window.selectSize = function(id, size) {
  selectedSizes[id] = size;
  document.querySelectorAll(`#sizes-${id} .size-btn`).forEach(b =>
    b.classList.toggle('selected', b.textContent === size));
};

window.changeQty = function(id, delta) {
  quantities[id] = Math.max(1, (quantities[id] || 1) + delta);
  const el = document.getElementById('qty-' + id);
  if (el) el.textContent = quantities[id];
};

window.submitOrder = async function(id) {
  const p = allProducts.find(x => x.id === id);
  const fname   = document.getElementById('fname-'+id).value.trim();
  const lname   = document.getElementById('lname-'+id)?.value.trim() || '';
  const phone   = document.getElementById('phone-'+id).value.trim();
  const address = document.getElementById('address-'+id).value.trim();
  const wilaya  = document.getElementById('wilaya-'+id).value;

  if (!fname || !phone || !address || !wilaya) {
    alert('Merci de remplir tous les champs obligatoires.');
    return;
  }
  if (!selectedSizes[id] && p.sizes.length > 1) {
    alert('Veuillez choisir une taille.');
    return;
  }

  const btn = document.getElementById('submitBtn-' + id);
  btn.textContent = 'Envoi en cours…';
  btn.disabled = true;

  const data = {
    produit: p.name, prenom: fname, nom: lname, telephone: phone,
    adresse: address, wilaya, taille: selectedSizes[id] || p.sizes[0],
    couleur: document.getElementById('color-'+id)?.value || '',
    quantite: quantities[id] || 1,
    notes: document.getElementById('notes-'+id)?.value || ''
  };

  try {
    await fetch(CFG.ordersScriptUrl, { method: 'POST', body: JSON.stringify(data) });
    document.getElementById('success-' + id).classList.add('show');
    btn.textContent = 'Commande envoyée ✓';
    trackOrderConversion(p.price * data.quantite);
  } catch(err) {
    btn.textContent = 'Réessayer';
    btn.disabled = false;
    alert('Erreur de connexion. Vérifiez votre connexion internet.');
  }
};

// ── INIT ──
injectStaticContent();
injectAnalytics();
renderCategoryFilters();
startListening();
