import { formatBytes, downloadBlob, readFileAsDataURL, setupDropZone, renderDropZone } from '../utils.js';
import { showToast } from '../components/toast.js';

export function enhanceToolHandler(tool) {
  setTimeout(() => setupEnhanceTool(), 50);
  window.addEventListener('page-rendered', () => setupEnhanceTool(), { once: true });

  return renderEnhanceUI();
}

function renderEnhanceUI() {
  return `
    <!-- Drop Zone Section (Initially Visible, hides when image loaded) -->
    <div id="enhance-initial-state">
      ${renderDropZone('imgEnhance', '.jpg,.jpeg,.png,.webp', 'Drop your image to auto-enhance & upscale')}
    </div>

    <div id="enhance-active-state" class="compressor-workspace" style="display:none">
      <!-- Left side: Controls -->
      <div class="compressor-controls-card">
        <div class="live-indicator">
          <span class="live-indicator-dot"></span>
          <span>AUTO ENHANCER & UPSCALER</span>
        </div>

        <div id="fileInfoArea"></div>

        <!-- Upscale Factor Selection -->
        <div class="form-group" style="margin-top:0.75rem">
          <label class="form-label" style="font-size:0.9rem;font-weight:800;display:flex;align-items:center;gap:0.4rem;margin-bottom:0.35rem">
            <span>🔍</span> Resolution Upscale
          </label>
          <div class="upscale-selector" style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.4rem">
            <button type="button" class="btn-upscale active" data-scale="2" style="padding:0.5rem 0.35rem;font-weight:900;font-size:0.95rem;border:2.5px solid #000;background:var(--accent,#ffcc00);color:#000;box-shadow:2px 2px 0 #000;cursor:pointer;border-radius:8px;transition:all 0.15s">2×</button>
            <button type="button" class="btn-upscale" data-scale="3" style="padding:0.5rem 0.35rem;font-weight:900;font-size:0.95rem;border:2.5px solid #000;background:#fff;color:#000;box-shadow:2px 2px 0 #000;cursor:pointer;border-radius:8px;transition:all 0.15s">3×</button>
            <button type="button" class="btn-upscale" data-scale="5" style="padding:0.5rem 0.35rem;font-weight:900;font-size:0.95rem;border:2.5px solid #000;background:#fff;color:#000;box-shadow:2px 2px 0 #000;cursor:pointer;border-radius:8px;transition:all 0.15s">5×</button>
          </div>
          <span id="scaleDescription" style="display:block;margin-top:0.35rem;font-size:0.78rem;color:var(--text-muted);font-weight:600">2× Upscale (Double resolution + auto-enhancement)</span>
        </div>

        <!-- Automatic Adjustments Summary Card -->
        <div class="auto-adjustments-card" style="margin-top:0.75rem;padding:0.75rem;border:2px dashed #000;border-radius:8px;background:rgba(0,0,0,0.03)">
          <div style="font-size:0.8rem;font-weight:800;text-transform:uppercase;margin-bottom:0.4rem;display:flex;align-items:center;gap:0.35rem">
            <span>✨</span> Auto-Adjustments Applied
          </div>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.3rem;font-size:0.76rem;font-weight:600">
            <li style="display:flex;align-items:center;gap:0.35rem">
              <span style="color:#10b981;font-weight:900">✔</span> Auto-Exposure & Brightness Balance
            </li>
            <li style="display:flex;align-items:center;gap:0.35rem">
              <span style="color:#10b981;font-weight:900">✔</span> Dynamic Contrast & Histogram Stretch
            </li>
            <li style="display:flex;align-items:center;gap:0.35rem">
              <span style="color:#10b981;font-weight:900">✔</span> Intelligent Color Vibrance & Saturation
            </li>
            <li style="display:flex;align-items:center;gap:0.35rem">
              <span style="color:#10b981;font-weight:900">✔</span> Unsharp Mask Edge Sharpening
            </li>
          </ul>
        </div>

        <!-- Download Action -->
        <div class="actions-row" style="margin-top:auto;padding-top:1rem">
          <button class="btn btn-primary" id="downloadEnhancedBtn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:0.5rem;font-weight:900;padding:0.8rem 1rem">
            <span>💾</span> Download Enhanced Image
          </button>
        </div>
      </div>

      <!-- Right side: Realtime Before/After Split Comparison & Metrics -->
      <div class="compressor-preview-card">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #000;padding-bottom:0.45rem">
          <h3 style="font-family:'Fredoka', sans-serif;font-weight:900;font-size:1.15rem;display:flex;align-items:center;gap:0.45rem;margin:0">
            <span>🖼️</span> Before & After Comparison
          </h3>
          <span style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">↔ Drag Slider</span>
        </div>

        <!-- Single Split Comparison Viewer -->
        <div class="split-compare-viewer" id="splitCompareViewer" style="--split-pos: 50%;">
          <!-- Base layer: Enhanced Image Canvas (Bottom/Right) -->
          <div class="split-layer-base">
            <canvas id="enhancedCanvas"></canvas>
          </div>

          <!-- Clipped layer: Original Image (Top/Left) -->
          <div class="split-layer-clipped">
            <img id="origPreviewImg" alt="Original Image (Before)" />
          </div>

          <!-- Divider vertical bar & handle -->
          <div class="split-divider-line">
            <div class="split-handle-pill">◂ ▸</div>
          </div>

          <!-- Badges -->
          <div class="split-badge-before">◀ Before (Orig)</div>
          <div class="split-badge-after">After (Enhanced) ▶</div>

          <!-- Interactive Range Slider Overlay for Mouse & Touch -->
          <input type="range" min="0" max="100" value="50" class="split-range-input" id="splitRangeInput" aria-label="Before and after comparison slider" />

          <!-- Loading Spinner -->
          <div class="comp-loading-overlay" id="enhanceLoadingOverlay">
            <div class="spinner-brutalist"></div>
          </div>
        </div>

        <!-- Live Metrics Panel -->
        <div class="live-metrics-panel">
          <div class="metric-item">
            <span class="metric-label">Original Size</span>
            <span class="metric-value" id="metric-original-size">--</span>
          </div>

          <div class="metric-item">
            <span class="metric-label">Original Dims</span>
            <span class="metric-value" id="metric-dimensions">--</span>
          </div>

          <div class="metric-item">
            <span class="metric-label">Enhanced Dims</span>
            <span class="metric-value highlight-green" id="metric-enhanced-dims">--</span>
          </div>
        </div>
      </div>
    </div>
  `;
}


