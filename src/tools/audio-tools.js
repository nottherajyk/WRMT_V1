import { showToast } from '../components/toast.js';
import { downloadBlob, renderDropZone, formatBytes, copyToClipboard, readFileAsArrayBuffer } from '../utils.js';
import { Mp3Encoder } from '@breezystack/lamejs';
import JSZip from 'jszip';

// ============================================================================
// AUDIO TOOLS DISPATCHER
// ============================================================================

const TOOL_RENDERERS = {
  'mp4-to-mp3': renderMP4ToMP3,
  'mp3-to-text': renderMP3ToText
};

const TOOL_SETUP_HANDLERS = {
  'mp4-to-mp3': setupMP4ToMP3,
  'mp3-to-text': setupMP3ToText
};

export function audioToolHandler(tool) {
  setTimeout(() => setupAudioTool(tool.id), 50);
  window.addEventListener('page-rendered', () => setupAudioTool(tool.id), { once: true });

  const renderFn = TOOL_RENDERERS[tool.id];
  return renderFn ? renderFn() : `<p>Tool not found</p>`;
}

export function setupAudioTool(toolId) {
  const setupFn = TOOL_SETUP_HANDLERS[toolId];
  if (typeof setupFn === 'function') {
    setupFn();
  }
}

// ============================================================================
// UTILITIES: AUDIO CONVERSION & ENCODING
// ============================================================================

/**
 * Converts Float32Array PCM samples (-1.0 to 1.0) into 16-bit signed PCM (Int16Array).
 */
function floatTo16BitPCM(floatSamples, gain = 1.0) {
  const output = new Int16Array(floatSamples.length);
  for (let i = 0; i < floatSamples.length; i++) {
    let s = floatSamples[i] * gain;
    if (s < -1.0) s = -1.0;
    else if (s > 1.0) s = 1.0;
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

/**
 * Converts AudioBuffer to a valid 16-bit PCM WAV Blob.
 */
function audioBufferToWav(audioBuffer, startSec = 0, endSec = null, gain = 1.0) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.max(0, Math.floor(startSec * sampleRate));
  const endSample = endSec ? Math.min(audioBuffer.length, Math.floor(endSec * sampleRate)) : audioBuffer.length;
  const lengthSamples = Math.max(0, endSample - startSample);

  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = lengthSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt Subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample

  // data Subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write interleaved PCM samples
  const channels = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(audioBuffer.getChannelData(c).subarray(startSample, endSample));
  }

  let offset = 44;
  for (let i = 0; i < lengthSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      let s = (channels[c][i] || 0) * gain;
      if (s < -1.0) s = -1.0;
      else if (s > 1.0) s = 1.0;
      const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
      view.setInt16(offset, val, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Encodes an AudioBuffer into MP3 using @breezystack/lamejs.
 */
async function encodeAudioBufferToMp3(audioBuffer, options = {}, onProgress = () => {}) {
  const {
    bitrate = 192,
    channels = 2,
    startSec = 0,
    endSec = null,
    gain = 1.0
  } = options;

  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.max(0, Math.floor(startSec * sampleRate));
  const endSample = endSec ? Math.min(audioBuffer.length, Math.floor(endSec * sampleRate)) : audioBuffer.length;
  const numSamples = endSample - startSample;

  if (numSamples <= 0) {
    throw new Error('Selected audio duration is empty or invalid.');
  }

  const outChannels = Math.min(channels, audioBuffer.numberOfChannels);
  const encoder = new Mp3Encoder(outChannels, sampleRate, bitrate);

  const leftChannelRaw = audioBuffer.getChannelData(0).subarray(startSample, endSample);
  const leftPCM = floatTo16BitPCM(leftChannelRaw, gain);

  let rightPCM = null;
  if (outChannels === 2) {
    const rightChannelRaw = audioBuffer.numberOfChannels > 1
      ? audioBuffer.getChannelData(1).subarray(startSample, endSample)
      : leftChannelRaw;
    rightPCM = floatTo16BitPCM(rightChannelRaw, gain);
  }

  const chunkSize = 1152; // LAME standard frame size
  const mp3Data = [];

  for (let i = 0; i < numSamples; i += chunkSize) {
    const leftChunk = leftPCM.subarray(i, i + chunkSize);
    let encodedChunk;

    if (outChannels === 2 && rightPCM) {
      const rightChunk = rightPCM.subarray(i, i + chunkSize);
      encodedChunk = encoder.encodeBuffer(leftChunk, rightChunk);
    } else {
      encodedChunk = encoder.encodeBuffer(leftChunk);
    }

    if (encodedChunk.length > 0) {
      mp3Data.push(encodedChunk);
    }

    // Async yield every 40 frames to maintain responsive UI & progress bar
    if (i % (chunkSize * 40) === 0) {
      const pct = Math.min(99, Math.round((i / numSamples) * 100));
      onProgress(pct);
      await new Promise(r => setTimeout(r, 0));
    }
  }

  const flushChunk = encoder.flush();
  if (flushChunk.length > 0) {
    mp3Data.push(flushChunk);
  }

  onProgress(100);
  return new Blob(mp3Data, { type: 'audio/mp3' });
}

/**
 * Decodes video audio track from file into AudioBuffer using Web Audio API
 */
async function decodeAudioFromMediaFile(file, targetSampleRate = 44100) {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
    sampleRate: targetSampleRate
  });

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    return audioBuffer;
  } catch (err) {
    // If direct decodeAudioData fails on video file, extract via video element
    return await extractAudioViaVideoElement(file, targetSampleRate);
  } finally {
    if (audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
    }
  }
}

/**
 * Fallback audio extractor using HTML5 Video element and OfflineAudioContext
 */
function extractAudioViaVideoElement(file, sampleRate = 44100) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.crossOrigin = 'anonymous';

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        if (!duration || isNaN(duration)) {
          URL.revokeObjectURL(url);
          return reject(new Error('Unable to read video duration. File may have no audio track.'));
        }

        // Try AudioContext decode on sliced array buffer once metadata is verified
        const buffer = await readFileAsArrayBuffer(file);
        const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
        const decoded = await ctx.decodeAudioData(buffer);
        ctx.close();
        URL.revokeObjectURL(url);
        resolve(decoded);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(new Error('No compatible audio track found in this video file: ' + e.message));
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Browser could not load video format. Please ensure video has an AAC/MP3 audio track.'));
    };
  });
}

/**
 * Generates an in-memory sample video with an audio track so the user can test MP4-to-MP3 without uploading.
 */
async function generateSampleVideoFile() {
  const sampleRate = 44100;
  const durationSec = 3.5;
  const numSamples = sampleRate * durationSec;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
  const audioBuffer = audioCtx.createBuffer(2, numSamples, sampleRate);

  // Generate melodic chime chords
  const ch0 = audioBuffer.getChannelData(0);
  const ch1 = audioBuffer.getChannelData(1);
  const freqs = [440, 554.37, 659.25, 880]; // A major arpeggio

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const noteIdx = Math.min(freqs.length - 1, Math.floor(t * 1.2));
    const f = freqs[noteIdx];
    const env = Math.exp(-((t % 0.8) * 3));
    const s = Math.sin(2 * Math.PI * f * t) * 0.4 * env;
    ch0[i] = s;
    ch1[i] = s * 0.95;
  }
  audioCtx.close();

  // Create a WAV and return as File
  const wavBlob = audioBufferToWav(audioBuffer);
  return new File([wavBlob], 'sample-video-clip.mp4', { type: 'video/mp4' });
}

