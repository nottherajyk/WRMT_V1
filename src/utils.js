export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showDownloadConfirmationModal(filename, sizeText, onConfirm) {
  let overlay = document.querySelector('.download-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'download-modal-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="download-modal-container">
      <div class="download-modal-header">
        <span class="download-modal-title">DOWNLOAD CONFIRMATION</span>
        <button class="download-modal-close-btn" aria-label="Close modal">&times;</button>
      </div>
      <div class="download-modal-body">
        <div class="download-modal-icon-container">
          <div class="download-modal-icon">&#128190;</div>
        </div>
        <div class="download-modal-details-table">
          <div class="download-modal-row">
            <span class="download-modal-label">File Name:</span>
            <span class="download-modal-value download-modal-filename" title="${filename}">${filename}</span>
          </div>
          <div class="download-modal-row">
            <span class="download-modal-label">File Size:</span>
            <span class="download-modal-value download-modal-filesize">${sizeText}</span>
          </div>
        </div>
        <p class="download-modal-disclaimer">Would you like to authorize this download to your system?</p>
        <p class="download-modal-note" style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 0.5rem; max-width: 90%; opacity: 0.85; line-height: 1.4;">
          * Note: Downloads may occasionally fail or require retry for YouTube Downloader and Spotify tools due to external API limits.
        </p>
      </div>
      <div class="download-modal-footer">
        <button class="download-modal-btn download-modal-btn-cancel">Cancel</button>
        <button class="download-modal-btn download-modal-btn-confirm">Download File &#128640;</button>
      </div>
    </div>
  `;

  const closeModal = () => {
    overlay.classList.remove('active');
    document.removeEventListener('keydown', handleEscape);
    setTimeout(() => { overlay.remove(); }, 250);
  };

  const confirmDownload = () => {
    closeModal();
    onConfirm();
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  overlay.querySelector('.download-modal-close-btn').addEventListener('click', closeModal);
  overlay.querySelector('.download-modal-btn-cancel').addEventListener('click', closeModal);
  overlay.querySelector('.download-modal-btn-confirm').addEventListener('click', confirmDownload);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', handleEscape);

  requestAnimationFrame(() => { overlay.classList.add('active'); });
}

export function downloadBlob(blob, filename) {
  const sizeText = formatBytes(blob.size);
  showDownloadConfirmationModal(filename, sizeText, () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  });
}

export function downloadDataURL(dataURL, filename) {
  let sizeText = 'Unknown';
  if (dataURL.startsWith('data:')) {
    const base64Str = dataURL.split(',')[1] || '';
    const sizeBytes = Math.floor((base64Str.length * 3) / 4);
    sizeText = formatBytes(sizeBytes);
  }
  showDownloadConfirmationModal(filename, sizeText, () => {
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); }, 1000);
  });
}

export function downloadURL(url, filename) {
  showDownloadConfirmationModal(filename, 'Remote / External Resource', () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); }, 1000);
  });
}

function readFile(file, method) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader[method](file);
  });
}

export const readFileAsDataURL    = f => readFile(f, 'readAsDataURL');
export const readFileAsArrayBuffer = f => readFile(f, 'readAsArrayBuffer');
export const readFileAsText        = f => readFile(f, 'readAsText');

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

export function renderDropZone(id, accept, label = 'Drop your file here or click to browse', multiple = false) {
  const hint = multiple ? `Supports ${accept.toUpperCase()} files — Multiple files allowed` : `Supports ${accept.toUpperCase()} files`;
  const btnLabel = multiple ? 'Choose Files' : 'Choose File';
  const icon = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
  const uploadIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
  return `
    <div class="dropzone" id="${id}" tabindex="0" role="button" aria-label="${label}">
      <div class="dropzone-icon">${icon}</div>
      <h3 class="dropzone-text">${label}</h3>
      <p class="dropzone-hint">${hint}</p>
      <button class="btn btn-primary dropzone-btn" type="button" style="margin-top: 1.25rem; pointer-events: none; padding: 0.65rem 1.5rem; font-size: 0.95rem;">${uploadIcon} ${btnLabel}</button>
      <input type="file" accept="${accept}" id="${id}Input" ${multiple ? 'multiple ' : ''}style="display: none;" />
    </div>`;
}

export function renderMultiDropZone(id, accept, label = 'Drop your files here or click to browse') {
  return renderDropZone(id, accept, label, true);
}

export function setupDropZone(zoneId, inputId, onFile) {
  window.addEventListener('page-rendered', () => {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    ['dragover', 'dragenter'].forEach(e => zone.addEventListener(e, (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      zone.classList.add('drag-over');
    }));

    ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, (ev) => {
      ev.stopPropagation();
      zone.classList.remove('drag-over');
    }));

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files.length) onFile(e.dataTransfer.files);
    });

    zone.addEventListener('click', () => {
      input.click();
    });

    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    input.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    input.addEventListener('change', () => {
      if (input.files.length) onFile(input.files);
    });
  });
}
