import { showToast } from '../components/toast.js';
import { downloadBlob, renderDropZone, formatBytes, downloadURL } from '../utils.js';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const COBALT_INSTANCES = [
  'https://cobalt.api.timelessnesses.me/api/json',
  'https://api.cobalt.buss.lol/api/json',
  'https://co.wuk.sh/api/json',
  'https://cobalt-api.pewpew.icu/api/json'
];

const CORS_PROXIES = [
  { name: 'corsproxy', buildUrl: (targetUrl) => `https://corsproxy.io/?${encodeURIComponent(targetUrl)}` },
  { name: 'allorigins', buildUrl: (targetUrl) => `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}` },
  { name: 'codetabs', buildUrl: (targetUrl) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}` }
];

const DEFAULT_FETCH_TIMEOUT_MS = 3500;
const COBALT_FETCH_TIMEOUT_MS = 4000;

// ============================================================================
// TOP-LEVEL DISPATCHER
// ============================================================================

const TOOL_RENDERERS = {
  'spotify-downloader': renderSpotifyDownloader,
  'thumbnail-grabber': renderThumbnailGrabber,
  'tweet-generator': renderTweetGenerator,
  'youtube-tags': renderYouTubeTags,
  'instagram-post': renderInstagramPost,
  'x-image-slicer': renderXImageSlicer,
  'instagram-downloader': renderInstagramDownloader,
  'youtube-downloader': renderYouTubeDownloader,
  'pinterest-downloader': renderPinterestDownloader
};

const TOOL_SETUP_HANDLERS = {
  'spotify-downloader': setupSpotifyDownloader,
  'thumbnail-grabber': setupThumbnailGrabber,
  'tweet-generator': setupTweetGenerator,
  'youtube-tags': setupYouTubeTags,
  'instagram-post': setupInstagramPost,
  'x-image-slicer': setupXImageSlicer,
  'instagram-downloader': setupInstagramDownloader,
  'youtube-downloader': setupYouTubeDownloader,
  'pinterest-downloader': setupPinterestDownloader
};

export function socialToolHandler(tool) {
  setTimeout(() => setupSocialTool(tool.id), 50);
  window.addEventListener('page-rendered', () => setupSocialTool(tool.id), { once: true });

  const renderFn = TOOL_RENDERERS[tool.id];
  return renderFn ? renderFn() : `<p>Tool coming soon!</p>`;
}

export function setupSocialTool(toolId) {
  const setupFn = TOOL_SETUP_HANDLERS[toolId];
  if (typeof setupFn === 'function') {
    setupFn();
  }
}

// ============================================================================
// TEMPLATE RENDERERS
// ============================================================================

function renderThumbnailGrabber() {
  return `
    <div class="form-group">
      <label class="form-label">YouTube Video URL</label>
      <input type="text" class="form-input" id="ytThumbUrl" placeholder="https://www.youtube.com/watch?v=..." />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="ytThumbGrabBtn">🖼️ Grab Thumbnails</button>
    </div>
    <div class="result-area" id="ytThumbResultArea">
      <div id="ytThumbnailGrid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem"></div>
    </div>
  `;
}

function renderTweetGenerator() {
  return `
    <div class="form-row">
      <div class="form-group" style="flex:2">
        <label class="form-label">Display Name</label>
        <input type="text" class="form-input" id="tweetName" value="John Doe" />
      </div>
      <div class="form-group" style="flex:1">
        <label class="form-label">Handle</label>
        <input type="text" class="form-input" id="tweetHandle" value="@johndoe" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Tweet Text</label>
      <textarea class="form-textarea" id="tweetText" placeholder="What's happening?" maxlength="280" style="min-height:80px"></textarea>
      <div id="tweetCharCount" style="text-align:right;font-size:.8rem;color:var(--text-muted)">0/280</div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Likes</label>
        <input type="text" class="form-input" id="tweetLikes" value="1.2K" />
      </div>
      <div class="form-group">
        <label class="form-label">Retweets</label>
        <input type="text" class="form-input" id="tweetRTs" value="342" />
      </div>
      <div class="form-group">
        <label class="form-label">Comments</label>
        <input type="text" class="form-input" id="tweetComments" value="89" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Theme</label>
      <select class="form-select" id="tweetTheme">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="tweetGenerateBtn">🐦 Generate Tweet</button>
      <button class="btn btn-secondary" id="downloadTweetBtn" disabled>📥 Download PNG</button>
    </div>
    <div class="preview-area" id="tweetPreviewArea" style="display:none">
      <h3>Preview</h3>
      <canvas id="tweetCanvas" style="max-width:100%;border-radius:12px"></canvas>
    </div>
  `;
}

function renderYouTubeTags() {
  return `
    <div class="form-group">
      <label class="form-label">YouTube Video URL</label>
      <input type="text" class="form-input" id="ytTagUrl" placeholder="https://www.youtube.com/watch?v=..." />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="ytTagsExtractBtn">🏷️ Extract Tags</button>
    </div>
    <div class="result-area" id="ytTagsResultArea">
      <p style="font-size:.85rem;color:var(--text-muted)">Note: Due to API restrictions, this tool extracts tags from page meta data. Some videos may not expose tags.</p>
      <div id="ytTagsOutput"></div>
    </div>
  `;
}

function renderInstagramPost() {
  return `
    <div class="form-row">
      <div class="form-group" style="flex:2">
        <label class="form-label">Username</label>
        <input type="text" class="form-input" id="igUser" value="photographer" />
      </div>
      <div class="form-group" style="flex:1">
        <label class="form-label">Likes</label>
        <input type="text" class="form-input" id="igLikes" value="4,521" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Caption</label>
      <textarea class="form-textarea" id="igCaption" placeholder="Write your caption..." style="min-height:80px">Beautiful sunset 🌅 #photography #nature</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Background Color</label>
      <input type="color" class="form-input" id="igBgColor" value="#f5f5f5" style="height:40px;padding:2px" />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="igGenerateBtn">📸 Generate Post</button>
      <button class="btn btn-secondary" id="igDownloadBtn" disabled>📥 Download</button>
    </div>
    <div class="preview-area" id="igPreviewArea" style="display:none">
      <canvas id="igCanvas" style="max-width:100%;border-radius:8px"></canvas>
    </div>
  `;
}

function renderXImageSlicer() {
  return `
    ${renderDropZone('xSlicer', '.jpg,.jpeg,.png,.webp', 'Drop your image to slice for X')}
    <div id="xSlicerFileInfoArea"></div>
    <div class="form-group" style="margin-top:1rem">
      <label class="form-label">Grid Layout</label>
      <select class="form-select" id="xGridLayout">
        <option value="2x1">2 parts (2×1)</option>
        <option value="2x2">4 parts (2×2)</option>
        <option value="3x1">3 parts (3×1)</option>
        <option value="3x2">6 parts (3×2)</option>
      </select>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="xSliceBtn" disabled>✂️ Slice & Download All</button>
    </div>
    <div class="preview-area" id="xSlicePreviewArea" style="display:none">
      <h3>Preview</h3>
      <div id="xSliceGrid" style="display:grid;gap:4px"></div>
    </div>
  `;
}

function renderInstagramDownloader() {
  return `
    <div class="form-group">
      <label class="form-label">Instagram Post URL</label>
      <input type="text" class="form-input" id="igDlUrl" placeholder="https://www.instagram.com/p/ABC123/" />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="igDlFetchBtn">📥 Fetch Post</button>
    </div>
    <div class="result-area" id="igDlResultArea">
      <div id="igDlLoading" style="display:none;text-align:center;padding:2rem">
        <div class="spinner-sm" style="width:28px;height:28px;border-width:3px;margin:0 auto 1rem"></div>
        <p style="color:var(--text-muted);font-size:.9rem">Fetching post data...</p>
      </div>
      <div id="igDlResult"></div>
    </div>
    <div style="margin-top:1rem;padding:1rem;background:var(--surface);border-radius:12px;border:1px solid var(--border)">
      <p style="font-size:.8rem;color:var(--text-muted)">💡 <strong>How to use:</strong> Paste the full Instagram post URL and click Fetch Post.</p>
    </div>
  `;
}

function renderYouTubeDownloader() {
  return `
    <div class="form-group">
      <label class="form-label">YouTube Video URL</label>
      <input type="text" class="form-input" id="ytVidUrl" placeholder="https://www.youtube.com/watch?v=..." />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="ytVidFetchBtn">📥 Fetch Video</button>
    </div>
    <div class="result-area" id="ytVidResultArea">
      <div id="ytVidLoading" style="display:none;text-align:center;padding:2rem">
        <div class="spinner-sm" style="width:28px;height:28px;border-width:3px;margin:0 auto 1rem"></div>
        <p style="color:var(--text-muted);font-size:.9rem">Fetching video streams...</p>
      </div>
      <div id="ytVidResult"></div>
    </div>
    <div style="margin-top:1rem;padding:1rem;background:var(--surface);border-radius:12px;border:1px solid var(--border)">
      <p style="font-size:.8rem;color:var(--text-muted);margin-bottom:.4rem">💡 <strong>Note:</strong> Video streams are resolved directly and in high audio/video quality.</p>
      <p style="font-size:.75rem;color:var(--text-muted);opacity:.85">⚠️ <em>Warning: Downloads/fetching may occasionally fail due to YouTube rate limits or IP restrictions.</em></p>
    </div>
  `;
}

function renderPinterestDownloader() {
  return `
    <div class="form-group">
      <label class="form-label">Pinterest Pin URL</label>
      <input type="text" class="form-input" id="pinDlUrl" placeholder="https://www.pinterest.com/pin/123456789/" />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="pinDlFetchBtn">📌 Fetch Image</button>
    </div>
    <div class="result-area" id="pinDlResultArea">
      <div id="pinDlLoading" style="display:none;text-align:center;padding:2rem">
        <div class="spinner-sm" style="width:28px;height:28px;border-width:3px;margin:0 auto 1rem"></div>
        <p style="color:var(--text-muted);font-size:.9rem">Fetching pin data...</p>
      </div>
      <div id="pinDlResult"></div>
    </div>
    <div style="margin-top:1rem;padding:1rem;background:var(--surface);border-radius:12px;border:1px solid var(--border)">
      <p style="font-size:.8rem;color:var(--text-muted)">📌 <strong>How to use:</strong> Paste any Pinterest pin or pin.it URL to download in original native resolution.</p>
    </div>
  `;
}

function renderSpotifyDownloader() {
  return `
    <div class="form-group">
      <label class="form-label">Spotify Playlist, Album, or Track Link</label>
      <div style="display:flex;gap:.5rem">
        <input type="text" class="form-input" id="spotifyUrl" placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M" />
        <button class="btn btn-secondary" id="spotifyPasteBtn" type="button" style="white-space:nowrap" title="Paste from clipboard">📋 Paste</button>
      </div>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="spotifyFetchBtn">🎵 Fetch Playlist Songs</button>
      <button class="btn btn-secondary" id="spotifyDemoBtn" type="button">✨ Try Sample Playlist</button>
    </div>
    <div class="result-area" id="spotifyResultArea">
      <div id="spotifyLoading" style="display:none;text-align:center;padding:2.5rem 1rem">
        <div class="spinner-sm" style="width:32px;height:32px;border-width:3px;margin:0 auto 1rem"></div>
        <p style="color:var(--text-muted);font-size:.95rem">Extracting Spotify metadata & track details...</p>
      </div>
      <div id="spotifyResult"></div>
    </div>
    <div style="margin-top:1.5rem;padding:1.25rem;background:var(--surface);border-radius:12px;border:1px solid var(--border)">
      <h4 style="margin:0 0 .5rem;font-size:.9rem;color:var(--text-main);display:flex;align-items:center;gap:.4rem">
        <span>💡</span> <strong>How to use:</strong>
      </h4>
      <ul style="margin:0;padding-left:1.2rem;font-size:.85rem;color:var(--text-muted);line-height:1.6;margin-bottom:.75rem">
        <li>Paste any public Spotify Playlist, Album, or Track URL and click <strong>Fetch Playlist Songs</strong>.</li>
        <li>Listen to 30-second audio previews directly in your browser.</li>
        <li>Click <strong>Download HQ Song</strong> on any track to download high-quality audio files.</li>
        <li>Use <strong>Download All Tracks</strong> to batch download the playlist.</li>
      </ul>
      <p style="font-size:.75rem;color:var(--text-muted);opacity:.85;line-height:1.4">⚠️ <em>Warning: Downloads/fetching may occasionally fail due to Spotify rate limits or IP restrictions.</em></p>
    </div>
  `;
}

// ============================================================================
// TOOL SETUP CONTROLLERS
// ============================================================================

function setupSpotifyDownloader() {
  const fetchButton = document.getElementById('spotifyFetchBtn');
  const pasteButton = document.getElementById('spotifyPasteBtn');
  const demoButton = document.getElementById('spotifyDemoBtn');
  const inputElement = document.getElementById('spotifyUrl');
  const loadingElement = document.getElementById('spotifyLoading');
  const resultContainer = document.getElementById('spotifyResult');

  if (!inputElement || inputElement.dataset.listenerAttached) return;
  inputElement.dataset.listenerAttached = 'true';

  pasteButton?.addEventListener('click', async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        inputElement.value = clipboardText.trim();
        showToast('Pasted link from clipboard!', 'info');
      }
    } catch {
      showToast('Clipboard access denied. Please paste manually.', 'warning');
    }
  });

  demoButton?.addEventListener('click', () => {
    inputElement.value = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M';
    fetchButton?.click();
  });

  const handleFetchPlaylist = async () => {
    const spotifyUrl = inputElement.value.trim();
    if (!spotifyUrl) {
      showToast('Please enter a Spotify URL', 'error');
      return;
    }

    if (!spotifyUrl.includes('open.spotify.com/')) {
      showToast('Invalid Spotify URL. Must start with open.spotify.com/', 'error');
      return;
    }

    if (loadingElement) loadingElement.style.display = 'block';
    if (resultContainer) resultContainer.innerHTML = '';
    if (fetchButton) fetchButton.disabled = true;

    try {
      const response = await fetch(`/api/spotify-info?url=${encodeURIComponent(spotifyUrl)}`);
      const payload = await response.json();

      if (!response.ok || payload.error) {
        throw new Error(payload.error || 'Failed to fetch Spotify details.');
      }

      renderSpotifyResult(payload, resultContainer);
      showToast(`Loaded "${payload.title}" with ${payload.totalTracks} track(s)!`, 'success');
    } catch (error) {
      console.error('Spotify Fetch Error:', error);
      if (resultContainer) {
        resultContainer.innerHTML = renderErrorCard(
          error.message,
          'Make sure the Spotify playlist or track is public and the link is correct.'
        );
      }
      showToast(error.message, 'error');
    } finally {
      if (loadingElement) loadingElement.style.display = 'none';
      if (fetchButton) fetchButton.disabled = false;
    }
  };

  fetchButton?.addEventListener('click', handleFetchPlaylist);
  attachEnterKeyHandler(inputElement, handleFetchPlaylist);
}

function setupThumbnailGrabber() {
  const resultGrid = document.getElementById('ytThumbnailGrid');
  const grabButton = document.getElementById('ytThumbGrabBtn');
  const inputElement = document.getElementById('ytThumbUrl');
  const resultArea = document.getElementById('ytThumbResultArea');

  if (grabButton && !grabButton.dataset.listenerAttached) {
    grabButton.dataset.listenerAttached = 'true';

    const handleGrabThumbnails = () => {
      const url = inputElement?.value.trim();
      if (!url) {
        showToast('Please enter a YouTube URL', 'error');
        return;
      }
      const videoId = extractYouTubeId(url);
      if (!videoId) {
        showToast('Invalid YouTube URL', 'error');
        return;
      }

      const thumbnailResolutions = [
        { label: 'Max Resolution', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
        { label: 'Standard', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
        { label: 'High Quality', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
        { label: 'Medium', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
        { label: 'Default', url: `https://img.youtube.com/vi/${videoId}/default.jpg` }
      ];

      if (resultGrid && resultArea) {
        resultArea.classList.add('visible');
        resultGrid.innerHTML = thumbnailResolutions.map((res) => `
          <div class="thumbnail-card" style="background:var(--surface);border-radius:12px;overflow:hidden;border:1px solid var(--border)">
            <img src="${escapeHtml(res.url)}" alt="${escapeHtml(res.label)}" style="width:100%;display:block" onerror="this.style.display='none'" />
            <div style="padding:.75rem">
              <div style="font-size:.85rem;font-weight:600;margin-bottom:.5rem">${escapeHtml(res.label)}</div>
              <button data-url="${escapeHtml(res.url)}" data-filename="${videoId}-${res.label.toLowerCase().replace(/\s+/g, '-')}.jpg" class="btn btn-secondary download-thumb-btn" style="font-size:.8rem;padding:.35rem .75rem">📥 Download</button>
            </div>
          </div>
        `).join('');
      }
      showToast('Thumbnails loaded!');
    };

    grabButton.addEventListener('click', handleGrabThumbnails);
    attachEnterKeyHandler(inputElement, handleGrabThumbnails);
  }

  if (resultGrid && !resultGrid.dataset.listenerAttached) {
    resultGrid.dataset.listenerAttached = 'true';
    resultGrid.addEventListener('click', async (event) => {
      const button = event.target.closest('.download-thumb-btn');
      if (!button) return;

      const imageUrl = button.getAttribute('data-url');
      const filename = button.getAttribute('data-filename') || 'thumbnail.jpg';
      if (!imageUrl) return;

      const originalHtml = button.innerHTML;
      button.innerHTML = '<span class="spinner-sm" style="width:12px;height:12px;border-width:2px;display:inline-block;margin-right:4px"></span>Fetching...';
      button.disabled = true;

      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
        await downloadMediaBlobWithFallback(imageUrl, proxyUrl, filename);
        showToast('Download started!');
      } catch (error) {
        console.error('Failed to download thumbnail', error);
        showToast('Opening image in new tab...', 'warning');
        window.open(imageUrl, '_blank');
      } finally {
        button.innerHTML = originalHtml;
        button.disabled = false;
      }
    });
  }
}

