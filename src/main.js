// ===== MAIN APP =====
import { inject } from '@vercel/analytics';
import { router, navigateTo } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderToastContainer, showToast } from './components/toast.js';
import { tools } from './tools-data.js';

// Initialize Vercel Analytics
inject();

const app = document.getElementById('app');

/* ── Theme Management ── */
// ALWAYS start light unless user has explicitly toggled dark in this session
function getInitialTheme() {
  const saved = localStorage.getItem('wherearemytools-theme');
  // Only honour 'dark' if the user explicitly set it via the toggle button
  if (saved === 'dark') return 'dark';
  // Clear any stale 'light' entry so we start clean
  localStorage.removeItem('wherearemytools-theme');
  return 'light';
}

function applyTheme(theme, persist = false) {
  document.documentElement.setAttribute('data-theme', theme);
  if (persist) localStorage.setItem('wherearemytools-theme', theme);
}

// Apply default theme (light) — does NOT write to localStorage
applyTheme(getInitialTheme());


function render() {
  const page = router();
  app.innerHTML = renderNavbar() + page + renderFooter() + renderToastContainer();
  bindNavbar();
  window.dispatchEvent(new Event('page-rendered'));
}

/* ── Lightbox Modal Helper ── */
window.openLightbox = function(target) {
  let src = '';
  if (typeof target === 'string') {
    src = target;
  } else if (target instanceof HTMLCanvasElement) {
    src = target.toDataURL();
  } else if (target instanceof HTMLImageElement) {
    src = target.src;
  } else if (target && target.querySelector) {
    const img = target.querySelector('img, canvas');
    if (img) src = img.tagName === 'CANVAS' ? img.toDataURL() : img.src;
  }
  if (!src) return;

  let modal = document.getElementById('globalLightboxModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'globalLightboxModal';
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" type="button" aria-label="Close lightbox">&times;</button>
        <img class="lightbox-img" id="lightboxImg" alt="Enlarged Preview" />
        <div class="lightbox-caption">🔍 Full Resolution View — Click outside to close</div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('lightbox-close')) {
        modal.classList.remove('open');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.classList.remove('open');
    });
  }

  const lightboxImg = modal.querySelector('#lightboxImg');
  if (lightboxImg) lightboxImg.src = src;
  modal.classList.add('open');
};

// Global click delegate for image previews
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('#previewImg, #origPreviewImg, .preview-area img, .preview-thumbnail-wrapper, .btn-enlarge-preview, .comparison-img-wrapper img');
  if (trigger) {
    const img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img, canvas');
    const src = img ? (img.tagName === 'CANVAS' ? img.toDataURL() : img.src) : null;
    if (src && (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http'))) {
      e.preventDefault();
      window.openLightbox(src);
    }
  }
});

/* ── Search helpers ── */
const catMeta = { image:'#d6c0a2', pdf:'#c4ae8d', audio:'#9D4EDD', social:'#b09c7a', text:'#8c7d62' };
const catLabel = { image:'Image', pdf:'PDF', audio:'Audio', social:'Social', text:'Text' };

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
}

function renderSearchResults(query) {
  const results = document.getElementById('searchResults');
  if (!results) return;
  const q = query.trim().toLowerCase();

  if (!q) {
    results.innerHTML = `
      <div class="search-placeholder">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <p>Type to search ${tools.length} tools…</p>
      </div>`;
    return;
  }

  const matched = tools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.desc.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q)
  );

  if (!matched.length) {
    results.innerHTML = `
      <div class="search-placeholder search-empty">
        <span class="empty-icon">🔍</span>
        <p>No tools found for "<strong>${q}</strong>"</p>
        <span class="empty-hint">Try "pdf", "image", or "compress"</span>
      </div>`;
    return;
  }

  results.innerHTML = matched.map((t, i) => {
    const catClr = catMeta[t.category] || '#888';
    const catLbl = catLabel[t.category] || t.category;
    return `
      <a class="search-result ${i === 0 ? 'active' : ''}" href="#/tool/${t.id}" data-idx="${i}">
        <span class="sr-icon">${t.icon}</span>
        <div class="sr-text">
          <span class="sr-name">${highlightMatch(t.name, q)}</span>
          <span class="sr-desc">${highlightMatch(t.desc, q)}</span>
        </div>
        <span class="sr-cat" style="--cat-clr:${catClr}">${catLbl}</span>
      </a>`;
  }).join('');
}

function openSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('globalSearch');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => input && input.focus(), 60);
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('globalSearch');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (input) input.value = '';
  renderSearchResults('');
}

