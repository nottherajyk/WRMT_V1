import { tools } from '../tools-data.js';

export function renderNavbar() {
  const route = window.location.hash.slice(1) || '/';
  const isHome = route === '/' || route === '';
  const currentTool = route.startsWith('/tool/') ? tools.find(t => t.id === route.replace('/tool/', '')) : null;
  const currentCat = currentTool ? currentTool.category : null;
  const isImage = route === '/image' || currentCat === 'image';
  const isPdf = route === '/pdf' || currentCat === 'pdf';
  const isAudio = route === '/audio' || currentCat === 'audio';
  const isSocial = route === '/social' || currentCat === 'social';
  const isText = route === '/text' || currentCat === 'text';

  return `
  <header class="header-navbar">
    <div class="header-container">
      <a class="logo" href="#">
        <div class="logo-icon">★</div>
        <div class="logo-text">wherearemytools</div>
      </a>

      <nav class="nav-links" id="headerNavLinks">
        <a class="nav-link ${isHome ? 'active' : ''}" data-nav="/">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Home</span>
        </a>
        <a class="nav-link ${isImage ? 'active' : ''}" data-nav="/image">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>Image</span>
        </a>
        <a class="nav-link ${isPdf ? 'active' : ''}" data-nav="/pdf">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>PDF</span>
        </a>
        <a class="nav-link ${isAudio ? 'active' : ''}" data-nav="/audio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <span>Audio</span>
        </a>
        <a class="nav-link ${isSocial ? 'active' : ''}" data-nav="/social">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          <span>Social</span>
        </a>
        <a class="nav-link ${isText ? 'active' : ''}" data-nav="/text">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          <span>Text</span>
        </a>
      </nav>

      <div class="header-actions">
        <button class="nav-search-btn" id="navSearchBtn" aria-label="Search Tools">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span class="search-label">Search</span>
        </button>

        <button class="header-theme-btn theme-toggle-btn" id="themeToggleBtn" aria-label="Toggle Dark Mode" title="Toggle Light/Dark Theme">
          <svg class="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <span class="theme-text">Dark Mode</span>
        </button>

        <button class="hamburger" id="hamburgerBtn" aria-label="Toggle Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </div>
    </div>
  </header>

  <div class="search-overlay" id="searchOverlay">
    <div class="search-modal">
      <div class="search-input-row">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Search all tools..." id="globalSearch" autocomplete="off" />
        <kbd class="search-esc" id="searchCloseBtn">esc</kbd>
      </div>
      <div class="search-results" id="searchResults">
        <div class="search-placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p>Type to search ${tools.length} tools...</p>
        </div>
      </div>
    </div>
  </div>`;
}