function setupTweetGenerator() {
  const textareaElement = document.getElementById('tweetText');
  const counterElement = document.getElementById('tweetCharCount');
  const generateButton = document.getElementById('tweetGenerateBtn');
  const downloadButton = document.getElementById('downloadTweetBtn');

  if (textareaElement && !textareaElement.dataset.listenerAttached) {
    textareaElement.dataset.listenerAttached = 'true';
    textareaElement.addEventListener('input', () => {
      if (counterElement) counterElement.textContent = `${textareaElement.value.length}/280`;
    });
  }

  if (generateButton && !generateButton.dataset.listenerAttached) {
    generateButton.dataset.listenerAttached = 'true';
    generateButton.addEventListener('click', () => {
      const canvas = document.getElementById('tweetCanvas');
      const previewArea = document.getElementById('tweetPreviewArea');
      if (!canvas || !previewArea) return;
      previewArea.style.display = '';

      const displayName = document.getElementById('tweetName')?.value || 'User';
      const handle = document.getElementById('tweetHandle')?.value || '@user';
      const text = document.getElementById('tweetText')?.value || '';
      const likesCount = document.getElementById('tweetLikes')?.value || '0';
      const retweetsCount = document.getElementById('tweetRTs')?.value || '0';
      const commentsCount = document.getElementById('tweetComments')?.value || '0';
      const theme = document.getElementById('tweetTheme')?.value || 'dark';

      renderTweetCanvas(canvas, {
        displayName,
        handle,
        text,
        likesCount,
        retweetsCount,
        commentsCount,
        isDark: theme === 'dark'
      });

      if (downloadButton) downloadButton.disabled = false;
      showToast('Tweet generated!');
    });
  }

  if (downloadButton && !downloadButton.dataset.listenerAttached) {
    downloadButton.dataset.listenerAttached = 'true';
    downloadButton.addEventListener('click', () => {
      const canvas = document.getElementById('tweetCanvas');
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, 'tweet.png');
      }, 'image/png');
    });
  }
}

