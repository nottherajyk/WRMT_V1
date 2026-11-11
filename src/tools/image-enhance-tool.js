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
      ${renderDropZone('imgEnhance', '.jpg,.jpeg,.png,.webp', 'Drop your image to enhance')}
    </div>

    <div id="enhance-active-state" class="compressor-workspace" style="display:none">
      <!-- Left side: Controls -->
      <div class="compressor-controls-card">
        <div class="live-indicator">
          <span class="live-indicator-dot"></span>
          <span>LIVE ENHANCEMENT WORKSPACE</span>
        </div>

        <div id="fileInfoArea"></div>

        <!-- Sharpness -->
        <div class="form-group" style="margin-top:1rem">
          <label class="form-label">Sharpness (Unsharp Mask)</label>
          <input type="range" class="range-slider" id="sharpnessSlider" min="0" max="100" value="0" />
          <span id="sharpnessVal" style="font-size:.82rem;color:var(--text-muted)">0</span>
        </div>

        <!-- Brightness -->
        <div class="form-group">
          <label class="form-label">Brightness</label>
          <input type="range" class="range-slider" id="brightnessSlider" min="-100" max="100" value="0" />
          <span id="brightnessVal" style="font-size:.82rem;color:var(--text-muted)">0</span>
        </div>

        <!-- Contrast -->
        <div class="form-group">
          <label class="form-label">Contrast</label>
          <input type="range" class="range-slider" id="contrastSlider" min="-100" max="100" value="0" />
          <span id="contrastVal" style="font-size:.82rem;color:var(--text-muted)">0</span>
        </div>

        <!-- Saturation -->
        <div class="form-group">
          <label class="form-label">Saturation</label>
          <input type="range" class="range-slider" id="saturationSlider" min="-100" max="100" value="0" />
          <span id="saturationVal" style="font-size:.82rem;color:var(--text-muted)">0</span>
        </div>

        <!-- Upscale 2x -->
        <div class="form-group" style="display:flex;align-items:center;gap:0.75rem">
          <input type="checkbox" id="upscaleCheckbox" style="width:18px;height:18px;cursor:pointer" />
          <label for="upscaleCheckbox" class="form-label" style="margin:0;cursor:pointer">Upscale 2× (double resolution)</label>
        </div>

        <!-- Reset Controls -->
        <div class="actions-row" style="margin-top:0.5rem">
          <button class="btn btn-secondary" id="resetControlsBtn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:0.5rem">
            <span>🔄</span> Reset All Controls
          </button>
        </div>

        <!-- Download -->
        <div class="actions-row" style="margin-top:auto">
          <button class="btn btn-primary" id="downloadEnhancedBtn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:0.5rem">
            <span>💾</span> Download Enhanced Image
          </button>
        </div>
      </div>

      <!-- Right side: Realtime Preview & Metrics -->
      <div class="compressor-preview-card">
        <h3 style="font-family:'Fredoka', sans-serif;font-weight:900;font-size:1.2rem;border-bottom:3px solid #000;padding-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem">
          <span>🖼️</span> Visual Comparison
        </h3>

        <div class="comparison-container">
          <!-- Original Box -->
          <div class="comparison-box">
            <span class="comparison-box-title">Original</span>
            <div class="comparison-img-wrapper">
              <img id="origPreviewImg" alt="Original Image" />
            </div>
          </div>

          <!-- Enhanced Box -->
          <div class="comparison-box compressed-box">
            <span class="comparison-box-title">Enhanced</span>
            <div class="comparison-img-wrapper">
              <div class="comp-loading-overlay" id="enhanceLoadingOverlay">
                <div class="spinner-brutalist"></div>
              </div>
              <canvas id="enhancedCanvas" style="max-width:100%;max-height:100%;object-fit:contain"></canvas>
            </div>
          </div>
        </div>

        <!-- Live Metrics Panel -->
        <div class="live-metrics-panel">
          <div class="metric-item">
            <span class="metric-label">Original</span>
            <span class="metric-value" id="metric-original-size">--</span>
          </div>

          <div class="metric-item">
            <span class="metric-label">Dimensions</span>
            <span class="metric-value" id="metric-dimensions">--</span>
          </div>

          <div class="metric-item">
            <span class="metric-label">Enhanced</span>
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
  // Cache the loaded original Image object to avoid reloading on every update
  let cachedOriginalImg = null;

  const zone = document.getElementById('imgEnhance');
  const input = document.getElementById('imgEnhanceInput');

  // Slider references
  const sharpnessSlider = document.getElementById('sharpnessSlider');
  const brightnessSlider = document.getElementById('brightnessSlider');
  const contrastSlider = document.getElementById('contrastSlider');
  const saturationSlider = document.getElementById('saturationSlider');
  const upscaleCheckbox = document.getElementById('upscaleCheckbox');

  const sharpnessVal = document.getElementById('sharpnessVal');
  const brightnessVal = document.getElementById('brightnessVal');
  const contrastVal = document.getElementById('contrastVal');
  const saturationVal = document.getElementById('saturationVal');

  // Wire up sliders for live feedback & live enhancement
  const sliders = [
    { el: sharpnessSlider, display: sharpnessVal },
    { el: brightnessSlider, display: brightnessVal },
    { el: contrastSlider, display: contrastVal },
    { el: saturationSlider, display: saturationVal },
  ];

  sliders.forEach(({ el, display }) => {
    if (el && display) {
      el.addEventListener('input', () => {
        display.textContent = el.value;
        updateRealtimeEnhancement();
      });
    }
  });

  if (upscaleCheckbox) {
    upscaleCheckbox.addEventListener('change', () => {
      updateRealtimeEnhancement();
    });
  }

  // Reset controls button
  const resetBtn = document.getElementById('resetControlsBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (sharpnessSlider) { sharpnessSlider.value = 0; sharpnessVal.textContent = '0'; }
      if (brightnessSlider) { brightnessSlider.value = 0; brightnessVal.textContent = '0'; }
      if (contrastSlider) { contrastSlider.value = 0; contrastVal.textContent = '0'; }
      if (saturationSlider) { saturationSlider.value = 0; saturationVal.textContent = '0'; }
      if (upscaleCheckbox) { upscaleCheckbox.checked = false; }
      updateRealtimeEnhancement();
    });
  }

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

      // Pre-cache the original Image object
      const img = new Image();
      img.onload = () => {
        cachedOriginalImg = img;
        // Show file info
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

        // Run initial enhancement preview
        updateRealtimeEnhancement();
      };
      img.src = currentDataURL;
    };
    reader.readAsDataURL(currentFile);

    // Expose instance-specific reset function
    window.activeImageReset = () => {
      currentFile = null;
      currentDataURL = null;
      latestEnhancedBlob = null;
      cachedOriginalImg = null;
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

      // Reset sliders
      if (sharpnessSlider) { sharpnessSlider.value = 0; sharpnessVal.textContent = '0'; }
      if (brightnessSlider) { brightnessSlider.value = 0; brightnessVal.textContent = '0'; }
      if (contrastSlider) { contrastSlider.value = 0; contrastVal.textContent = '0'; }
      if (saturationSlider) { saturationSlider.value = 0; saturationVal.textContent = '0'; }
      if (upscaleCheckbox) upscaleCheckbox.checked = false;

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

  // ===== REALTIME ENHANCEMENT =====
  function updateRealtimeEnhancement() {
    if (!currentFile || !currentDataURL || !cachedOriginalImg) return;

    const loader = document.getElementById('enhanceLoadingOverlay');
    if (loader) loader.classList.add('active');

    clearTimeout(enhanceTimeout);
    enhanceTimeout = setTimeout(() => {
      const sharpness = parseInt(sharpnessSlider?.value || 0);
      const brightness = parseInt(brightnessSlider?.value || 0);
      const contrast = parseInt(contrastSlider?.value || 0);
      const saturation = parseInt(saturationSlider?.value || 0);
      const upscale = upscaleCheckbox?.checked || false;

      const img = cachedOriginalImg;
      let w = img.naturalWidth;
      let h = img.naturalHeight;

      if (upscale) {
        w *= 2;
        h *= 2;
      }

      // Working canvas for pixel manipulation
      const workCanvas = document.createElement('canvas');
      workCanvas.width = w;
      workCanvas.height = h;
      const workCtx = workCanvas.getContext('2d');

      // Draw original (upscaled via bilinear interpolation — the canvas default)
      workCtx.imageSmoothingEnabled = true;
      workCtx.imageSmoothingQuality = 'high';
      workCtx.drawImage(img, 0, 0, w, h);

      // Get pixel data for manipulation
      const imageData = workCtx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // --- Apply Brightness ---
      if (brightness !== 0) {
        const b = brightness * 2.55; // map -100..+100 to roughly -255..+255
        for (let i = 0; i < data.length; i += 4) {
          data[i]     = clamp(data[i] + b);
          data[i + 1] = clamp(data[i + 1] + b);
          data[i + 2] = clamp(data[i + 2] + b);
        }
      }

      // --- Apply Contrast ---
      if (contrast !== 0) {
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < data.length; i += 4) {
          data[i]     = clamp(factor * (data[i] - 128) + 128);
          data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
          data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
        }
      }

      // --- Apply Saturation ---
      if (saturation !== 0) {
        const sat = saturation / 100; // -1 to +1
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
          if (sat > 0) {
            // Increase saturation
            data[i]     = clamp(gray + (r - gray) * (1 + sat));
            data[i + 1] = clamp(gray + (g - gray) * (1 + sat));
            data[i + 2] = clamp(gray + (b - gray) * (1 + sat));
          } else {
            // Decrease saturation (lerp toward gray)
            const t = 1 + sat; // 0 to 1
            data[i]     = clamp(gray + (r - gray) * t);
            data[i + 1] = clamp(gray + (g - gray) * t);
            data[i + 2] = clamp(gray + (b - gray) * t);
          }
        }
      }

      // Put modified data back
      workCtx.putImageData(imageData, 0, 0);

      // --- Apply Sharpness (Unsharp Mask via convolution) ---
      if (sharpness > 0) {
        applyUnsharpMask(workCtx, w, h, sharpness);
      }

      // Draw to visible canvas
      const displayCanvas = document.getElementById('enhancedCanvas');
      if (displayCanvas) {
        displayCanvas.width = w;
        displayCanvas.height = h;
        const displayCtx = displayCanvas.getContext('2d');
        displayCtx.drawImage(workCanvas, 0, 0);
      }

      // Update metrics
      const origSizeEl = document.getElementById('metric-original-size');
      const dimsEl = document.getElementById('metric-dimensions');
      const enhDimsEl = document.getElementById('metric-enhanced-dims');

      if (origSizeEl) origSizeEl.textContent = formatBytes(currentFile.size);
      if (dimsEl) dimsEl.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
      if (enhDimsEl) enhDimsEl.textContent = `${w} × ${h}`;

      // Generate blob for download
      workCanvas.toBlob((blob) => {
        if (blob) {
          latestEnhancedBlob = blob;
        }
        if (loader) loader.classList.remove('active');
      }, 'image/png');
    }, 150);
  }

  // ===== UNSHARP MASK (convolution-based sharpening) =====
  function applyUnsharpMask(ctx, w, h, amount) {
    // amount: 0–100, controls intensity of the sharpening
    const strength = amount / 100; // 0.0 – 1.0

    const src = ctx.getImageData(0, 0, w, h);
    const srcData = src.data;

    // Create a blurred copy using a 3×3 Gaussian approximation kernel
    const blurred = new Float32Array(srcData.length);

    // Gaussian-like 3×3 kernel: [1 2 1; 2 4 2; 1 2 1] / 16
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

    // Unsharp mask: result = original + strength * (original - blurred)
    const output = ctx.createImageData(w, h);
    const outData = output.data;
    for (let i = 0; i < srcData.length; i += 4) {
      outData[i]     = clamp(srcData[i]     + strength * (srcData[i]     - blurred[i]));
      outData[i + 1] = clamp(srcData[i + 1] + strength * (srcData[i + 1] - blurred[i + 1]));
      outData[i + 2] = clamp(srcData[i + 2] + strength * (srcData[i + 2] - blurred[i + 2]));
      outData[i + 3] = srcData[i + 3]; // preserve alpha
    }

    ctx.putImageData(output, 0, 0);
  }

  // ===== UTILITY =====
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
        const newName = currentFile.name.replace(/\.[^.]+$/, '') + '-enhanced.png';
        downloadBlob(latestEnhancedBlob, newName);
        showToast('Enhanced image downloaded successfully!');
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