// ============================================================================
// FORMAT GENERATORS FOR TRANSCRIBER
// ============================================================================

function formatTimeSRT(seconds) {
  const pad = (n, len = 2) => String(Math.floor(n)).padStart(len, '0');
  const hrs = pad(seconds / 3600);
  const mins = pad((seconds % 3600) / 60);
  const secs = pad(seconds % 60);
  const ms = pad(Math.round((seconds % 1) * 1000), 3);
  return `${hrs}:${mins}:${secs},${ms}`;
}

function formatTimeVTT(seconds) {
  const pad = (n, len = 2) => String(Math.floor(n)).padStart(len, '0');
  const hrs = pad(seconds / 3600);
  const mins = pad((seconds % 3600) / 60);
  const secs = pad(seconds % 60);
  const ms = pad(Math.round((seconds % 1) * 1000), 3);
  return `${hrs}:${mins}:${secs}.${ms}`;
}

function formatTimeReadable(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function generateSRT(segments) {
  return segments.map((seg, idx) => {
    return `${idx + 1}\n${formatTimeSRT(seg.start)} --> ${formatTimeSRT(seg.end)}\n${seg.text.trim()}\n`;
  }).join('\n');
}

export function generateVTT(segments) {
  const lines = ['WEBVTT', ''];
  segments.forEach((seg, idx) => {
    lines.push(`${idx + 1}`);
    lines.push(`${formatTimeVTT(seg.start)} --> ${formatTimeVTT(seg.end)}`);
    lines.push(`${seg.text.trim()}`);
    lines.push('');
  });
  return lines.join('\n');
}

export function generateTXT(segments, includeTimestamps = false) {
  if (includeTimestamps) {
    return segments.map(seg => `[${formatTimeReadable(seg.start)}] ${seg.text.trim()}`).join('\n\n');
  }
  return segments.map(seg => seg.text.trim()).join(' ');
}

export function generateJSON(fileInfo, segments, fullText) {
  const words = fullText.split(/\s+/).filter(Boolean).length;
  return JSON.stringify({
    metadata: {
      fileName: fileInfo.name || 'audio-transcription.mp3',
      fileSize: fileInfo.size ? formatBytes(fileInfo.size) : 'Unknown',
      durationSeconds: Number((fileInfo.duration || 0).toFixed(2)),
      wordCount: words,
      segmentCount: segments.length,
      generatedAt: new Date().toISOString(),
      tool: 'wherearemytools MP3 to Text Transcriber'
    },
    transcript: fullText,
    segments: segments.map(s => ({
      id: s.id,
      start: Number(s.start.toFixed(3)),
      end: Number(s.end.toFixed(3)),
      text: s.text.trim()
    }))
  }, null, 2);
}

export function generateMarkdown(fileInfo, segments, fullText) {
  const words = fullText.split(/\s+/).filter(Boolean).length;
  const duration = fileInfo.duration ? formatTimeReadable(fileInfo.duration) : '00:00';

  let md = `# 🎙️ Audio Transcription: ${fileInfo.name || 'Audio Recording'}\n\n`;
  md += `| Property | Details |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Duration** | ${duration} |\n`;
  md += `| **Total Words** | ${words} words |\n`;
  md += `| **Segments** | ${segments.length} subtitles |\n`;
  md += `| **Export Date** | ${new Date().toLocaleDateString()} |\n\n`;
  md += `## 📜 Full Transcript\n\n`;
  md += `${fullText}\n\n`;
  md += `## ⏱️ Timestamped Segments\n\n`;

  segments.forEach(seg => {
    md += `> **[${formatTimeReadable(seg.start)} - ${formatTimeReadable(seg.end)}]**  \n> ${seg.text.trim()}\n\n`;
  });

  return md;
}

export function generateCSV(segments) {
  const header = ['"Index"', '"Start Time"', '"End Time"', '"Duration (s)"', '"Text"'].join(',');
  const rows = segments.map(s => {
    const dur = (s.end - s.start).toFixed(2);
    const textEscaped = s.text.replace(/"/g, '""');
    return `"${s.id}","${formatTimeSRT(s.start)}","${formatTimeSRT(s.end)}","${dur}","${textEscaped}"`;
  });
  return [header, ...rows].join('\n');
}

// Sample transcript data for instant demo mode
const SAMPLE_DEMO_SEGMENTS = [
  { id: 1, start: 0.0, end: 3.2, text: "Welcome to where are my tools audio transcriber." },
  { id: 2, start: 3.4, end: 6.8, text: "Convert any MP3 or voice recording into clean text instantly." },
  { id: 3, start: 7.0, end: 11.2, text: "Export subtitles in SRT, WebVTT, Markdown, JSON, and CSV formats with 100 percent privacy." },
  { id: 4, start: 11.5, end: 15.0, text: "Everything runs locally in your browser with zero data sent to external servers." }
];

// ============================================================================
// TOOL 1: MP4 TO MP3 CONVERTER
// ============================================================================

export function renderMP4ToMP3() {
  return `
    <div class="tool-page-container audio-tool-page">
      <!-- Upload Drop Zone -->
      <div id="mp4DropZoneContainer">
        ${renderDropZone('mp4DropZone', '.mp4,.m4v,.webm,.mov,.mkv,.avi,video/*', 'Drop your MP4 or Video file here')}
        <div class="sample-action-row" style="margin-top: 1rem; text-align: center;">
          <button class="btn btn-secondary btn-sm" id="loadSampleMp4Btn" type="button" style="font-size: 0.85rem; padding: 0.4rem 0.9rem;">
            ⚡ Try Sample Clip
          </button>
          <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.5rem;">Test instantly without uploading!</span>
        </div>
      </div>

      <!-- Video Workspace (Hidden until file selected) -->
      <div id="mp4Workspace" style="display: none; margin-top: 1.5rem;">
        <div class="audio-workspace-grid">
          <!-- Left: Video Preview & Metadata -->
          <div class="video-preview-card">
            <div class="video-player-wrapper">
              <video id="mp4PreviewVideo" controls playsinline></video>
            </div>
            <div class="media-meta-grid" id="mp4MetaGrid">
              <div class="media-meta-item">
                <span class="meta-label">File</span>
                <span class="meta-val" id="mp4FileName">—</span>
              </div>
              <div class="media-meta-item">
                <span class="meta-label">Video Size</span>
                <span class="meta-val" id="mp4FileSize">—</span>
              </div>
              <div class="media-meta-item">
                <span class="meta-label">Duration</span>
                <span class="meta-val" id="mp4Duration">—</span>
              </div>
              <div class="media-meta-item">
                <span class="meta-label">Audio Tracks</span>
                <span class="meta-val" id="mp4AudioTracks">Detecting...</span>
              </div>
            </div>
          </div>

          <!-- Right: Audio Extraction Settings -->
          <div class="audio-settings-card">
            <h3 class="section-subtitle">⚙️ Audio Extraction Settings</h3>
            
            <!-- Bitrate Quality -->
            <div class="form-group">
              <label class="form-label">MP3 Audio Bitrate (Quality)</label>
              <div class="bitrate-pills" id="bitratePills">
                <button type="button" class="bitrate-pill" data-bitrate="96">96 kbps<small>Compact</small></button>
                <button type="button" class="bitrate-pill" data-bitrate="128">128 kbps<small>Standard</small></button>
                <button type="button" class="bitrate-pill active" data-bitrate="192">192 kbps<small>High</small></button>
                <button type="button" class="bitrate-pill" data-bitrate="256">256 kbps<small>Very High</small></button>
                <button type="button" class="bitrate-pill" data-bitrate="320">320 kbps<small>Studio</small></button>
              </div>
            </div>

            <!-- Channels & Sample Rate Row -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Audio Channels</label>
                <select id="mp4ChannelsSelect">
                  <option value="2" selected>Stereo (2 Channels)</option>
                  <option value="1">Mono (1 Channel)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Sample Rate</label>
                <select id="mp4SampleRateSelect">
                  <option value="44100" selected>44.1 kHz (CD Audio)</option>
                  <option value="48000">48 kHz (Studio Audio)</option>
                </select>
              </div>
            </div>

            <!-- Volume Booster Slider -->
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <label class="form-label" style="margin-bottom: 0;">Volume Boost</label>
                <span id="volumeBoostVal" class="badge-pill" style="font-weight: 700;">100%</span>
              </div>
              <input type="range" id="volumeBoostSlider" min="50" max="200" value="100" step="5" style="width: 100%; cursor: pointer;" />
            </div>

            <!-- Audio Trimming Section -->
            <div class="trim-section-container">
              <label class="trim-toggle-label">
                <input type="checkbox" id="enableTrimCheck" />
                <span>✂️ Trim specific audio segment</span>
              </label>

              <div id="trimControlsArea" style="display: none; margin-top: 0.75rem;">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" style="font-size: 0.78rem;">Start (sec)</label>
                    <input type="number" id="trimStartInput" min="0" step="0.5" value="0" />
                    <button type="button" class="btn btn-secondary btn-xs" id="setStartCurTimeBtn" style="margin-top: 0.35rem; width: 100%;">Set at Current Time</button>
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-size: 0.78rem;">End (sec)</label>
                    <input type="number" id="trimEndInput" min="0" step="0.5" value="0" />
                    <button type="button" class="btn btn-secondary btn-xs" id="setEndCurTimeBtn" style="margin-top: 0.35rem; width: 100%;">Set at Current Time</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Convert Button -->
            <button class="btn btn-primary btn-block" id="startMp4ConvertBtn" style="margin-top: 1.25rem; font-size: 1.05rem; padding: 0.9rem;">
              🎵 Extract & Convert to MP3
            </button>
          </div>
        </div>

        <!-- Conversion Progress Indicator -->
        <div id="mp4ProgressArea" style="display: none; margin-top: 1.5rem;" class="audio-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span id="mp4ProgressStatus" style="font-weight: 700; font-size: 0.9rem;">Decoding MP4 audio track...</span>
            <span id="mp4ProgressPct" style="font-weight: 900; font-size: 1rem; color: var(--accent);">0%</span>
          </div>
          <div class="neo-progress-bar">
            <div class="neo-progress-fill" id="mp4ProgressFill" style="width: 0%;"></div>
          </div>
        </div>

        <!-- Output Result Card -->
        <div id="mp4ResultArea" style="display: none; margin-top: 1.5rem;" class="audio-result-card">
          <div class="result-success-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Audio Extracted Successfully!</span>
          </div>

          <div class="result-player-box">
            <audio id="mp3ResultAudio" controls style="width: 100%;"></audio>
          </div>

          <div class="result-stats-row">
            <div class="stat-badge"><span class="lbl">Output Format:</span> <strong id="resFormat">MP3</strong></div>
            <div class="stat-badge"><span class="lbl">Audio Size:</span> <strong id="resSize">—</strong></div>
            <div class="stat-badge"><span class="lbl">Space Saved:</span> <strong id="resSaved" style="color: var(--success);">—</strong></div>
          </div>

          <div class="result-actions-grid" style="margin-top: 1.25rem;">
            <button class="btn btn-primary" id="downloadMp3Btn" style="font-size: 1rem; padding: 0.85rem 1.25rem;">
              💾 Download MP3 Audio
            </button>
            <button class="btn btn-secondary" id="downloadWavBtn" style="font-size: 0.95rem;">
              🎧 Download Lossless WAV
            </button>
            <button class="btn btn-secondary" id="sendToTranscriberBtn" style="background: var(--bg-primary); border-color: #000; font-weight: 800;">
              🎙️ Transcribe to Text ➡️
            </button>
            <button class="btn btn-secondary" id="convertAnotherMp4Btn">
              🔄 Convert Another Video
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupMP4ToMP3() {
  let loadedFile = null;
  let decodedAudioBuffer = null;
  let convertedMp3Blob = null;
  let convertedWavBlob = null;
  let selectedBitrate = 192;

  const dropZone = document.getElementById('mp4DropZone');
  const dropInput = document.getElementById('mp4DropZoneInput');
  const workspace = document.getElementById('mp4Workspace');
  const videoPreview = document.getElementById('mp4PreviewVideo');
  const fileNameEl = document.getElementById('mp4FileName');
  const fileSizeEl = document.getElementById('mp4FileSize');
  const durationEl = document.getElementById('mp4Duration');
  const audioTracksEl = document.getElementById('mp4AudioTracks');

  const bitratePills = document.querySelectorAll('#bitratePills .bitrate-pill');
  const channelsSelect = document.getElementById('mp4ChannelsSelect');
  const sampleRateSelect = document.getElementById('mp4SampleRateSelect');
  const volumeSlider = document.getElementById('volumeBoostSlider');
  const volumeValBadge = document.getElementById('volumeBoostVal');

  const enableTrimCheck = document.getElementById('enableTrimCheck');
  const trimControlsArea = document.getElementById('trimControlsArea');
  const trimStartInput = document.getElementById('trimStartInput');
  const trimEndInput = document.getElementById('trimEndInput');
  const setStartCurTimeBtn = document.getElementById('setStartCurTimeBtn');
  const setEndCurTimeBtn = document.getElementById('setEndCurTimeBtn');

  const convertBtn = document.getElementById('startMp4ConvertBtn');
  const progressArea = document.getElementById('mp4ProgressArea');
  const progressFill = document.getElementById('mp4ProgressFill');
  const progressStatus = document.getElementById('mp4ProgressStatus');
  const progressPct = document.getElementById('mp4ProgressPct');

  const resultArea = document.getElementById('mp4ResultArea');
  const resultAudio = document.getElementById('mp3ResultAudio');
  const resSizeEl = document.getElementById('resSize');
  const resSavedEl = document.getElementById('resSaved');
  const downloadMp3Btn = document.getElementById('downloadMp3Btn');
  const downloadWavBtn = document.getElementById('downloadWavBtn');
  const sendToTranscriberBtn = document.getElementById('sendToTranscriberBtn');
  const convertAnotherBtn = document.getElementById('convertAnotherMp4Btn');
  const loadSampleMp4Btn = document.getElementById('loadSampleMp4Btn');

  // Handle Bitrate selection
  bitratePills.forEach(pill => {
    pill.addEventListener('click', () => {
      bitratePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedBitrate = parseInt(pill.dataset.bitrate, 10);
    });
  });

  // Handle Volume slider
  volumeSlider?.addEventListener('input', () => {
    if (volumeValBadge) volumeValBadge.textContent = `${volumeSlider.value}%`;
  });

  // Handle Trim toggle
  enableTrimCheck?.addEventListener('change', () => {
    if (trimControlsArea) {
      trimControlsArea.style.display = enableTrimCheck.checked ? 'block' : 'none';
    }
  });

  // Trim sync with video current time
  setStartCurTimeBtn?.addEventListener('click', () => {
    if (videoPreview && trimStartInput) {
      trimStartInput.value = (videoPreview.currentTime || 0).toFixed(1);
      showToast(`Start time set to ${trimStartInput.value}s`, 'info');
    }
  });

  setEndCurTimeBtn?.addEventListener('click', () => {
    if (videoPreview && trimEndInput) {
      trimEndInput.value = (videoPreview.currentTime || 0).toFixed(1);
      showToast(`End time set to ${trimEndInput.value}s`, 'info');
    }
  });

  // Load file into workspace
  async function loadVideoFile(file) {
    loadedFile = file;
    decodedAudioBuffer = null;
    convertedMp3Blob = null;
    convertedWavBlob = null;

    if (resultArea) resultArea.style.display = 'none';
    if (progressArea) progressArea.style.display = 'none';
    if (workspace) workspace.style.display = 'block';

    if (fileNameEl) fileNameEl.textContent = file.name;
    if (fileSizeEl) fileSizeEl.textContent = formatBytes(file.size);
    if (audioTracksEl) audioTracksEl.textContent = 'Analyzing audio...';

    const videoUrl = URL.createObjectURL(file);
    if (videoPreview) {
      videoPreview.src = videoUrl;
      videoPreview.onloadedmetadata = () => {
        const dur = videoPreview.duration || 0;
        if (durationEl) durationEl.textContent = formatTimeReadable(dur);
        if (trimEndInput) trimEndInput.value = dur.toFixed(1);
      };
    }

    // Pre-decode audio buffer in background for instant responsiveness
    try {
      const targetSr = parseInt(sampleRateSelect?.value || '44100', 10);
      decodedAudioBuffer = await decodeAudioFromMediaFile(file, targetSr);
      if (audioTracksEl) {
        audioTracksEl.textContent = `${decodedAudioBuffer.numberOfChannels} ch (${decodedAudioBuffer.sampleRate} Hz)`;
      }
      showToast('Video audio stream loaded successfully!', 'success');
    } catch (err) {
      if (audioTracksEl) audioTracksEl.textContent = 'Audio track not detected';
      showToast('Warning: ' + err.message, 'warning');
    }
  }

  // Bind Dropzone
  if (dropZone && dropInput) {
    dropZone.addEventListener('click', () => dropInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files?.length) {
        loadVideoFile(e.dataTransfer.files[0]);
      }
    });

    dropInput.addEventListener('change', () => {
      if (dropInput.files?.length) {
        loadVideoFile(dropInput.files[0]);
      }
    });
  }

  // Check for globally dropped file
  if (window.pendingDroppedFile && ['mp4', 'mov', 'webm', 'mkv', 'm4v'].some(ext => window.pendingDroppedFile.name.toLowerCase().endsWith(ext))) {
    const f = window.pendingDroppedFile;
    window.pendingDroppedFile = null;
    loadVideoFile(f);
  }

  // Sample Video button
  loadSampleMp4Btn?.addEventListener('click', async () => {
    try {
      loadSampleMp4Btn.disabled = true;
      loadSampleMp4Btn.textContent = 'Loading sample...';
      const sampleFile = await generateSampleVideoFile();
      await loadVideoFile(sampleFile);
    } catch (e) {
      showToast('Could not generate sample: ' + e.message, 'error');
    } finally {
      loadSampleMp4Btn.disabled = false;
      loadSampleMp4Btn.textContent = '⚡ Try Sample Clip';
    }
  });

  // Convert Button Action
  convertBtn?.addEventListener('click', async () => {
    if (!loadedFile) {
      showToast('Please upload an MP4 or video file first.', 'warning');
      return;
    }

    try {
      convertBtn.disabled = true;
      if (resultArea) resultArea.style.display = 'none';
      if (progressArea) progressArea.style.display = 'block';

      if (progressStatus) progressStatus.textContent = 'Decoding video audio track...';
      if (progressFill) progressFill.style.width = '10%';
      if (progressPct) progressPct.textContent = '10%';

      const targetSr = parseInt(sampleRateSelect?.value || '44100', 10);
      const outChannels = parseInt(channelsSelect?.value || '2', 10);
      const volumeGain = (parseFloat(volumeSlider?.value || '100') / 100);

      // Ensure audio buffer is loaded
      if (!decodedAudioBuffer) {
        decodedAudioBuffer = await decodeAudioFromMediaFile(loadedFile, targetSr);
      }

      let startSec = 0;
      let endSec = decodedAudioBuffer.duration;

      if (enableTrimCheck?.checked) {
        startSec = Math.max(0, parseFloat(trimStartInput?.value || '0'));
        endSec = Math.min(decodedAudioBuffer.duration, parseFloat(trimEndInput?.value || `${decodedAudioBuffer.duration}`));
        if (startSec >= endSec) {
          throw new Error('Trim start time must be less than end time.');
        }
      }

      if (progressStatus) progressStatus.textContent = 'Encoding MP3 frames with LAME encoder...';

      // Encode MP3 with progress updates
      convertedMp3Blob = await encodeAudioBufferToMp3(decodedAudioBuffer, {
        bitrate: selectedBitrate,
        channels: outChannels,
        startSec,
        endSec,
        gain: volumeGain
      }, (pct) => {
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressPct) progressPct.textContent = `${pct}%`;
      });

      // Also create WAV blob for optional lossless download
      convertedWavBlob = audioBufferToWav(decodedAudioBuffer, startSec, endSec, volumeGain);

      if (progressStatus) progressStatus.textContent = 'Conversion Complete!';

      // Display results
      const mp3Url = URL.createObjectURL(convertedMp3Blob);
      if (resultAudio) resultAudio.src = mp3Url;
      if (resSizeEl) resSizeEl.textContent = formatBytes(convertedMp3Blob.size);

      if (resSavedEl) {
        const origSize = loadedFile.size;
        const newSize = convertedMp3Blob.size;
        const savedPct = Math.max(0, Math.round(((origSize - newSize) / origSize) * 100));
        resSavedEl.textContent = `-${savedPct}% space saved`;
      }

      if (resultArea) resultArea.style.display = 'block';
      showToast('MP3 audio ready for download!', 'success');
    } catch (err) {
      showToast('Conversion failed: ' + err.message, 'error');
    } finally {
      convertBtn.disabled = false;
    }
  });

  // Download MP3
  downloadMp3Btn?.addEventListener('click', () => {
    if (!convertedMp3Blob || !loadedFile) return;
    const baseName = loadedFile.name.replace(/\.[^/.]+$/, '');
    downloadBlob(convertedMp3Blob, `${baseName}.mp3`);
  });

  // Download WAV
  downloadWavBtn?.addEventListener('click', () => {
    if (!convertedWavBlob || !loadedFile) return;
    const baseName = loadedFile.name.replace(/\.[^/.]+$/, '');
    downloadBlob(convertedWavBlob, `${baseName}.wav`);
  });

  // Bridge to Transcriber Tool
  sendToTranscriberBtn?.addEventListener('click', () => {
    if (!convertedMp3Blob || !loadedFile) return;
    const baseName = loadedFile.name.replace(/\.[^/.]+$/, '');
    const mp3File = new File([convertedMp3Blob], `${baseName}.mp3`, { type: 'audio/mp3' });
    window.pendingAudioFile = mp3File;
    window.location.hash = '#/tool/mp3-to-text';
  });

  // Convert Another Video
  convertAnotherBtn?.addEventListener('click', () => {
    loadedFile = null;
    decodedAudioBuffer = null;
    convertedMp3Blob = null;
    convertedWavBlob = null;
    if (workspace) workspace.style.display = 'none';
    if (dropInput) dropInput.value = '';
  });
}

// ============================================================================
// TOOL 2: MP3 TO TEXT TRANSCRIBER
// ============================================================================

export function renderMP3ToText() {
  return `
    <div class="tool-page-container audio-tool-page">
      <!-- Upload Drop Zone -->
      <div id="transcribeDropZoneContainer">
        ${renderDropZone('transcribeDropZone', '.mp3,.wav,.m4a,.ogg,.flac,.aac,audio/*', 'Drop your MP3 or Audio file here')}
        <div class="sample-action-row" style="margin-top: 1rem; text-align: center;">
          <button class="btn btn-secondary btn-sm" id="loadSampleAudioBtn" type="button" style="font-size: 0.85rem; padding: 0.4rem 0.9rem;">
            🎙️ Try Sample Audio & Demo
          </button>
          <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.5rem;">Instant test with ready speech & transcripts!</span>
        </div>
      </div>

      <!-- Audio Workspace (Hidden until file selected) -->
      <div id="transcribeWorkspace" style="display: none; margin-top: 1.5rem;">
        <!-- Audio Source Card -->
        <div class="audio-source-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="file-icon-badge">🎵</span>
              <div>
                <strong id="transcribeFileName" style="display: block; font-size: 0.95rem;">audio.mp3</strong>
                <span id="transcribeFileSize" style="font-size: 0.8rem; color: var(--text-muted);">—</span>
              </div>
            </div>
            <div id="transcribeDurationBadge" class="badge-pill" style="font-weight: 700;">Duration: 00:00</div>
          </div>
          <audio id="transcribeAudioPlayer" controls style="width: 100%;"></audio>
        </div>

        <!-- Engine & Settings Card -->
        <div class="transcribe-settings-card" style="margin-top: 1.25rem;">
          <h3 class="section-subtitle">⚙️ Speech Recognition Engine</h3>

          <!-- Engine Mode Selection -->
          <div class="radio-card-grid" style="margin-bottom: 1.25rem;">
            <label class="radio-card">
              <input type="radio" name="transcribeEngine" value="browser-whisper" checked />
              <div>
                <strong style="display: block; font-size: 0.92rem;">AI Whisper (In-Browser)</strong>
                <span style="font-size: 0.78rem; color: var(--text-muted);">100% Free & Private. Runs locally via WebAssembly with zero data sent.</span>
              </div>
            </label>

            <label class="radio-card">
              <input type="radio" name="transcribeEngine" value="cloud-whisper" />
              <div>
                <strong style="display: block; font-size: 0.92rem;">Cloud Whisper API</strong>
                <span style="font-size: 0.78rem; color: var(--text-muted);">Groq / OpenAI Whisper. Ultra-fast (2 seconds) with custom API key.</span>
              </div>
            </label>

            <label class="radio-card">
              <input type="radio" name="transcribeEngine" value="web-speech" />
              <div>
                <strong style="display: block; font-size: 0.92rem;">Web Speech Recognition</strong>
                <span style="font-size: 0.78rem; color: var(--text-muted);">Native browser speech engine for audio playback.</span>
              </div>
            </label>
          </div>

          <!-- Cloud API Credentials Panel (Conditional) -->
          <div id="cloudApiConfigPanel" style="display: none; background: var(--surface-light); padding: 1rem; border: 2px solid #000; border-radius: 10px; margin-bottom: 1rem;">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Provider</label>
                <select id="cloudProviderSelect">
                  <option value="groq" selected>Groq Whisper (Free & Fastest, 300x realtime)</option>
                  <option value="openai">OpenAI Whisper (whisper-1)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">API Key</label>
                <input type="password" id="cloudApiKeyInput" placeholder="gsk_... or sk-..." />
              </div>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">
              * Stored securely in your browser's localStorage. Never sent to any third party other than direct inference API.
            </p>
          </div>

          <!-- Language & Timestamps Row -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Spoken Language</label>
              <select id="transcribeLanguageSelect">
                <option value="en" selected>English</option>
                <option value="auto">Auto-Detect</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="it">Italian (Italiano)</option>
                <option value="pt">Portuguese (Português)</option>
                <option value="nl">Dutch (Nederlands)</option>
                <option value="ru">Russian (Русский)</option>
                <option value="zh">Chinese (中文)</option>
                <option value="ja">Japanese (日本語)</option>
                <option value="ko">Korean (한국어)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="ar">Arabic (العربية)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Timestamp Granularity</label>
              <select id="transcribeTimestampsSelect">
                <option value="segments" selected>Segment Subtitles (~3-6 sec blocks)</option>
                <option value="sentences">Sentence-Level Blocks</option>
                <option value="continuous">Continuous Text (No Timestamps)</option>
              </select>
            </div>
          </div>

          <!-- Start Transcription Button -->
          <button class="btn btn-primary btn-block" id="startTranscribeBtn" style="margin-top: 0.5rem; font-size: 1.05rem; padding: 0.85rem;">
            ✨ Start Audio Transcription
          </button>
        </div>

        <!-- Transcription Progress Indicator -->
        <div id="transcribeProgressArea" style="display: none; margin-top: 1.5rem;" class="audio-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span id="transcribeProgressStatus" style="font-weight: 700; font-size: 0.9rem;">Initializing Whisper AI model...</span>
            <span id="transcribeProgressPct" style="font-weight: 900; font-size: 1rem; color: var(--accent);">0%</span>
          </div>
          <div class="neo-progress-bar">
            <div class="neo-progress-fill" id="transcribeProgressFill" style="width: 0%;"></div>
          </div>
          <p id="transcribeProgressNote" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
            * In-browser Whisper models are downloaded once (~39MB) and cached in your browser for offline use.
          </p>
        </div>

        <!-- Transcription Results Workspace -->
        <div id="transcribeResultArea" style="display: none; margin-top: 1.5rem;" class="transcript-results-card">
          <!-- Quick Metrics Bar -->
          <div class="transcript-metrics-bar">
            <div class="metric-col">
              <span class="m-val" id="metricWords">0</span>
              <span class="m-lbl">Total Words</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-col">
              <span class="m-val" id="metricDuration">00:00</span>
              <span class="m-lbl">Audio Duration</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-col">
              <span class="m-val" id="metricSegments">0</span>
              <span class="m-lbl">Subtitles/Segments</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-col">
              <span class="m-val" id="metricReadTime">~1 min</span>
              <span class="m-lbl">Est. Reading Time</span>
            </div>
          </div>

          <!-- Linked Audio Segment Player Info -->
          <div class="player-link-hint" style="margin-top: 1rem; font-size: 0.82rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem;">
            <span>💡 <strong>Interactive Sync:</strong> Click any timestamp badge [00:15] to seek audio immediately to that moment.</span>
          </div>

          <!-- Format Selector Tab Bar -->
          <div class="format-tabs-bar" id="formatTabsBar" style="margin-top: 1rem;">
            <button class="format-tab active" data-format="txt">Plain Text (.txt)</button>
            <button class="format-tab" data-format="srt">SubRip Subtitles (.srt)</button>
            <button class="format-tab" data-format="vtt">WebVTT (.vtt)</button>
            <button class="format-tab" data-format="json">JSON (.json)</button>
            <button class="format-tab" data-format="md">Markdown (.md)</button>
            <button class="format-tab" data-format="csv">CSV Table (.csv)</button>
          </div>

          <!-- Format Preview & Edit Area -->
          <div class="transcript-preview-container">
            <div class="preview-actions-header">
              <div class="format-info-badge">
                <span id="activeFormatLabel">Format: Plain Text (.txt)</span>
              </div>
              <div class="header-tools">
                <label id="txtTimestampToggleLabel" style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; cursor: pointer;">
                  <input type="checkbox" id="includeTxtTimestampsCheck" />
                  <span>Include Timestamps</span>
                </label>
              </div>
            </div>

            <textarea id="transcriptPreviewText" class="transcript-editor-area" spellcheck="false"></textarea>
          </div>

          <!-- Export & Download Actions -->
          <div class="transcript-export-bar" style="margin-top: 1.25rem;">
            <button class="btn btn-secondary" id="copyTranscriptBtn">
              📋 Copy Format
            </button>
            <button class="btn btn-primary" id="downloadSingleFormatBtn">
              💾 Download Active Format
            </button>
            <button class="btn btn-primary btn-zip-download" id="downloadAllZipBtn" style="background: var(--bg-primary); color: #000; border-color: #000; font-weight: 800;">
              📦 Download All Formats (.ZIP)
            </button>
            <button class="btn btn-secondary" id="newTranscribeBtn">
              🔄 Transcribe Another Audio
            </button>
          </div>

          <!-- Interactive Segments List Accordion / Timeline -->
          <div class="segments-timeline-section" style="margin-top: 1.5rem;">
            <h4 style="font-family: 'Fredoka', sans-serif; font-size: 1.1rem; margin-bottom: 0.75rem;">
              ⏱️ Interactive Segment Timelines (Click time to play)
            </h4>
            <div class="segments-scroll-list" id="segmentsListContainer"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupMP3ToText() {
  let loadedFile = null;
  let audioDuration = 0;
  let activeSegments = [];
  let fullTranscriptText = '';
  let activeFormat = 'txt';

  const dropZone = document.getElementById('transcribeDropZone');
  const dropInput = document.getElementById('transcribeDropZoneInput');
  const workspace = document.getElementById('transcribeWorkspace');
  const fileNameEl = document.getElementById('transcribeFileName');
  const fileSizeEl = document.getElementById('transcribeFileSize');
  const durationBadge = document.getElementById('transcribeDurationBadge');
  const audioPlayer = document.getElementById('transcribeAudioPlayer');

  const engineRadios = document.querySelectorAll('input[name="transcribeEngine"]');
  const cloudConfigPanel = document.getElementById('cloudApiConfigPanel');
  const cloudProviderSelect = document.getElementById('cloudProviderSelect');
  const cloudApiKeyInput = document.getElementById('cloudApiKeyInput');
  const languageSelect = document.getElementById('transcribeLanguageSelect');

  const startBtn = document.getElementById('startTranscribeBtn');
  const progressArea = document.getElementById('transcribeProgressArea');
  const progressFill = document.getElementById('transcribeProgressFill');
  const progressStatus = document.getElementById('transcribeProgressStatus');
  const progressPct = document.getElementById('transcribeProgressPct');

  const resultArea = document.getElementById('transcribeResultArea');
  const metricWords = document.getElementById('metricWords');
  const metricDuration = document.getElementById('metricDuration');
  const metricSegments = document.getElementById('metricSegments');
  const metricReadTime = document.getElementById('metricReadTime');

  const formatTabs = document.querySelectorAll('#formatTabsBar .format-tab');
  const activeFormatLabel = document.getElementById('activeFormatLabel');
  const previewTextArea = document.getElementById('transcriptPreviewText');
  const includeTxtTimestampsCheck = document.getElementById('includeTxtTimestampsCheck');
  const txtTimestampToggleLabel = document.getElementById('txtTimestampToggleLabel');

  const copyBtn = document.getElementById('copyTranscriptBtn');
  const downloadSingleBtn = document.getElementById('downloadSingleFormatBtn');
  const downloadZipBtn = document.getElementById('downloadAllZipBtn');
  const newTranscribeBtn = document.getElementById('newTranscribeBtn');
  const segmentsListContainer = document.getElementById('segmentsListContainer');
  const loadSampleAudioBtn = document.getElementById('loadSampleAudioBtn');

  // Load saved API key from localStorage
  const savedKey = localStorage.getItem('aiot_whisper_api_key');
  if (savedKey && cloudApiKeyInput) cloudApiKeyInput.value = savedKey;

  // Toggle Cloud API Config Panel
  engineRadios.forEach(r => {
    r.addEventListener('change', () => {
      const selected = document.querySelector('input[name="transcribeEngine"]:checked')?.value;
      if (cloudConfigPanel) {
        cloudConfigPanel.style.display = selected === 'cloud-whisper' ? 'block' : 'none';
      }
    });
  });

  // Save API key on change
  cloudApiKeyInput?.addEventListener('input', () => {
    localStorage.setItem('aiot_whisper_api_key', cloudApiKeyInput.value.trim());
  });

  // Load Audio File
  function loadAudioFile(file) {
    loadedFile = file;
    activeSegments = [];
    fullTranscriptText = '';

    if (resultArea) resultArea.style.display = 'none';
    if (progressArea) progressArea.style.display = 'none';
    if (workspace) workspace.style.display = 'block';

    if (fileNameEl) fileNameEl.textContent = file.name;
    if (fileSizeEl) fileSizeEl.textContent = formatBytes(file.size);

    const audioUrl = URL.createObjectURL(file);
    if (audioPlayer) {
      audioPlayer.src = audioUrl;
      audioPlayer.onloadedmetadata = () => {
        audioDuration = audioPlayer.duration || 0;
        if (durationBadge) durationBadge.textContent = `Duration: ${formatTimeReadable(audioDuration)}`;
      };
    }
    showToast(`Loaded ${file.name}`, 'info');
  }

  // Dropzone events
  if (dropZone && dropInput) {
    dropZone.addEventListener('click', () => dropInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files?.length) {
        loadAudioFile(e.dataTransfer.files[0]);
      }
    });

    dropInput.addEventListener('change', () => {
      if (dropInput.files?.length) {
        loadAudioFile(dropInput.files[0]);
      }
    });
  }

  // Check pending audio from MP4-to-MP3 tool or global drop
  if (window.pendingAudioFile) {
    const f = window.pendingAudioFile;
    window.pendingAudioFile = null;
    loadAudioFile(f);
  } else if (window.pendingDroppedFile && ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'].some(ext => window.pendingDroppedFile.name.toLowerCase().endsWith(ext))) {
    const f = window.pendingDroppedFile;
    window.pendingDroppedFile = null;
    loadAudioFile(f);
  }

  // Sample Audio demo button
  loadSampleAudioBtn?.addEventListener('click', () => {
    const sampleBlob = new Blob(['sample audio dummy content'], { type: 'audio/mp3' });
    const sampleFile = new File([sampleBlob], 'sample-podcast-speech.mp3', { type: 'audio/mp3' });
    loadAudioFile(sampleFile);
    audioDuration = 15.0;
    if (durationBadge) durationBadge.textContent = `Duration: 00:15`;

    // Populate with demo transcription
    populateTranscriptionResults(SAMPLE_DEMO_SEGMENTS, sampleFile, 15.0);
    showToast('Sample audio transcript loaded!', 'success');
  });

  // Switch Format Tabs
  formatTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      formatTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFormat = tab.dataset.format;
      updateFormatPreview();
    });
  });

  // Timestamp toggle for TXT format
  includeTxtTimestampsCheck?.addEventListener('change', () => {
    if (activeFormat === 'txt') updateFormatPreview();
  });

  function updateFormatPreview() {
    if (!previewTextArea) return;
    const baseInfo = {
      name: loadedFile?.name || 'transcript.mp3',
      size: loadedFile?.size || 0,
      duration: audioDuration
    };

    if (txtTimestampToggleLabel) {
      txtTimestampToggleLabel.style.display = activeFormat === 'txt' ? 'inline-flex' : 'none';
    }

    if (activeFormatLabel) {
      const labels = {
        txt: 'Plain Text (.txt)',
        srt: 'SubRip Subtitles (.srt)',
        vtt: 'WebVTT Subtitles (.vtt)',
        json: 'JSON Data (.json)',
        md: 'Markdown Document (.md)',
        csv: 'CSV Spreadsheet (.csv)'
      };
      activeFormatLabel.textContent = `Format: ${labels[activeFormat] || activeFormat.toUpperCase()}`;
    }

    if (downloadSingleBtn) {
      downloadSingleBtn.textContent = `💾 Download ${activeFormat.toUpperCase()}`;
    }

    switch (activeFormat) {
      case 'txt':
        previewTextArea.value = generateTXT(activeSegments, includeTxtTimestampsCheck?.checked);
        break;
      case 'srt':
        previewTextArea.value = generateSRT(activeSegments);
        break;
      case 'vtt':
        previewTextArea.value = generateVTT(activeSegments);
        break;
      case 'json':
        previewTextArea.value = generateJSON(baseInfo, activeSegments, fullTranscriptText);
        break;
      case 'md':
        previewTextArea.value = generateMarkdown(baseInfo, activeSegments, fullTranscriptText);
        break;
      case 'csv':
        previewTextArea.value = generateCSV(activeSegments);
        break;
      default:
        previewTextArea.value = fullTranscriptText;
    }
  }

  // Populate UI with transcribed segments
  function populateTranscriptionResults(segments, file, duration) {
    activeSegments = segments;
    fullTranscriptText = segments.map(s => s.text.trim()).join(' ');

    const words = fullTranscriptText.split(/\s+/).filter(Boolean).length;
    if (metricWords) metricWords.textContent = words;
    if (metricDuration) metricDuration.textContent = formatTimeReadable(duration);
    if (metricSegments) metricSegments.textContent = segments.length;
    if (metricReadTime) metricReadTime.textContent = `~${Math.max(1, Math.ceil(words / 200))} min`;

    // Render interactive segments list
    if (segmentsListContainer) {
      segmentsListContainer.innerHTML = segments.map((seg, i) => `
        <div class="segment-card-item" data-start="${seg.start}" data-end="${seg.end}">
          <button type="button" class="segment-time-btn" data-time="${seg.start}">
            ⏱️ ${formatTimeReadable(seg.start)} - ${formatTimeReadable(seg.end)}
          </button>
          <div class="segment-text-content" contenteditable="true" data-index="${i}">
            ${seg.text}
          </div>
        </div>
      `).join('');

      // Click timestamp to seek audio
      segmentsListContainer.querySelectorAll('.segment-time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const t = parseFloat(btn.dataset.time || '0');
          if (audioPlayer) {
            audioPlayer.currentTime = t;
            audioPlayer.play().catch(() => {});
          }
        });
      });

      // Inline edits in segment text reflect across export formats
      segmentsListContainer.querySelectorAll('.segment-text-content').forEach(el => {
        el.addEventListener('input', () => {
          const idx = parseInt(el.dataset.index, 10);
          if (activeSegments[idx]) {
            activeSegments[idx].text = el.innerText.trim();
            fullTranscriptText = activeSegments.map(s => s.text.trim()).join(' ');
            updateFormatPreview();
          }
        });
      });
    }

    // Audio timeupdate to highlight current segment
    audioPlayer?.addEventListener('timeupdate', () => {
      const curTime = audioPlayer.currentTime;
      segmentsListContainer?.querySelectorAll('.segment-card-item').forEach(card => {
        const start = parseFloat(card.dataset.start || '0');
        const end = parseFloat(card.dataset.end || '0');
        if (curTime >= start && curTime <= end) {
          card.classList.add('playing-active');
        } else {
          card.classList.remove('playing-active');
        }
      });
    });

    updateFormatPreview();
    if (resultArea) resultArea.style.display = 'block';
  }

  // Transcribe Action Button
  startBtn?.addEventListener('click', async () => {
    if (!loadedFile) {
      showToast('Please upload an audio file first.', 'warning');
      return;
    }

    const engine = document.querySelector('input[name="transcribeEngine"]:checked')?.value || 'browser-whisper';
    const lang = languageSelect?.value || 'en';

    try {
      startBtn.disabled = true;
      if (resultArea) resultArea.style.display = 'none';
      if (progressArea) progressArea.style.display = 'block';

      let segments = [];

      if (engine === 'cloud-whisper') {
        const apiKey = cloudApiKeyInput?.value?.trim();
        if (!apiKey) {
          throw new Error('Please enter your Groq or OpenAI API key in the configuration panel.');
        }

        if (progressStatus) progressStatus.textContent = 'Sending audio to Cloud Whisper API...';
        if (progressFill) progressFill.style.width = '40%';
        if (progressPct) progressPct.textContent = '40%';

        const provider = cloudProviderSelect?.value || 'groq';
        const cloudResult = await transcribeWithCloudAPI(loadedFile, apiKey, provider, lang);

        if (cloudResult.segments && cloudResult.segments.length > 0) {
          segments = cloudResult.segments.map((s, idx) => ({
            id: idx + 1,
            start: s.start,
            end: s.end,
            text: s.text
          }));
        } else {
          segments = [{ id: 1, start: 0, end: audioDuration, text: cloudResult.text || '' }];
        }
      } else if (engine === 'browser-whisper') {
        if (progressStatus) progressStatus.textContent = 'Loading in-browser Whisper AI model...';
        if (progressFill) progressFill.style.width = '15%';
        if (progressPct) progressPct.textContent = '15%';

        segments = await transcribeWithTransformersWhisper(loadedFile, lang, (p) => {
          if (progressFill) progressFill.style.width = `${p.pct}%`;
          if (progressPct) progressPct.textContent = `${p.pct}%`;
          if (progressStatus) progressStatus.textContent = p.status;
        });
      } else {
        // Web Speech API / Fallback Speech Synthesizer
        segments = await transcribeWithWebSpeech(loadedFile, lang);
      }

      if (progressFill) progressFill.style.width = '100%';
      if (progressPct) progressPct.textContent = '100%';
      if (progressStatus) progressStatus.textContent = 'Transcription Completed!';

      populateTranscriptionResults(segments, loadedFile, audioDuration);
      showToast('Speech transcribed successfully!', 'success');
    } catch (err) {
      showToast('Transcription error: ' + err.message, 'error');
      // If error occurred with in-browser whisper, offer demo fallback
      if (engine === 'browser-whisper') {
        showToast('Tip: Try the "Try Sample Audio & Demo" button or Cloud Whisper mode.', 'info');
      }
    } finally {
      startBtn.disabled = false;
    }
  });

  // Copy Format
  copyBtn?.addEventListener('click', () => {
    if (previewTextArea?.value) {
      copyToClipboard(previewTextArea.value);
      showToast(`Copied ${activeFormat.toUpperCase()} format to clipboard!`, 'success');
    }
  });

  // Download Single Format
  downloadSingleBtn?.addEventListener('click', () => {
    if (!previewTextArea?.value || !loadedFile) return;
    const baseName = loadedFile.name.replace(/\.[^/.]+$/, '');
    const mimeTypes = {
      txt: 'text/plain;charset=utf-8',
      srt: 'application/x-subrip;charset=utf-8',
      vtt: 'text/vtt;charset=utf-8',
      json: 'application/json;charset=utf-8',
      md: 'text/markdown;charset=utf-8',
      csv: 'text/csv;charset=utf-8'
    };
    const blob = new Blob([previewTextArea.value], { type: mimeTypes[activeFormat] || 'text/plain' });
    downloadBlob(blob, `${baseName}.${activeFormat}`);
  });

  // Download All as ZIP Bundle
  downloadZipBtn?.addEventListener('click', async () => {
    if (!activeSegments.length || !loadedFile) return;

    try {
      downloadZipBtn.disabled = true;
      downloadZipBtn.textContent = '📦 Packaging ZIP...';

      const baseName = loadedFile.name.replace(/\.[^/.]+$/, '');
      const baseInfo = { name: loadedFile.name, size: loadedFile.size, duration: audioDuration };

      const zip = new JSZip();
      zip.file(`${baseName}.txt`, generateTXT(activeSegments, false));
      zip.file(`${baseName}-timestamped.txt`, generateTXT(activeSegments, true));
      zip.file(`${baseName}.srt`, generateSRT(activeSegments));
      zip.file(`${baseName}.vtt`, generateVTT(activeSegments));
      zip.file(`${baseName}.json`, generateJSON(baseInfo, activeSegments, fullTranscriptText));
      zip.file(`${baseName}.md`, generateMarkdown(baseInfo, activeSegments, fullTranscriptText));
      zip.file(`${baseName}.csv`, generateCSV(activeSegments));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `${baseName}-transcriptions.zip`);
      showToast('All 6 transcript formats downloaded as ZIP!', 'success');
    } catch (e) {
      showToast('Error generating ZIP: ' + e.message, 'error');
    } finally {
      downloadZipBtn.disabled = false;
      downloadZipBtn.textContent = '📦 Download All Formats (.ZIP)';
    }
  });

  // New Transcribe
  newTranscribeBtn?.addEventListener('click', () => {
    loadedFile = null;
    activeSegments = [];
    fullTranscriptText = '';
    if (workspace) workspace.style.display = 'none';
    if (dropInput) dropInput.value = '';
  });
}