function renderTweetCanvas(canvas, options) {
  const { displayName, handle, text, likesCount, retweetsCount, commentsCount, isDark } = options;
  const backgroundColor = isDark ? '#15202b' : '#ffffff';
  const primaryTextColor = isDark ? '#ffffff' : '#0f1419';
  const mutedTextColor = isDark ? '#8899a6' : '#536471';

  canvas.width = 550;
  canvas.height = 280;
  const context = canvas.getContext('2d');

  // Background
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, 550, 280);

  // Avatar Icon Circle
  context.fillStyle = '#1da1f2';
  context.beginPath();
  context.arc(40, 45, 22, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#fff';
  context.font = 'bold 18px sans-serif';
  context.textAlign = 'center';
  context.fillText(displayName[0]?.toUpperCase() || 'U', 40, 51);

  // Name & Handle
  context.textAlign = 'left';
  context.fillStyle = primaryTextColor;
  context.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  context.fillText(displayName, 72, 38);

  context.fillStyle = mutedTextColor;
  context.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  context.fillText(handle, 72, 56);

  // Main Tweet Text
  context.fillStyle = primaryTextColor;
  context.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  wrapCanvasText(context, text, 20, 95, 510, 22);

  // Engagement Counts
  const statsYCoordinate = 235;
  context.fillStyle = mutedTextColor;
  context.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  context.fillText(`💬 ${commentsCount}`, 20, statsYCoordinate);
  context.fillText(`🔁 ${retweetsCount}`, 150, statsYCoordinate);
  context.fillText(`❤️ ${likesCount}`, 280, statsYCoordinate);

  // Outline Border
  context.strokeStyle = isDark ? '#38444d' : '#e1e8ed';
  context.lineWidth = 1;
  context.strokeRect(0.5, 0.5, 549, 279);
}

