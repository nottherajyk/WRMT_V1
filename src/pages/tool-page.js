import { tools } from '../tools-data.js';
import { imageToolHandler } from '../tools/image-tools.js';
import { pdfToolHandler } from '../tools/pdf-tools.js';
import { socialToolHandler } from '../tools/social-tools.js';
import { textToolHandler } from '../tools/text-tools.js';
import { audioToolHandler } from '../tools/audio-tools.js';

export function renderToolPage(toolId) {
  const tool = tools.find(t => t.id === toolId);
  if (!tool) return `<div class="tool-page"><h1>Tool not found</h1><p><a href="#/">Go back home</a></p></div>`;

  const catNames = { image: 'Image Tools', pdf: 'PDF Tools', audio: 'Audio Tools', social: 'Social Media', text: 'Text & Lists' };

  let toolContent = '';
  if (tool.category === 'image') toolContent = imageToolHandler(tool);
  else if (tool.category === 'pdf') toolContent = pdfToolHandler(tool);
  else if (tool.category === 'audio') toolContent = audioToolHandler(tool);
  else if (tool.category === 'social') toolContent = socialToolHandler(tool);
  else if (tool.category === 'text') toolContent = textToolHandler(tool);

  return `
    <div class="tool-page">
      <div class="tool-page-header">
        <nav class="breadcrumb" aria-label="Breadcrumb navigation">
          <a class="breadcrumb-item" href="#/">Home</a>
          <span class="breadcrumb-separator">›</span>
          <a class="breadcrumb-item" href="#/${tool.category}" data-nav="/${tool.category}">${catNames[tool.category] || 'Tools'}</a>
          <span class="breadcrumb-separator">›</span>
          <span class="breadcrumb-item breadcrumb-current">${tool.name}</span>
        </nav>
        <h1>${tool.icon} ${tool.name}</h1>
        <p class="tool-desc">${tool.desc}</p>
      </div>
      ${toolContent}
    </div>
  `;
}
