// ===== ROUTER =====
import { renderHome } from './pages/home.js';
import { renderToolPage } from './pages/tool-page.js';

export function getRoute() {
  const hash = window.location.hash.slice(1) || '/';
  return hash;
}

export function navigateTo(path) {
  window.location.hash = path;
}

export function router() {
  const route = getRoute();
  if (route === '/' || route === '' || ['/image', '/pdf', '/audio', '/social', '/text'].includes(route)) {
    return renderHome();
  }
  if (route.startsWith('/tool/')) {
    const toolId = route.replace('/tool/', '');
    return renderToolPage(toolId);
  }
  return renderHome();
}