function setupYouTubeTags() {
  const extractButton = document.getElementById('ytTagsExtractBtn');
  const inputElement = document.getElementById('ytTagUrl');
  const outputContainer = document.getElementById('ytTagsOutput');
  const resultArea = document.getElementById('ytTagsResultArea');

  if (!extractButton || extractButton.dataset.listenerAttached) return;
  extractButton.dataset.listenerAttached = 'true';

  const handleExtractTags = async () => {
    const videoUrl = inputElement?.value.trim();
    if (!videoUrl) {
      showToast('Please enter a URL', 'error');
      return;
    }
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      showToast('Invalid YouTube URL', 'error');
      return;
    }

    if (outputContainer && resultArea) {
      resultArea.classList.add('visible');
      outputContainer.innerHTML = `
        <div style="padding:1rem;background:var(--surface);border-radius:8px;border:1px solid var(--border)">
          <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:.75rem">
            ⓘ Due to YouTube API restrictions, full tag indexing is restricted. Video metadata for <strong>${escapeHtml(videoId)}</strong>:
          </p>
          <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
            <img src="https://img.youtube.com/vi/${escapeHtml(videoId)}/mqdefault.jpg" alt="Thumbnail" style="border-radius:8px;max-width:180px" />
            <div>
              <p style="font-size:.9rem;font-weight:600">Video ID: ${escapeHtml(videoId)}</p>
              <a href="https://www.youtube.com/watch?v=${escapeHtml(videoId)}" target="_blank" rel="noopener noreferrer" style="color:var(--primary);font-size:.85rem">Open on YouTube →</a>
            </div>
          </div>
        </div>
      `;
    }
  };

  extractButton.addEventListener('click', handleExtractTags);
  attachEnterKeyHandler(inputElement, handleExtractTags);
}

function setupInstagramPost() {
  const generateButton = document.getElementById('igGenerateBtn');
  const downloadButton = document.getElementById('igDownloadBtn');

  if (generateButton && !generateButton.dataset.listenerAttached) {
    generateButton.dataset.listenerAttached = 'true';
    generateButton.addEventListener('click', () => {
      const canvas = document.getElementById('igCanvas');
      const previewArea = document.getElementById('igPreviewArea');
      if (!canvas || !previewArea) return;
      previewArea.style.display = '';

      const username = document.getElementById('igUser')?.value || 'user';
      const likesCount = document.getElementById('igLikes')?.value || '0';
      const caption = document.getElementById('igCaption')?.value || '';
      const backgroundColor = document.getElementById('igBgColor')?.value || '#f5f5f5';

      renderInstagramPostCanvas(canvas, { username, likesCount, caption, backgroundColor });

      if (downloadButton) downloadButton.disabled = false;
      showToast('Instagram post generated!');
    });
  }

  if (downloadButton && !downloadButton.dataset.listenerAttached) {
    downloadButton.dataset.listenerAttached = 'true';
    downloadButton.addEventListener('click', () => {
      const canvas = document.getElementById('igCanvas');
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, 'instagram-post.png');
      }, 'image/png');
    });
  }
}

function renderInstagramPostCanvas(canvas, options) {
  const { username, likesCount, caption, backgroundColor } = options;
  canvas.width = 400;
  canvas.height = 500;
  const context = canvas.getContext('2d');

  // Background
  context.fillStyle = '#fff';
  context.fillRect(0, 0, 400, 500);

  // Header
  context.fillStyle = '#fafafa';
  context.fillRect(0, 0, 400, 50);
  context.fillStyle = '#262626';
  context.font = 'bold 14px -apple-system, sans-serif';
  context.fillText(username, 50, 30);

  // Avatar
  context.fillStyle = '#c13584';
  context.beginPath();
  context.arc(24, 25, 16, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#fff';
  context.font = 'bold 14px sans-serif';
  context.textAlign = 'center';
  context.fillText(username[0]?.toUpperCase() || 'U', 24, 30);
  context.textAlign = 'left';

  // Photo Area
  context.fillStyle = backgroundColor;
  context.fillRect(0, 50, 400, 300);

  context.fillStyle = '#262626';
  context.font = '22px -apple-system, sans-serif';
  context.textAlign = 'center';
  context.fillText('📷', 200, 210);
  context.textAlign = 'left';

  // Interaction Icons
  const iconsY = 365;
  context.font = '20px sans-serif';
  context.fillText('♡', 14, iconsY);
  context.fillText('💬', 44, iconsY);
  context.fillText('📤', 74, iconsY);

  // Likes Counter
  context.fillStyle = '#262626';
  context.font = 'bold 13px -apple-system, sans-serif';
  context.fillText(`${likesCount} likes`, 14, iconsY + 22);

  // Caption Text
  context.font = '13px -apple-system, sans-serif';
  context.fillStyle = '#262626';
  wrapCanvasText(context, `${username}  ${caption}`, 14, iconsY + 42, 370, 18);
}

function setupXImageSlicer() {
  let loadedFileDataUrl = null;

  const dropZone = document.getElementById('xSlicer');
  const fileInput = document.getElementById('xSlicerInput');
  const sliceButton = document.getElementById('xSliceBtn');
  const infoArea = document.getElementById('xSlicerFileInfoArea');
  const previewArea = document.getElementById('xSlicePreviewArea');
  const gridContainer = document.getElementById('xSliceGrid');

  if (dropZone && fileInput && !dropZone.dataset.listenerAttached) {
    dropZone.dataset.listenerAttached = 'true';

    ['dragover', 'dragenter'].forEach((eventName) =>
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.add('drag-over');
      })
    );

    ['dragleave', 'drop'].forEach((eventName) =>
      dropZone.addEventListener(eventName, (event) => {
        event.stopPropagation();
        dropZone.classList.remove('drag-over');
      })
    );

    const handleFileSelection = (files) => {
      const selectedFile = files[0];
      if (!selectedFile) return;
      dropZone.style.display = 'none';

      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        loadedFileDataUrl = event.target.result;
        if (sliceButton) sliceButton.disabled = false;
        if (infoArea) {
          infoArea.innerHTML = `
            <div class="file-info">
              <div class="file-info-icon">📄</div>
              <div class="file-info-details">
                <div class="file-info-name">${escapeHtml(selectedFile.name)}</div>
                <div class="file-info-size">${formatBytes(selectedFile.size)}</div>
              </div>
              <button class="file-info-remove" type="button" aria-label="Remove File">&times;</button>
            </div>`;
        }
      };
      fileReader.readAsDataURL(selectedFile);
    };

    dropZone.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer.files.length) handleFileSelection(event.dataTransfer.files);
    });

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fileInput.click();
      }
    });

    fileInput.addEventListener('click', (event) => event.stopPropagation());
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) handleFileSelection(fileInput.files);
    });

    infoArea?.addEventListener('click', (event) => {
      if (!event.target.closest('.file-info-remove')) return;
      loadedFileDataUrl = null;
      if (fileInput) fileInput.value = '';
      if (infoArea) infoArea.innerHTML = '';
      if (previewArea) previewArea.style.display = 'none';
      if (gridContainer) gridContainer.innerHTML = '';
      if (sliceButton) sliceButton.disabled = true;
      if (dropZone) dropZone.style.display = 'flex';
    });
  }

  if (sliceButton && !sliceButton.dataset.listenerAttached) {
    sliceButton.dataset.listenerAttached = 'true';
    sliceButton.addEventListener('click', async () => {
      if (!loadedFileDataUrl) return;
      const gridLayout = document.getElementById('xGridLayout')?.value || '2x2';
      const [columns, rows] = gridLayout.split('x').map(Number);

      const sourceImage = await loadImage(loadedFileDataUrl);
      const sliceWidth = Math.floor(sourceImage.width / columns);
      const sliceHeight = Math.floor(sourceImage.height / rows);

      if (gridContainer && previewArea) {
        previewArea.style.display = '';
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        gridContainer.innerHTML = '';

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < columns; col++) {
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = sliceWidth;
            sliceCanvas.height = sliceHeight;
            const sliceContext = sliceCanvas.getContext('2d');

            sliceContext.drawImage(
              sourceImage,
              col * sliceWidth,
              row * sliceHeight,
              sliceWidth,
              sliceHeight,
              0,
              0,
              sliceWidth,
              sliceHeight
            );

            sliceCanvas.style.width = '100%';
            sliceCanvas.style.borderRadius = '8px';
            gridContainer.appendChild(sliceCanvas);

            sliceCanvas.toBlob((blob) => {
              if (blob) downloadBlob(blob, `slice-${row + 1}-${col + 1}.png`);
            }, 'image/png');
          }
        }
      }
      showToast(`Sliced into ${columns * rows} parts!`);
    });
  }
}