// ===== SETUP LOGIC =====
function setupEnhanceTool() {
  let currentFile = null;
  let currentDataURL = null;
  let enhanceTimeout = null;
  let latestEnhancedBlob = null;
  let cachedOriginalImg = null;
  let currentScale = 2; // Default upscale 2x

  const zone = document.getElementById('imgEnhance');
  const input = document.getElementById('imgEnhanceInput');
  const scaleDesc = document.getElementById('scaleDescription');
  const splitViewer = document.getElementById('splitCompareViewer');
  const splitRange = document.getElementById('splitRangeInput');

  // Before / After Slider Control (handles both range input and direct pointer moves)
  if (splitRange && splitViewer) {
    const updateSplit = (val) => {
      splitViewer.style.setProperty('--split-pos', `${val}%`);
    };

    splitRange.addEventListener('input', (e) => {
      updateSplit(e.target.value);
    });

    // Support smooth pointer dragging across the container
    let isDragging = false;
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const rect = splitViewer.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0]?.clientX)) - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      updateSplit(pct);
      if (splitRange) splitRange.value = pct;
    };

    splitViewer.addEventListener('pointerdown', (e) => {
      isDragging = true;
      handlePointerMove(e);
    });
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', () => { isDragging = false; });
  }

  // Scale buttons
  const scaleButtons = document.querySelectorAll('.btn-upscale');
  scaleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const scale = parseInt(btn.dataset.scale);
      if (scale === currentScale) return;

      currentScale = scale;
      scaleButtons.forEach(b => {
        b.classList.remove('active');
        b.style.background = '#fff';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--accent, #ffcc00)';

      if (scaleDesc) {
        scaleDesc.textContent = `${scale}× Upscale (${scale}× resolution + automatic enhancement)`;
      }

      runAutoEnhancement();
    });
  });

  // File handler
  function handleImageFile(files) {
    currentFile = files[0];
    if (zone) zone.style.display = 'none';

    const reader = new FileReader();
    reader.onload = (e) => {
      currentDataURL = e.target.result;

      const initial = document.getElementById('enhance-initial-state');
      const active = document.getElementById('enhance-active-state');
      const origImg = document.getElementById('origPreviewImg');

      if (initial) initial.style.display = 'none';
      if (active) active.style.display = '';
      if (origImg) origImg.src = currentDataURL;

      const img = new Image();
      img.onload = () => {
        cachedOriginalImg = img;
        const infoArea = document.getElementById('fileInfoArea');
        if (infoArea) {
          infoArea.innerHTML = `
            <div class="file-info" style="margin-bottom: 0;">
              <div class="file-info-icon">📄</div>
              <div class="file-info-details">
                <div class="file-info-name" style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${currentFile.name}</div>
                <div class="file-info-size" id="original-size-badge" style="font-weight: 700;">${formatBytes(currentFile.size)}</div>
              </div>
              <button class="file-info-remove" type="button" aria-label="Remove File">&times;</button>
            </div>`;
        }

        // Reset split slider to 50%
        if (splitViewer) splitViewer.style.setProperty('--split-pos', '50%');
        if (splitRange) splitRange.value = 50;

        runAutoEnhancement();
      };
      img.src = currentDataURL;
    };
    reader.readAsDataURL(currentFile);

    // Reset function
    window.activeImageReset = () => {
      currentFile = null;
      currentDataURL = null;
      latestEnhancedBlob = null;
      cachedOriginalImg = null;
      currentScale = 2;
      if (input) input.value = '';

      const infoArea = document.getElementById('fileInfoArea');
      if (infoArea) infoArea.innerHTML = '';

      const origImg = document.getElementById('origPreviewImg');
      if (origImg) origImg.src = '';

      const canvas = document.getElementById('enhancedCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      const initial = document.getElementById('enhance-initial-state');
      const activeState = document.getElementById('enhance-active-state');
      if (initial) initial.style.display = '';
      if (activeState) activeState.style.display = 'none';

      // Reset scale buttons
      scaleButtons.forEach(b => {
        if (parseInt(b.dataset.scale) === 2) {
          b.classList.add('active');
          b.style.background = 'var(--accent, #ffcc00)';
        } else {
          b.classList.remove('active');
          b.style.background = '#fff';
        }
      });

      if (splitViewer) splitViewer.style.setProperty('--split-pos', '50%');
      if (splitRange) splitRange.value = 50;

      if (zone) zone.style.display = 'flex';
    };

    if (!document.body.dataset.imageResetAttached) {
      document.body.dataset.imageResetAttached = 'true';
      document.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.file-info-remove');
        if (!removeBtn) return;
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.activeImageReset === 'function') {
          window.activeImageReset();
        }
      });
    }
  }

  // ===== AUTOMATIC ENHANCEMENT & UPSCALE ENGINE =====
  function runAutoEnhancement() {
    if (!currentFile || !currentDataURL || !cachedOriginalImg) return;

    const loader = document.getElementById('enhanceLoadingOverlay');
    if (loader) loader.classList.add('active');

    clearTimeout(enhanceTimeout);
    enhanceTimeout = setTimeout(() => {
      const img = cachedOriginalImg;
      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;

      const scale = currentScale; // 2, 3, or 5
      const targetW = srcW * scale;
      const targetH = srcH * scale;

      // ── Step 1: Analyze Original Image Luminance, Contrast & Saturation ──
      const sampleCanvas = document.createElement('canvas');
      const sampleW = Math.min(300, srcW);
      const sampleH = Math.min(300, srcH);
      sampleCanvas.width = sampleW;
      sampleCanvas.height = sampleH;
      const sampleCtx = sampleCanvas.getContext('2d');
      sampleCtx.drawImage(img, 0, 0, sampleW, sampleH);
      const sampleData = sampleCtx.getImageData(0, 0, sampleW, sampleH).data;

      let lumSum = 0;
      let satSum = 0;
      const pixelCount = sampleW * sampleH;
      const lumValues = new Float32Array(pixelCount);

      for (let i = 0, p = 0; i < sampleData.length; i += 4, p++) {
        const r = sampleData[i];
        const g = sampleData[i + 1];
        const b = sampleData[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        lumValues[p] = lum;
        lumSum += lum;

        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
        satSum += sat;
      }

      const meanLum = lumSum / pixelCount;
      const meanSat = satSum / pixelCount;

      let varianceSum = 0;
      for (let p = 0; p < pixelCount; p++) {
        const diff = lumValues[p] - meanLum;
        varianceSum += diff * diff;
      }
      const stdDevLum = Math.sqrt(varianceSum / pixelCount);

      // ── Step 2: Compute Optimal Auto-Adjustment Parameters ──
      let autoBrightness = 0;
      if (meanLum < 110) {
        autoBrightness = Math.min(35, (125 - meanLum) * 0.45);
      } else if (meanLum > 150) {
        autoBrightness = -Math.min(25, (meanLum - 140) * 0.35);
      }

      let autoContrast = 15;
      if (stdDevLum < 45) {
        autoContrast = Math.min(35, 15 + (45 - stdDevLum) * 0.7);
      } else if (stdDevLum > 75) {
        autoContrast = 8;
      }

      let autoSaturation = 15;
      if (meanSat < 0.22) {
        autoSaturation = 25;
      } else if (meanSat > 0.5) {
        autoSaturation = 5;
      }

      const autoSharpness = Math.min(65, 30 + scale * 6);

      // ── Step 3: High-Quality Upscale Render ──
      const workCanvas = document.createElement('canvas');
      workCanvas.width = targetW;
      workCanvas.height = targetH;
      const workCtx = workCanvas.getContext('2d');

      workCtx.imageSmoothingEnabled = true;
      workCtx.imageSmoothingQuality = 'high';
      workCtx.drawImage(img, 0, 0, targetW, targetH);

      // ── Step 4: Apply Automatic Pixel Adjustments ──
      const imgData = workCtx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;

      const bOffset = autoBrightness * 2.55;
      const cFactor = (259 * (autoContrast + 255)) / (255 * (259 - autoContrast));
      const satFactor = autoSaturation / 100;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        if (autoBrightness !== 0) {
          r += bOffset;
          g += bOffset;
          b += bOffset;
        }

        if (autoContrast !== 0) {
          r = cFactor * (r - 128) + 128;
          g = cFactor * (g - 128) + 128;
          b = cFactor * (b - 128) + 128;
        }

        if (autoSaturation !== 0) {
          const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
          r = gray + (r - gray) * (1 + satFactor);
          g = gray + (g - gray) * (1 + satFactor);
          b = gray + (b - gray) * (1 + satFactor);
        }

        data[i]     = clamp(r);
        data[i + 1] = clamp(g);
        data[i + 2] = clamp(b);
      }

      workCtx.putImageData(imgData, 0, 0);

      // ── Step 5: Adaptive Unsharp Mask for Crisp Upscaled Edges ──
      applyUnsharpMask(workCtx, targetW, targetH, autoSharpness);

      // ── Step 6: Render to Visible Comparison Canvas ──
      const displayCanvas = document.getElementById('enhancedCanvas');
      if (displayCanvas) {
        displayCanvas.width = targetW;
        displayCanvas.height = targetH;
        const displayCtx = displayCanvas.getContext('2d');
        displayCtx.drawImage(workCanvas, 0, 0);
      }

      // Update metrics
      const origSizeEl = document.getElementById('metric-original-size');
      const dimsEl = document.getElementById('metric-dimensions');
      const enhDimsEl = document.getElementById('metric-enhanced-dims');

      if (origSizeEl) origSizeEl.textContent = formatBytes(currentFile.size);
      if (dimsEl) dimsEl.textContent = `${srcW} × ${srcH}`;
      if (enhDimsEl) enhDimsEl.textContent = `${targetW} × ${targetH} (${scale}×)`;

      // Generate blob for instant download
      workCanvas.toBlob((blob) => {
        if (blob) {
          latestEnhancedBlob = blob;
        }
        if (loader) loader.classList.remove('active');
      }, 'image/png');
    }, 150);
  }

  // ===== UNSHARP MASK (3x3 Gaussian Convolution Edge Enhancement) =====
  function applyUnsharpMask(ctx, w, h, amount) {
    const strength = amount / 100;
    const src = ctx.getImageData(0, 0, w, h);
    const srcData = src.data;

    const blurred = new Float32Array(srcData.length);
    const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
    const kernelSum = 16;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let rSum = 0, gSum = 0, bSum = 0;
        let ki = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = Math.min(w - 1, Math.max(0, x + kx));
            const py = Math.min(h - 1, Math.max(0, y + ky));
            const idx = (py * w + px) * 4;
            const kv = kernel[ki++];
            rSum += srcData[idx] * kv;
            gSum += srcData[idx + 1] * kv;
            bSum += srcData[idx + 2] * kv;
          }
        }
        const idx = (y * w + x) * 4;
        blurred[idx]     = rSum / kernelSum;
        blurred[idx + 1] = gSum / kernelSum;
        blurred[idx + 2] = bSum / kernelSum;
        blurred[idx + 3] = srcData[idx + 3];
      }
    }

    const output = ctx.createImageData(w, h);
    const outData = output.data;
    for (let i = 0; i < srcData.length; i += 4) {
      outData[i]     = clamp(srcData[i]     + strength * (srcData[i]     - blurred[i]));
      outData[i + 1] = clamp(srcData[i + 1] + strength * (srcData[i + 1] - blurred[i + 1]));
      outData[i + 2] = clamp(srcData[i + 2] + strength * (srcData[i + 2] - blurred[i + 2]));
      outData[i + 3] = srcData[i + 3];
    }

    ctx.putImageData(output, 0, 0);
  }

  function clamp(val) {
    return Math.max(0, Math.min(255, Math.round(val)));
  }

  // ===== SETUP DROP ZONE =====
  if (zone && input) {
    ['dragover', 'dragenter'].forEach(e => zone.addEventListener(e, (ev) => { ev.preventDefault(); zone.classList.add('drag-over'); }));
    ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, () => zone.classList.remove('drag-over')));
    zone.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files); });
    zone.addEventListener('click', () => input.click());
    zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', () => { if (input.files.length) handleImageFile(input.files); });
  }

  // ===== DOWNLOAD BUTTON =====
  const downloadBtn = document.getElementById('downloadEnhancedBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (latestEnhancedBlob) {
        const newName = currentFile.name.replace(/\.[^.]+$/, '') + `-enhanced-${currentScale}x.png`;
        downloadBlob(latestEnhancedBlob, newName);
        showToast(`Enhanced ${currentScale}× image downloaded successfully!`);
      } else {
        showToast('Please wait for enhancement to complete...', 'warning');
      }
    });
  }

  // ===== AUTO-CONSUME PENDING DROPPED FILE =====
  if (window.pendingDroppedFile) {
    const file = window.pendingDroppedFile;
    const isImageFile = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    if (isImageFile) {
      window.pendingDroppedFile = null;
      setTimeout(() => {
        handleImageFile([file]);
      }, 100);
    }
  }
}