/* ── Bind everything ── */
function bindNavbar() {
  // Logo
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', (e) => { e.preventDefault(); navigateTo('/'); });

  // Nav links
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(el.getAttribute('data-nav')); });
  });

  // ── Theme Toggle ──
  document.querySelectorAll('#themeToggleBtn, .theme-toggle-btn, .top-theme-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      // Persist ONLY when the user explicitly clicks the toggle
      applyTheme(next, true);
      showToast(`Switched to ${next === 'dark' ? 'Dark 🌙' : 'Light ☀️'} Mode`, 'info');
    });
  });

  // ── Search ──
  const searchBtn = document.getElementById('navSearchBtn');
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('globalSearch');
  const closeBtn = document.getElementById('searchCloseBtn');

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  // Click backdrop to close
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });

  // Live results
  if (input) {
    input.addEventListener('input', () => renderSearchResults(input.value));

    // Keyboard navigation inside results
    input.addEventListener('keydown', (e) => {
      const items = document.querySelectorAll('.search-result');
      if (!items.length) return;
      let cur = [...items].findIndex(i => i.classList.contains('active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[cur]?.classList.remove('active');
        cur = (cur + 1) % items.length;
        items[cur].classList.add('active');
        items[cur].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[cur]?.classList.remove('active');
        cur = (cur - 1 + items.length) % items.length;
        items[cur].classList.add('active');
        items[cur].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const active = items[cur];
        if (active) {
          closeSearch();
          navigateTo('/tool/' + active.href.split('/tool/')[1]);
        }
      }
    });
  }

  // Ctrl+K / Cmd+K global shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const isOpen = overlay?.classList.contains('open');
      isOpen ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape' && overlay?.classList.contains('open')) {
      closeSearch();
    }
  });

  // Click a result → navigate
  document.getElementById('searchResults')?.addEventListener('click', (e) => {
    const link = e.target.closest('.search-result');
    if (link) {
      e.preventDefault();
      closeSearch();
      navigateTo('/tool/' + link.href.split('/tool/')[1]);
    }
  });

  // Hover on result → make active
  document.getElementById('searchResults')?.addEventListener('mousemove', (e) => {
    const link = e.target.closest('.search-result');
    if (link) {
      document.querySelectorAll('.search-result').forEach(r => r.classList.remove('active'));
      link.classList.add('active');
    }
  });

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

window.addEventListener('hashchange', render);
window.addEventListener('load', () => {
  render();
  setupGlobalDragAndDrop();
});

/* ── Global Drag and Drop Integration ── */
function setupGlobalDragAndDrop() {
  let dragCounter = 0;

  function showGlobalDragOverlay() {
    let overlay = document.getElementById('global-drag-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-drag-overlay';
      overlay.className = 'global-drag-overlay';
      overlay.innerHTML = `
        <div class="global-drag-content">
          <div class="global-drag-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
          <h2>DROP IT LIKE IT'S HOT!</h2>
          <p>Drop your Image or Document here to start processing instantly!</p>
          <div class="global-drag-formats">
            <span class="format-badge badge-image"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Images (JPG, PNG, WEBP)</span>
            <span class="format-badge badge-pdf"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> PDF Documents</span>
            <span class="format-badge badge-word"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Word Docs (DOCX)</span>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
  }

  function hideGlobalDragOverlay() {
    const overlay = document.getElementById('global-drag-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
      dragCounter++;
      showGlobalDragOverlay();
    }
  });

  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    // Only decrement if we're leaving the window/overlay
    dragCounter--;
    if (dragCounter <= 0) {
      hideGlobalDragOverlay();
      dragCounter = 0;
    }
  });

  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    hideGlobalDragOverlay();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleDroppedFiles(e.dataTransfer.files);
    }
  });
}

function handleDroppedFiles(files) {
  // 1. Check if there is an active local dropzone input on the current page
  const localInput = document.querySelector('.dropzone input[type="file"], .drop-zone input[type="file"]');
  if (localInput) {
    // Populate the local file input and dispatch change event
    const dt = new DataTransfer();
    Array.from(files).forEach(f => dt.items.add(f));
    localInput.files = dt.files;
    localInput.dispatchEvent(new Event('change'));
    showToast('File loaded into active tool!', 'success');
    return;
  }

  // 2. If no local dropzone is active (e.g., user is on homepage/dashboard), perform global redirect based on the first file
  const file = files[0];
  const name = file.name.toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp'].some(ext => name.endsWith(ext))) {
    window.pendingDroppedFile = file;
    navigateTo('/tool/compress-image');
  } else if (name.endsWith('.pdf')) {
    window.pendingDroppedFile = file;
    navigateTo('/tool/compress-pdf');
  } else if (name.endsWith('.docx')) {
    window.pendingDroppedFile = file;
    navigateTo('/tool/word-to-pdf');
  } else if (['.mp4', '.mov', '.webm', '.mkv', '.m4v'].some(ext => name.endsWith(ext))) {
    window.pendingDroppedFile = file;
    navigateTo('/tool/mp4-to-mp3');
  } else if (['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'].some(ext => name.endsWith(ext))) {
    window.pendingDroppedFile = file;
    navigateTo('/tool/mp3-to-text');
  } else {
    // Show toast for unsupported file types
    showToast('Unsupported format for instant drop. Drop a JPG, PNG, WEBP, PDF, DOCX, MP4, or MP3!', 'warning');
  }
}

// ===== GLOBAL PAGE TRANSITION CLICK INTERCEPTOR =====
document.addEventListener('click', (e) => {
  const card = e.target.closest('.tool-card');
  const navLink = e.target.closest('[data-nav]');
  
  const target = card || navLink;
  if (!target) return;

  const href = target.getAttribute('href') || (target.tagName === 'A' ? target.href : '');
  const dataNav = target.getAttribute('data-nav');
  const path = dataNav || (href && href.startsWith('#') ? href.slice(1) : href);

  if (!path) return;

  // We want to trigger transitions if navigating to tools, home page, or filters
  const isTool = path.includes('/tool/');
  const isHome = path === '/' || path === '' || ['/image', '/pdf', '/social', '/text'].includes(path);

  if (card || isTool || isHome) {
    e.preventDefault();
    e.stopPropagation();

    // 1. Tactile click feedback
    if (card) {
      card.classList.add('clicked-anim');
    }

    // 2. Play exit transition on app contents
    app.classList.add('page-exit-active');

    // 3. Complete navigation after delay
    setTimeout(() => {
      app.classList.remove('page-exit-active');
      if (card) {
        card.classList.remove('clicked-anim');
      }
      navigateTo(path);
    }, 250);
  }
}, { capture: true });