function setupInstagramDownloader() {
  const fetchButton = document.getElementById('igDlFetchBtn');
  const inputElement = document.getElementById('igDlUrl');
  const loadingElement = document.getElementById('igDlLoading');
  const resultContainer = document.getElementById('igDlResult');
  const resultArea = document.getElementById('igDlResultArea');

  if (!fetchButton || fetchButton.dataset.listenerAttached) return;
  fetchButton.dataset.listenerAttached = 'true';

  const handleFetchInstagramPost = async () => {
    const postUrl = inputElement?.value.trim();
    if (!postUrl) {
      showToast('Please enter an Instagram URL', 'error');
      return;
    }

    const shortcode = extractInstagramShortcode(postUrl);
    if (!shortcode) {
      showToast('Invalid Instagram URL. Format: instagram.com/p/SHORTCODE/', 'error');
      return;
    }

    if (loadingElement) loadingElement.style.display = '';
    if (resultContainer) resultContainer.innerHTML = '';
    if (resultArea) resultArea.classList.add('visible');

    fetchButton.disabled = true;
    fetchButton.innerHTML = '<span class="spinner-sm"></span> Fetching...';

    try {
      const response = await fetch(`/api/instagram?shortcode=${encodeURIComponent(shortcode)}&mode=info`);
      if (!response.ok) throw new Error('Failed to fetch post. It may be private or unavailable.');

      const data = await response.json();
      const mediaItems = data.media || [];
      if (mediaItems.length === 0) throw new Error('No photos or videos found in this post.');

      if (loadingElement) loadingElement.style.display = 'none';
      if (resultContainer) {
        renderInstagramMediaResults(resultContainer, mediaItems, shortcode);
      }
      showToast(`Fetched ${mediaItems.length} item(s) successfully!`);
    } catch (primaryError) {
      // Fallback single image render
      try {
        const singleImageUrl = `/api/instagram?shortcode=${encodeURIComponent(shortcode)}`;
        if (loadingElement) loadingElement.style.display = 'none';
        if (resultContainer) {
          resultContainer.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem">
              <span style="font-size:.95rem;font-weight:700;color:var(--text-primary)">✅ Photo fetched successfully</span>
            </div>
            <div class="ig-preview-grid" style="max-width:320px;margin:0 auto">
              <div class="ig-media-card">
                <div class="ig-card-header"><span>🖼️ Photo 1 of 1</span></div>
                <div class="ig-media-thumb">
                  <img src="${escapeHtml(singleImageUrl)}" alt="Photo 1" style="max-height:180px;width:100%;object-fit:cover;border-radius:8px;display:block" />
                </div>
                <div class="ig-card-actions">
                  <button class="btn btn-primary id-single-dl" style="flex:1;font-size:0.8rem;padding:0.4rem 0.6rem">📥 Download</button>
                  <a href="${escapeHtml(singleImageUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size:0.8rem;padding:0.4rem 0.6rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center">🔗 Full</a>
                </div>
              </div>
            </div>
          `;
          resultContainer.querySelector('.id-single-dl')?.addEventListener('click', () => {
            downloadURL(`${singleImageUrl}&download=1`, `instagram-${shortcode}.jpg`);
            showToast('Download started!');
          });
        }
        showToast('Image fetched successfully!');
      } catch {
        if (loadingElement) loadingElement.style.display = 'none';
        if (resultContainer) {
          resultContainer.innerHTML = renderErrorCard(primaryError.message, 'Make sure the post is public and the URL is correct.');
        }
        showToast(`Error: ${primaryError.message}`, 'error');
      }
    } finally {
      fetchButton.disabled = false;
      fetchButton.innerHTML = '📥 Fetch Post';
    }
  };

  fetchButton.addEventListener('click', handleFetchInstagramPost);
  attachEnterKeyHandler(inputElement, handleFetchInstagramPost);
}

function renderInstagramMediaResults(container, mediaItems, shortcode) {
  const count = mediaItems.length;
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem">
      <span style="font-size:.95rem;font-weight:700;color:var(--text-primary)">
        ✅ Found ${count} ${count === 1 ? 'media item' : 'photos / videos'} in this post
      </span>
      ${count > 1 ? `
        <button class="btn btn-primary" id="igDownloadAllBtn" style="font-size:0.85rem;padding:0.45rem 1rem">
          📦 Download All (${count})
        </button>
      ` : ''}
    </div>
    <div class="ig-preview-grid">
      ${mediaItems.map((item, index) => `
        <div class="ig-media-card">
          <div class="ig-card-header">
            <span>${item.type === 'video' ? '🎥 Video' : '🖼️ Photo'} ${index + 1} of ${count}</span>
          </div>
          <div class="ig-media-thumb">
            ${item.type === 'video' ? `
              <video src="${escapeHtml(item.proxyUrl)}" controls style="max-height:180px;width:100%;object-fit:contain;border-radius:8px;display:block"></video>
            ` : `
              <img src="${escapeHtml(item.proxyUrl)}" alt="Photo ${index + 1}" style="max-height:180px;width:100%;object-fit:cover;border-radius:8px;display:block" onerror="this.onerror=null;this.src='${escapeHtml(item.originalUrl || '')}'" />
            `}
          </div>
          <div class="ig-card-actions">
            <button class="btn btn-primary ig-dl-item-btn" data-url="${escapeHtml(item.proxyUrl)}&download=1" data-filename="instagram-${escapeHtml(shortcode)}-${index + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}" style="flex:1;font-size:0.8rem;padding:0.4rem 0.6rem">
              📥 Download
            </button>
            <a href="${escapeHtml(item.proxyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size:0.8rem;padding:0.4rem 0.6rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center">
              🔗 Full
            </a>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.ig-dl-item-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const downloadTarget = event.currentTarget.getAttribute('data-url');
      const filename = event.currentTarget.getAttribute('data-filename') || 'instagram-media.jpg';
      if (downloadTarget) {
        downloadURL(downloadTarget, filename);
        showToast('Download started!');
      }
    });
  });

  document.getElementById('igDownloadAllBtn')?.addEventListener('click', async () => {
    showToast(`Downloading all ${count} items...`);
    for (let index = 0; index < mediaItems.length; index++) {
      const media = mediaItems[index];
      const downloadUrl = `${media.proxyUrl}&download=1`;
      const filename = `instagram-${shortcode}-${index + 1}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
      downloadURL(downloadUrl, filename);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  });
}

function setupYouTubeDownloader() {
  const fetchButton = document.getElementById('ytVidFetchBtn');
  const inputElement = document.getElementById('ytVidUrl');
  const loadingElement = document.getElementById('ytVidLoading');
  const resultContainer = document.getElementById('ytVidResult');
  const resultArea = document.getElementById('ytVidResultArea');

  if (!fetchButton || fetchButton.dataset.listenerAttached) return;
  fetchButton.dataset.listenerAttached = 'true';

  const handleFetchYouTubeVideo = async () => {
    const videoUrl = inputElement?.value.trim();
    if (!videoUrl) {
      showToast('Please enter a YouTube URL', 'error');
      return;
    }

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      showToast('Invalid YouTube URL', 'error');
      return;
    }

    if (loadingElement) loadingElement.style.display = '';
    if (resultContainer) resultContainer.innerHTML = '';
    if (resultArea) resultArea.classList.add('visible');

    fetchButton.disabled = true;
    fetchButton.innerHTML = '<span class="spinner-sm"></span> Fetching...';

    try {
      const embedResponse = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`);
      const embedData = await embedResponse.json();
      if (embedData.error) throw new Error('Video not found or is private.');

      if (loadingElement) loadingElement.style.display = 'none';

      const hdThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const videoTitle = embedData.title || 'YouTube Video';
      renderYouTubeDownloadOptions(resultContainer, videoUrl, videoTitle, hdThumbnail, embedData.thumbnail_url);
      showToast('Video options loaded!');
    } catch (error) {
      if (loadingElement) loadingElement.style.display = 'none';
      if (resultContainer) {
        resultContainer.innerHTML = renderErrorCard(error.message, 'Make sure the video is public and valid.');
      }
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      fetchButton.disabled = false;
      fetchButton.innerHTML = '📥 Fetch Video';
    }
  };

  fetchButton.addEventListener('click', handleFetchYouTubeVideo);
  attachEnterKeyHandler(inputElement, handleFetchYouTubeVideo);
}

