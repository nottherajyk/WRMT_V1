import { tools } from '../tools-data.js';

export function renderHome() {
  const route = window.location.hash.slice(1) || '/';
  const catRoutes = ['/image', '/pdf', '/audio', '/social', '/text'];
  const isCatPage = catRoutes.includes(route);

  // ── Category page: just tools, no hero ──
  if (isCatPage) {
    const catMap = { '/image': 'image', '/pdf': 'pdf', '/audio': 'audio', '/social': 'social', '/text': 'text' };
    const catId  = catMap[route];
    const catTools = tools.filter(t => t.category === catId);
    const catTitles = { image: 'Image Tools', pdf: 'PDF Tools', audio: 'Audio Tools', social: 'Social Media', text: 'Text & Lists' };
    return `
    <section class="tools-section" id="toolsSection">
      ${renderCategorySection(catId, catTitles[catId], catTools)}
    </section>`;
  }

  // ── Home page: hero intro only ──
  return `
  <section class="hero">
    <div class="hero-badge sr-fade-down">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      100% Free — Zero Ads — No Signup Required
    </div>

    <h1 id="heroTitle" data-text="Every |Tool| you need\\nright here. right now."></h1>

    <div class="hero-pain sr-fade-up">
      <div class="pain-card">
        <div class="pain-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <div class="pain-text">
          <span class="pain-label">The Problem</span>
          <p>You search for a simple tool. You get 47 tabs, 12 popups, and a "Subscribe for full access" wall.</p>
        </div>
      </div>
      <div class="pain-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
      <div class="pain-card pain-card--solution">
        <div class="pain-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div class="pain-text">
          <span class="pain-label">The Fix</span>
          <p>Every tool you actually need, in one place. No ads. No paywall. No BS. Just open and get it done.</p>
        </div>
      </div>
    </div>

    <div class="hero-stats sr-fade-up">
      <div class="hero-stat">
        <div class="num">${tools.length}+</div>
        <div class="label">Free Tools</div>
      </div>
      <div class="hero-stat-divider"></div>
      <div class="hero-stat">
        <div class="num">0</div>
        <div class="label">Ads</div>
      </div>
      <div class="hero-stat-divider"></div>
      <div class="hero-stat">
        <div class="num">0kb</div>
        <div class="label">Data Sent to Server</div>
      </div>
      <div class="hero-stat-divider"></div>
      <div class="hero-stat">
        <div class="num">5</div>
        <div class="label">Categories</div>
      </div>
    </div>

    <div class="hero-cta sr-fade-up">
      <a class="btn btn-primary" href="#/image" data-nav="/image">Browse Image Tools</a>
      <a class="btn btn-secondary" href="#/pdf" data-nav="/pdf">Browse PDF Tools</a>
    </div>
  </section>
  `;
}

function renderCategorySection(catId, title, toolsList) {
  const pdfSections = ['All', 'Workflows', 'Organize PDF', 'Optimize PDF', 'Convert PDF', 'Edit PDF', 'PDF Security', 'PDF Intelligence'];
  
  const hasSections = catId === 'pdf';
  const sections = hasSections ? pdfSections : [];

  return `
    <div class="tools-category" data-category="${catId}" id="cat-${catId}">
      <div class="tools-category-header sr-slide-left">
        <div class="cat-icon ${catId}">${
          catId === 'image'  ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' :
          catId === 'pdf'    ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' :
          catId === 'audio'  ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' :
          catId === 'social' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>' :
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'
        }</div>
        <h2>${title}</h2>
        <span class="cat-count" id="catCount">${toolsList.length} tools</span>
      </div>

      ${hasSections ? `
        <div class="tool-section-pills-wrap sr-fade-up">
          <div class="tool-section-pills" id="pdfSectionPills">
            ${sections.map((sec, idx) => `
              <button class="tool-section-pill ${idx === 0 ? 'active' : ''}" data-section="${sec}">${sec}</button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="tools-grid" id="toolsGrid">
        ${toolsList.map((t, i) => `
          <a class="tool-card ${t.category}-tool sr-blur-in sr-delay-${Math.min(i + 1, 10)}" 
             href="#/tool/${t.id}" 
             data-nav="/tool/${t.id}" 
             data-section="${t.section || ''}"
             data-workflow="${t.isWorkflow ? 'true' : 'false'}">
            <div class="tool-card-icon">${t.icon}</div>
            <h3>${t.name}</h3>
            <p>${t.desc}</p>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

/* ══════════════════════════════════
   SCROLL REVEAL ENGINE
   ══════════════════════════════════ */
function initScrollAnimations() {
  // ── 1. WORD-BY-WORD HERO TEXT REVEAL ──
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    const rawText = heroTitle.dataset.text || '';
    const lines = rawText.split('\\n');
    heroTitle.innerHTML = '';
    heroTitle.style.perspective = '600px';

    let wordIndex = 0;
    lines.forEach((line, lineIdx) => {
      const words = line.split(' ');
      words.forEach((word, wi) => {
        // Check if word has gradient markers |word|
        const isGradient = word.startsWith('|') && word.endsWith('|');
        const cleanWord = isGradient ? word.slice(1, -1) : word;

        const span = document.createElement('span');
        span.className = 'reveal-word';
        span.style.transitionDelay = `${wordIndex * 0.09 + 0.25}s`;

        if (isGradient) {
          const gradientSpan = document.createElement('span');
          gradientSpan.className = 'gradient';
          gradientSpan.textContent = cleanWord;
          span.appendChild(gradientSpan);
        } else {
          span.textContent = cleanWord;
        }

        heroTitle.appendChild(span);

        // Space between words
        if (wi < words.length - 1) {
          heroTitle.appendChild(document.createTextNode(' '));
        }
        wordIndex++;
      });

      // Add line break between lines
      if (lineIdx < lines.length - 1) {
        heroTitle.appendChild(document.createElement('br'));
      }
    });

    // Trigger reveal after a short delay
    requestAnimationFrame(() => {
      setTimeout(() => {
        heroTitle.querySelectorAll('.reveal-word').forEach(w => w.classList.add('revealed'));
      }, 100);
    });
  }

  // ── 2. INTERSECTION OBSERVER FOR SCROLL REVEALS ──
  const scrollSelectors = [
    '.sr-fade-up', '.sr-fade-down',
    '.sr-slide-left', '.sr-slide-right',
    '.sr-scale-in', '.sr-blur-in'
  ];

  const allScrollEls = document.querySelectorAll(scrollSelectors.join(','));

  if (!allScrollEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  allScrollEls.forEach(el => observer.observe(el));
}

// Category filter logic + animation init
window.addEventListener('page-rendered', () => {
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.cat;
      if (cat === 'image') {
        window.location.hash = '#/';
      } else {
        window.location.hash = `#/${cat}`;
      }
    });
  });

  // PDF Section Pills Filtering
  const pills = document.querySelectorAll('.tool-section-pill');
  const cards = document.querySelectorAll('#toolsGrid .tool-card');
  const catCount = document.getElementById('catCount');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const sec = pill.dataset.section;
      let visibleCount = 0;

      cards.forEach(card => {
        const cardSec = card.dataset.section;
        const isWorkflow = card.dataset.workflow === 'true';

        let show = false;
        if (sec === 'All') {
          show = true;
        } else if (sec === 'Workflows') {
          show = isWorkflow;
        } else {
          show = cardSec === sec;
        }

        if (show) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (catCount) {
        catCount.textContent = `${visibleCount} tools`;
      }
    });
  });

  // Initialize scroll + text reveal animations
  initScrollAnimations();
});