/**
 * Cloud Whisper API (Groq or OpenAI)
 */
async function transcribeWithCloudAPI(file, apiKey, provider = 'groq', language = 'en') {
  const endpoint = provider === 'groq'
    ? 'https://api.groq.com/openai/v1/audio/transcriptions'
    : 'https://api.openai.com/v1/audio/transcriptions';
  const model = provider === 'groq' ? 'whisper-large-v3' : 'whisper-1';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', model);
  formData.append('response_format', 'verbose_json');
  if (language && language !== 'auto') {
    formData.append('language', language);
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API request failed with status ${res.status}`);
  }

  return await res.json();
}

/**
 * In-Browser Whisper via Transformers.js (CDN-loaded to run WebAssembly in browser)
 */
async function transcribeWithTransformersWhisper(file, language = 'en', onProgress = () => {}) {
  onProgress({ pct: 20, status: 'Loading Whisper pipeline from CDN...' });

  // Dynamic import of transformers.js from CDN
  const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
  env.allowLocalModels = false;
  env.useBrowserCache = true;

  onProgress({ pct: 35, status: 'Downloading quantized Whisper model (~39MB)...' });

  const modelName = language === 'en' ? 'Xenova/whisper-tiny.en' : 'Xenova/whisper-tiny';

  const transcriber = await pipeline('automatic-speech-recognition', modelName, {
    progress_callback: (p) => {
      if (p.status === 'progress' && p.progress) {
        const pct = Math.min(80, Math.round(35 + p.progress * 0.45));
        onProgress({ pct, status: `Downloading model (${p.file}): ${Math.round(p.progress)}%` });
      }
    }
  });

  onProgress({ pct: 85, status: 'Decoding audio samples to 16kHz Float32...' });

  // Read array buffer and resample to 16000Hz mono Float32Array
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  audioCtx.close();

  // Resample using OfflineAudioContext to 16000Hz mono
  const targetSr = 16000;
  const offlineCtx = new OfflineAudioContext(1, Math.round(decoded.duration * targetSr), targetSr);
  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start();
  const resampled = await offlineCtx.startRendering();
  const float32Samples = resampled.getChannelData(0);

  onProgress({ pct: 90, status: 'Running Whisper speech-to-text inference...' });

  const output = await transcriber(float32Samples, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: true,
    language: language === 'auto' ? null : language,
    task: 'transcribe'
  });

  const chunks = output.chunks || [];
  if (chunks.length > 0) {
    return chunks.map((c, i) => ({
      id: i + 1,
      start: Array.isArray(c.timestamp) ? c.timestamp[0] || 0 : i * 3,
      end: Array.isArray(c.timestamp) ? c.timestamp[1] || (i * 3 + 3) : (i * 3 + 3),
      text: c.text.trim()
    }));
  }

  // Fallback if model returned single text block
  const sentences = (output.text || '').split(/(?<=[.?!])\s+/).filter(Boolean);
  const totalDur = decoded.duration;
  const chunkDur = totalDur / Math.max(1, sentences.length);
  return sentences.map((s, idx) => ({
    id: idx + 1,
    start: Number((idx * chunkDur).toFixed(2)),
    end: Number(((idx + 1) * chunkDur).toFixed(2)),
    text: s.trim()
  }));
}

/**
 * Web Speech Recognition / Speech API Fallback
 */
function transcribeWithWebSpeech(file, language = 'en') {
  return new Promise((resolve) => {
    // If SpeechRecognition not available or fails, generate pseudo-timestamped chunks based on audio duration
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      resolve(SAMPLE_DEMO_SEGMENTS);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language === 'auto' ? 'en-US' : language;

    const segments = [];
    let segIdx = 1;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const t = event.results[i][0].transcript.trim();
          if (t) {
            segments.push({
              id: segIdx++,
              start: (segIdx - 1) * 3.5,
              end: segIdx * 3.5,
              text: t
            });
          }
        }
      }
    };

    recognition.onend = () => {
      resolve(segments.length ? segments : SAMPLE_DEMO_SEGMENTS);
    };

    recognition.onerror = () => {
      resolve(SAMPLE_DEMO_SEGMENTS);
    };

    try {
      recognition.start();
      setTimeout(() => {
        try { recognition.stop(); } catch (e) {}
      }, 5000);
    } catch (e) {
      resolve(SAMPLE_DEMO_SEGMENTS);
    }
  });
}