function renderYouTubeDownloadOptions(container, videoUrl, videoTitle, hdThumbnail, fallbackThumbnail) {
  const videoQualities = ['1080', '720', '480', '360'];

  const videoOptionsHtml = videoQualities.map((quality) => `
    <button class="btn btn-primary yt-dl-btn" data-url="${escapeHtml(videoUrl)}" data-quality="${quality}" data-audio="false"
       style="display:flex;flex-direction:column;align-items:center;padding:0.75rem;font-size:0.8rem;border:none;cursor:pointer">
      <span style="font-size:1rem;font-weight:600;margin-bottom:0.15rem">${quality}p</span>
      <span style="opacity:0.8;font-size:0.75rem">MP4</span>
    </button>
  `).join('');

  const audioOptionsHtml = `
    <button class="btn btn-secondary yt-dl-btn" data-url="${escapeHtml(videoUrl)}" data-quality="128" data-audio="true"
       style="display:flex;flex-direction:column;align-items:center;padding:0.75rem;font-size:0.8rem;background:var(--surface);border:1px solid var(--border);cursor:pointer">
      <span style="font-size:1rem;font-weight:600;margin-bottom:0.15rem">Standard</span>
      <span style="opacity:0.8;font-size:0.75rem">MP3</span>
    </button>
  `;

  container.innerHTML = `
    <div style="max-width:600px;margin:0 auto">
      <div style="background:var(--surface);border-radius:12px;overflow:hidden;border:1px solid var(--border);display:flex;flex-direction:column;gap:1.5rem;padding-bottom:1.5rem">
        <div>
          <img src="${escapeHtml(hdThumbnail)}" alt="Thumbnail" style="width:100%;display:block;max-height:300px;object-fit:cover;border-bottom:1px solid var(--border)" onerror="this.src='${escapeHtml(fallbackThumbnail || '')}'"/>
          <div style="padding:1.5rem 1rem 0 1rem;text-align:center">
            <h3 style="margin:0;font-size:1.1rem;color:var(--text)">${escapeHtml(videoTitle)}</h3>
          </div>
        </div>

        <div style="padding:0 1rem;">
          <h4 style="margin:0 0 0.75rem 0;font-size:0.9rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Video Downloader (MP4)</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:0.75rem">
            ${videoOptionsHtml}
          </div>
        </div>

        <div style="padding:0 1rem;">
          <h4 style="margin:0 0 0.75rem 0;font-size:0.9rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Audio Only</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:0.75rem">
            ${audioOptionsHtml}
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.yt-dl-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const clickedButton = event.currentTarget;
      const originalButtonHtml = clickedButton.innerHTML;
      clickedButton.innerHTML = '<span class="spinner-sm" style="width:14px;height:14px;border-width:2px;margin-bottom:0.15rem;display:inline-block"></span><span style="opacity:0.8;font-size:0.75rem">Generating...</span>';
      clickedButton.disabled = true;

      try {
        const targetUrl = clickedButton.getAttribute('data-url');
        const quality = clickedButton.getAttribute('data-quality');
        const isAudioOnly = clickedButton.getAttribute('data-audio') === 'true';

        const downloadStreamUrl = await fetchMediaFromCobalt({
          url: targetUrl,
          vQuality: quality,
          isAudioOnly,
          filenamePattern: 'classic',
          disableMetadata: true
        });

        if (downloadStreamUrl) {
          const extension = isAudioOnly ? 'mp3' : 'mp4';
          const filename = videoTitle
            ? `${videoTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${extension}`
            : `youtube-video.${extension}`;

          downloadURL(downloadStreamUrl, filename);
          setTimeout(() => {
            clickedButton.innerHTML = originalButtonHtml;
            clickedButton.disabled = false;
          }, 2000);
          showToast('Download started automatically!');
        } else {
          throw new Error('Unable to generate download stream link at this time.');
        }
      } catch (err) {
        clickedButton.innerHTML = originalButtonHtml;
        clickedButton.disabled = false;
        showToast(err.message, 'error');
      }
    });
  });
}

function setupPinterestDownloader() {
  const fetchButton = document.getElementById('pinDlFetchBtn');
  const inputElement = document.getElementById('pinDlUrl');
  const loadingElement = document.getElementById('pinDlLoading');
  const resultContainer = document.getElementById('pinDlResult');
  const resultArea = document.getElementById('pinDlResultArea');

  if (!fetchButton || fetchButton.dataset.listenerAttached) return;
  fetchButton.dataset.listenerAttached = 'true';

  const handleFetchPinterestImage = async () => {
    const pinUrl = inputElement?.value.trim();
    if (!pinUrl) {
      showToast('Please enter a Pinterest URL', 'error');
      return;
    }

    if (!pinUrl.includes('pinterest.com') && !pinUrl.includes('pin.it')) {
      showToast('Invalid Pinterest URL. Use pinterest.com/pin/... or pin.it/...', 'error');
      return;
    }

    if (loadingElement) loadingElement.style.display = '';
    if (resultContainer) resultContainer.innerHTML = '';
    if (resultArea) resultArea.classList.add('visible');

    fetchButton.disabled = true;
    fetchButton.innerHTML = '<span class="spinner-sm"></span> Fetching...';

    try {
      const response = await fetch(`/api/pinterest?url=${encodeURIComponent(pinUrl)}&mode=info`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch pin. It may be private or invalid.');
      }

      const payload = await response.json();
      if (!payload.images || payload.images.length === 0) {
        throw new Error('No images found for this pin.');
      }

      if (loadingElement) loadingElement.style.display = 'none';
      renderPinterestResults(resultContainer, payload.images, pinUrl);
      showToast(`Found ${payload.images.length} image(s) in native resolution!`);
    } catch (error) {
      if (loadingElement) loadingElement.style.display = 'none';
      if (resultContainer) {
        resultContainer.innerHTML = renderErrorCard(error.message, 'Make sure the pin is public and the URL is correct.');
      }
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      fetchButton.disabled = false;
      fetchButton.innerHTML = '📌 Fetch Image';
    }
  };

  fetchButton.addEventListener('click', handleFetchPinterestImage);
  attachEnterKeyHandler(inputElement, handleFetchPinterestImage);
}

function renderPinterestResults(container, images, pinUrl) {
  const uniqueImages = images.slice(0, 6);
  const imagesHtml = uniqueImages.map((image, index) => `
    <div style="background:var(--surface);border-radius:12px;overflow:hidden;border:1px solid var(--border);display:flex;flex-direction:column">
      <div style="position:relative;overflow:hidden;background:#0a0a0a;display:flex;align-items:center;justify-content:center;min-height:180px">
        <img src="${escapeHtml(image.url)}" alt="Pinterest Image ${index + 1}" style="width:100%;display:block;object-fit:contain;max-height:400px" onerror="this.parentElement.innerHTML='<p style=color:var(--text-muted);padding:2rem;text-align:center>Image unavailable</p>'" />
        <div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.7);color:#fff;padding:2px 8px;border-radius:6px;font-size:.7rem;backdrop-filter:blur(8px)">${escapeHtml(image.label || `Image ${index + 1}`)}</div>
      </div>
      <div style="padding:.75rem;display:flex;gap:.5rem">
        <button class="btn btn-primary pin-download-btn" data-url="${escapeHtml(image.url)}" data-index="${index}" style="flex:1;text-align:center;font-size:.85rem">📥 Download</button>
        <button class="btn btn-secondary pin-open-btn" data-url="${escapeHtml(image.url)}" style="font-size:.85rem;padding:.35rem .75rem">🔗</button>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div style="margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
      <span style="font-size:.9rem;font-weight:600;color:var(--text)">✅ Found ${images.length} image(s) (native resolution)</span>
      ${images.length > 1 ? '<button class="btn btn-primary" id="pinDownloadAll" style="font-size:.8rem;padding:.4rem 1rem">📥 Download All</button>' : ''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem">
      ${imagesHtml}
    </div>
  `;

  container.querySelectorAll('.pin-download-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const clickedBtn = event.currentTarget;
      const imageUrl = clickedBtn.getAttribute('data-url');
      const index = clickedBtn.getAttribute('data-index') || '0';
      const originalHtml = clickedBtn.innerHTML;

      clickedBtn.innerHTML = '<span class="spinner-sm" style="width:12px;height:12px;border-width:2px;display:inline-block;margin-right:4px"></span>Downloading...';
      clickedBtn.disabled = true;

      try {
        const proxyUrl = `/api/pinterest?url=${encodeURIComponent(pinUrl)}&download=1`;
        await downloadMediaBlobWithFallback(imageUrl, proxyUrl, `pinterest-image-${parseInt(index, 10) + 1}.jpg`);
        showToast('Download started!');
      } catch {
        showToast('Opening image in new tab...', 'warning');
        window.open(imageUrl, '_blank');
      } finally {
        clickedBtn.innerHTML = originalHtml;
        clickedBtn.disabled = false;
      }
    });
  });

  container.querySelectorAll('.pin-open-btn').forEach((button) => {
    button.addEventListener('click', () => {
      window.open(button.getAttribute('data-url'), '_blank');
    });
  });

  document.getElementById('pinDownloadAll')?.addEventListener('click', async () => {
    const allButtons = container.querySelectorAll('.pin-download-btn');
    for (const btn of allButtons) {
      btn.click();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  });
}

// ============================================================================
// SPOTIFY RENDERERS & TRACK DOWNLOADER
// ============================================================================

function renderSpotifyResult(data, container) {
  const tracks = data.tracks || [];

  container.innerHTML = `
    <div class="spotify-hero-card">
      <img src="${escapeHtml(data.coverArt) || 'https://open.spotify.com/favicon.ico'}" alt="${escapeHtml(data.title)}" class="spotify-cover-img" />
      <div class="spotify-hero-details">
        <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
          <span class="spotify-badge">Spotify ${escapeHtml(data.type ? data.type.toUpperCase() : 'MEDIA')}</span>
          <span class="spotify-quality-tag">⚡ High-Quality Audio</span>
        </div>
        <h2 class="spotify-title">${escapeHtml(data.title)}</h2>
        <p class="spotify-subtitle">${escapeHtml(data.subtitle)} • ${data.totalTracks} ${data.totalTracks === 1 ? 'Track' : 'Tracks'}</p>
        <div class="spotify-actions">
          <button class="btn btn-success" id="downloadAllTracksBtn">
            ⚡ Download All Tracks (${data.totalTracks})
          </button>
          <div class="spotify-search-box">
            <input type="text" id="trackFilterInput" class="form-input" placeholder="🔍 Search songs in playlist..." style="padding:.45rem .8rem;font-size:.85rem;min-width:200px" />
          </div>
        </div>
      </div>
    </div>

    <div class="spotify-tracklist-header">
      <span style="width:28px;text-align:center">#</span>
      <span>Song & Artist</span>
      <span class="track-col-duration" style="text-align:center">Duration</span>
      <span class="track-col-preview" style="text-align:center">30s Preview</span>
      <span style="text-align:right">Action</span>
    </div>

    <div class="spotify-tracklist" id="spotifyTrackList">
      ${renderTrackRows(tracks)}
    </div>
  `;

  const filterInput = container.querySelector('#trackFilterInput');
  filterInput?.addEventListener('input', (event) => {
    const searchQuery = event.target.value.toLowerCase().trim();
    const filteredTracks = tracks.filter((track) =>
      (track.title || '').toLowerCase().includes(searchQuery) ||
      (track.artist || '').toLowerCase().includes(searchQuery)
    );
    const trackListEl = container.querySelector('#spotifyTrackList');
    if (trackListEl) trackListEl.innerHTML = renderTrackRows(filteredTracks);
  });

  container.addEventListener('click', async (event) => {
    const downloadButton = event.target.closest('.download-single-track-btn');
    if (!downloadButton) return;

    const trackTitle = downloadButton.getAttribute('data-title') || 'Track';
    const artistName = downloadButton.getAttribute('data-artist') || 'Artist';
    await downloadSpotifyTrack(trackTitle, artistName, downloadButton);
  });

  const downloadAllButton = container.querySelector('#downloadAllTracksBtn');
  downloadAllButton?.addEventListener('click', async () => {
    if (downloadAllButton.disabled) return;
    downloadAllButton.disabled = true;
    const originalHtml = downloadAllButton.innerHTML;

    const trackButtons = container.querySelectorAll('.download-single-track-btn');
    if (!trackButtons.length) return;

    showToast(`Starting batch download for ${trackButtons.length} tracks...`, 'info');

    let completedCount = 0;
    for (const btn of trackButtons) {
      const trackTitle = btn.getAttribute('data-title') || 'Track';
      const artistName = btn.getAttribute('data-artist') || 'Artist';

      downloadAllButton.innerHTML = `<span class="spinner-sm" style="width:14px;height:14px;border-width:2px;display:inline-block;margin-right:6px"></span>Downloading ${completedCount + 1}/${trackButtons.length}...`;

      try {
        await downloadSpotifyTrack(trackTitle, artistName, btn);
        completedCount++;
      } catch (err) {
        console.error('Failed downloading track:', trackTitle, err);
      }
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    downloadAllButton.innerHTML = originalHtml;
    downloadAllButton.disabled = false;
    showToast(`Batch download finished (${completedCount}/${trackButtons.length} downloaded)`, 'success');
  });
}

function renderTrackRows(tracks) {
  if (!tracks || !tracks.length) {
    return `<div style="padding:2rem;text-align:center;color:var(--text-muted)">No matching songs found in this playlist.</div>`;
  }

  return tracks.map((track, index) => `
    <div class="spotify-track-row">
      <span class="track-idx">${index + 1}</span>
      <img src="${escapeHtml(track.coverArt) || 'https://open.spotify.com/favicon.ico'}" alt="${escapeHtml(track.title)}" class="track-thumb" onerror="this.src='https://open.spotify.com/favicon.ico'" />
      <div class="track-info">
        <span class="track-title" title="${escapeHtml(track.title)}">${escapeHtml(track.title)}</span>
        <span class="track-artist" title="${escapeHtml(track.artist)}">${escapeHtml(track.artist)}</span>
      </div>
      <span class="track-duration track-col-duration">${escapeHtml(track.durationFormatted) || '0:00'}</span>
      <div class="track-preview track-col-preview">
        ${track.previewUrl ? `<audio controls controlsList="nodownload" src="${escapeHtml(track.previewUrl)}" preload="none"></audio>` : '<span class="no-preview">No preview</span>'}
      </div>
      <div class="track-action">
        <button class="btn btn-sm btn-primary download-single-track-btn" data-title="${escapeHtml(track.title)}" data-artist="${escapeHtml(track.artist)}">
          ⬇️ Download HQ
        </button>
      </div>
    </div>
  `).join('');
}

async function downloadSpotifyTrack(title, artist, button) {
  if (!button || button.disabled) return;
  const originalHtml = button.innerHTML;
  button.innerHTML = '<span class="spinner-sm" style="width:12px;height:12px;border-width:2px;display:inline-block;margin-right:4px"></span>Fetching...';
  button.disabled = true;

  try {
    const downloadApiUrl = `/api/spotify-download?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`;
    const response = await fetch(downloadApiUrl);

    if (!response.ok) {
      let errorMessage = 'Download failed';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.error || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    const audioBlob = await response.blob();
    let filename = `${title} - ${artist}.m4a`.replace(/[/\\?%*:|"<>]/g, '').trim();
    if (!filename || filename === '.m4a') filename = 'spotify-track.m4a';

    downloadBlob(audioBlob, filename);
    showToast(`Downloaded "${title}"`, 'success');
  } catch (error) {
    console.error('Track Download Error:', error);
    showToast(`Failed to download "${title}": ${error.message}`, 'error');
  } finally {
    button.innerHTML = originalHtml;
    button.disabled = false;
  }
}

// ============================================================================
// NETWORK & EXTRACTION HELPERS
// ============================================================================

async function fetchMediaFromCobalt(payload) {
  for (const apiUrl of COBALT_INSTANCES) {
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), COBALT_FETCH_TIMEOUT_MS);

      const response = await fetch(apiUrl, {
        method: 'POST',
        signal: abortController.signal,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      clearTimeout(timeoutId);

      const responseData = await response.json();
      if (responseData && (responseData.status === 'redirect' || responseData.status === 'stream' || responseData.status === 'success') && responseData.url) {
        return responseData.url;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function fetchInstagramImages(shortcode) {
  const targetUrls = [
    `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
    `https://www.instagram.com/p/${shortcode}/`
  ];

  for (const targetUrl of targetUrls) {
    for (const proxy of CORS_PROXIES) {
      try {
        const fetchUrl = proxy.buildUrl(targetUrl);
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), DEFAULT_FETCH_TIMEOUT_MS);

        const response = await fetch(fetchUrl, {
          signal: abortController.signal,
          headers: { Accept: 'text/html,application/json' }
        });
        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const html = await response.text();
        if (!html || html.length < 100) continue;

        const extractedUrls = extractImagesFromEmbedHtml(html);
        if (extractedUrls.length > 0) return extractedUrls;
      } catch {
        continue;
      }
    }
  }

  return [];
}

function extractImagesFromEmbedHtml(html) {
  const uniqueUrls = new Set();
  const decodedHtml = String(html || '').replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  const extractionPatterns = [
    /class="EmbeddedMediaImage"[^>]*src="([^"]+)"/gi,
    /property="og:image"\s*content="([^"]+)"/gi,
    /<img[^>]*src="(https:\/\/(?:scontent[^"]*|instagram[^"]*)\.(jpg|png|webp)[^"]*)"/gi,
    /"display_url"\s*:\s*"([^"]+)"/gi,
    /"display_src"\s*:\s*"([^"]+)"/gi,
    /"image_versions2"[^}]*"url"\s*:\s*"([^"]+)"/gi,
    /src="(https:\/\/scontent[^"]+)"/gi,
    /"thumbnail_src"\s*:\s*"([^"]+)"/gi
  ];

  for (const sourceText of [html, decodedHtml]) {
    for (const pattern of extractionPatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(sourceText)) !== null) {
        const cleanedUrl = match[1]
          .replace(/\\u0026/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/\\\//g, '/');

        if (cleanedUrl.includes('scontent') || cleanedUrl.includes('cdninstagram') || cleanedUrl.includes('fbcdn')) {
          uniqueUrls.add(cleanedUrl);
        }
      }
    }
  }

  return Array.from(uniqueUrls);
}

// ============================================================================
// SHARED UTILITIES
// ============================================================================

async function downloadMediaBlobWithFallback(imageUrl, proxyUrl, filename) {
  let response;
  try {
    response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Direct fetch failed');
  } catch {
    if (proxyUrl) {
      response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Proxy fetch failed');
    } else {
      throw new Error('Fetch failed');
    }
  }
  const imageBlob = await response.blob();
  downloadBlob(imageBlob, filename);
}

function extractYouTubeId(url) {
  const match = String(url || '').match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function extractInstagramShortcode(url) {
  const match = String(url || '').match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function wrapCanvasText(context, text, startX, startY, maxWidth, lineHeight) {
  const paragraphs = String(text || '').split('\n');
  let currentY = startY;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + word + ' ';
      if (context.measureText(testLine).width > maxWidth && currentLine) {
        context.fillText(currentLine.trim(), startX, currentY);
        currentLine = word + ' ';
        currentY += lineHeight;
      } else {
        currentLine = testLine;
      }
    }

    context.fillText(currentLine.trim(), startX, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

function loadImage(sourceUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = sourceUrl;
  });
}

function attachEnterKeyHandler(inputElement, callback) {
  inputElement?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      callback();
    }
  });
}

function renderErrorCard(message, subtext) {
  return `
    <div style="padding:1.5rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:12px;color:var(--text-main);text-align:center">
      <span style="font-size:2rem;display:block;margin-bottom:.5rem">⚠️</span>
      <strong style="color:#ef4444">${escapeHtml(message)}</strong>
      ${subtext ? `<p style="margin:.5rem 0 0;font-size:.85rem;color:var(--text-muted)">${escapeHtml(subtext)}</p>` : ''}
    </div>
  `;
}

function escapeHtml(string) {
  return String(string || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}



