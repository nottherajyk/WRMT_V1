# wherearemytools – All-in-One Online Tools

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ESM-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Client--Side-brightgreen)](#-privacy--security)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com)

**wherearemytools** is a blazing-fast, modern, privacy-first all-in-one web utility suite that brings together over 45+ essential productivity tools under a single, unified interface. Designed from the ground up for speed, local execution, and total user privacy, all file manipulations (images, PDFs, documents, text operations) happen directly in the user's browser using HTML5 Canvas, WebAssembly, and JavaScript client-side processing without uploading files to external servers.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Complete Tool Catalog](#-complete-tool-catalog)
  - [🖼️ Image Tools](#️-image-tools)
  - [📄 PDF Suite](#-pdf-suite)
  - [🎙️ Audio & Speech Suite](#️-audio--speech-suite)
  - [📱 Social Media & Media Grabbers](#-social-media--media-grabbers)
  - [📝 Text & Data Utilities](#-text--data-utilities)
- [Tech Stack](#-tech-stack)
- [Architecture & Design](#-architecture--design)
  - [Directory Structure](#directory-structure)
  - [Client-Side Execution Flow](#client-side-execution-flow)
  - [Serverless API Layer](#serverless-api-layer)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [API Reference](#-api-reference)
- [Privacy & Security Guarantees](#-privacy--security-guarantees)
- [Deployment](#-deployment)
  - [Deploying to Vercel (Recommended)](#1-deploying-to-vercel-recommended)
  - [Docker Deployment](#2-docker-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

- 🔒 **Zero Server File Uploads**: Image conversions, PDF modifications, and text formatting happen entirely within the client's browser memory.
- ⚡ **Instant Client-Side Processing**: Near-instantaneous transforms powered by optimized WebAssembly engines (`pdf-lib`, `jspdf`, `browser-image-compression`).
- 🎨 **Modern Dark & Fluid UI**: Fully responsive CSS architecture featuring glassmorphism accents, smooth CSS micro-interactions, drag-and-drop dropzones, and unified modal alerts.
- 📦 **Zero-Config Local Development**: Built-in Vite middleware simulates serverless functions locally without requiring external CLI emulators.
- 📱 **Cross-Device Compatibility**: High-performance UI optimized for mobile touchscreens, tablets, and desktop workstations alike.
- 🔍 **Live Search & Fuzzy Navigation**: Instantly filter and navigate between 45+ tools using keyboard shortcuts and fuzzy category search.

---

## 🧰 Complete Tool Catalog

### 🖼️ Image Tools
High-performance batch and single image operations running directly through HTML5 Canvas & WebAssembly:

| Tool | ID | Description |
| :--- | :--- | :--- |
| **WEBP to JPG** | `webp-to-jpg` | Convert WEBP images to universal high-quality JPG format. |
| **JPG to SVG** | `jpg-to-svg` | Vectorize bitmap raster graphics into scalable SVG paths. |
| **PNG to JPG** | `png-to-jpg` | Convert PNG images to compressed JPG with custom quality sliders. |
| **SVG to PNG** | `svg-to-png` | Render vector SVG files into crisp PNG bitmaps at native DPI. |
| **PNG to SVG** | `png-to-svg` | Trace and convert PNG graphics into clean SVG vector markup. |
| **JPG to PNG** | `jpg-to-png` | Convert JPG files into lossless PNG format. |
| **Compress Image** | `compress-image` | Intelligently reduce image file size while preserving visual fidelity. |
| **Image Cropper** | `image-cropper` | Pixel-level rectangle cropping, aspect ratio locks, and presets. |
| **Invert Colors** | `invert-colors` | Invert image RGB channels for negative / high-contrast effects. |
| **Black & White** | `black-and-white` | Convert color photographs into balanced grayscale compositions. |
| **Image to BASE64** | `image-to-base64` | Encode images into Base64 Data URI strings for web embedding. |
| **BASE64 to Image** | `base64-to-image` | Decode Base64 data strings into downloadable image files. |

---

### 📄 PDF Suite
A full-featured PDF powerhouse covering organization, conversion, page editing, digital signing, and metadata extraction:

#### 1. Organize & Optimize
- **Merge PDF (`merge-pdf`)**: Combine multiple PDF files into one in custom drag-and-drop order.
- **Split PDF (`split-pdf`)**: Extract specific pages or split documents by custom page intervals.
- **Organize PDF (`organize-pdf`)**: Reorder, rotate, duplicate, or delete individual pages visually.
- **Remove Pages (`remove-pages`)**: Selectively purge unwanted pages from any PDF document.
- **Extract Pages (`extract-pages`)**: Carve out specific page subsets into standalone PDF documents.
- **Rotate PDF (`rotate-pdf`)**: Apply 90°, 180°, or 270° orientation corrections across pages.
- **Crop PDF (`crop-pdf`)**: Adjust margins and crop visible canvas boundaries.
- **Compress PDF (`compress-pdf`)**: Downsample raster assets and prune structural overhead to shrink PDFs.
- **Repair PDF (`repair-pdf`)**: Rebuild damaged cross-reference tables and recover corrupted files.
- **PDF to PDF/A (`pdf-to-pdfa`)**: Convert documents to ISO-compliant archival standards.

#### 2. Convert to & from PDF
- **PDF to Word (`pdf-to-word`)**: Export PDF content into editable Microsoft Word (`.docx`) files.
- **Word to PDF (`word-to-pdf`)**: Compile Word documents into standardized PDF outputs.
- **PDF to PowerPoint (`pdf-to-powerpoint`)**: Convert PDF slides into editable Microsoft PowerPoint (`.pptx`) decks.
- **PowerPoint to PDF (`powerpoint-to-pdf`)**: Render presentation slides directly to PDF.
- **PDF to Excel (`pdf-to-excel`)**: Parse structured tabular data into Microsoft Excel (`.xlsx`) workbooks.
- **Excel to PDF (`excel-to-pdf`)**: Transform spreadsheets and CSVs into clean paginated PDFs.
- **PDF to JPG (`pdf-to-images`)**: Render each PDF page as an independent high-res JPG/PNG image.
- **JPG to PDF (`jpg-to-pdf`)**: Stitch image galleries into a multi-page PDF document.
- **HTML to PDF (`html-to-pdf`)**: Render rich HTML templates or raw code into print-ready PDFs.
- **PDF to Markdown (`pdf-to-markdown`)**: Extract text structures into Markdown format for LLM ingestion.

#### 3. Edit, Secure & Analyze
- **Edit PDF (`edit-pdf`)**: Annotate documents with custom text, highlights, shapes, and freehand markup.
- **Page Numbers (`add-page-numbers`)**: Add customized pagination, headers, and footers.
- **Watermark PDF (`pdf-watermark`)**: Overlay text or graphic stamps with adjustable opacity and rotation.
- **PDF Forms (`pdf-forms`)**: Fill interactive form fields and export flattened results.
- **Sign PDF (`sign-pdf`)**: Place drawn, typed, or uploaded electronic signatures onto document pages.
- **Protect PDF (`protect-pdf`)**: Encrypt PDF files with 128-bit / 256-bit password locks.
- **Unlock PDF (`unlock-pdf`)**: Decrypt and strip password restrictions from owned PDF documents.
- **Redact PDF (`redact-pdf`)**: Irreversibly black out confidential text blocks and sensitive figures.
- **Scan to PDF (`scan-to-pdf`)**: Capture multi-page documents directly through your device camera.
- **OCR PDF (`ocr-pdf`)**: Optical Character Recognition engine to extract searchable text from scans.
- **Compare PDF (`compare-pdf`)**: Visual and text diff comparisons between two PDF revisions.
- **AI Summarizer (`pdf-summarize`)**: Generate key takeaways, executive briefs, and index points.
- **Translate PDF (`translate-pdf`)**: Multilingual document translation across 30+ spoken languages.
- **PDF Metadata (`pdf-metadata`)**: Inspect, view, and edit embedded Dublin Core / XMP metadata tags.
- **Acrobat Downloader (`acrobat-downloader`)**: Fetch public Adobe Acrobat shared assets.

---

### 🎙️ Audio & Speech Suite
Client-side audio extraction, encoding, and AI-powered speech-to-text transcription:

- **MP4 to MP3 Converter (`mp4-to-mp3`)**: Extract high-fidelity MP3 or WAV audio tracks from MP4, WebM, MOV, and MKV video files client-side. Features customizable bitrates (96 kbps to 320 kbps), volume boosting (50% to 200%), and interactive timestamp range trimming.
- **MP3 to Text Transcriber (`mp3-to-text`)**: Transcribe speech from MP3, WAV, M4A, and FLAC audio files with segment-level timestamps. Multi-engine support including 100% private in-browser Whisper AI (Transformers.js), ultra-fast Cloud Whisper API (Groq/OpenAI), and Web Speech recognition. Exports clean transcripts across 6 formats:
  - **Plain Text (`.txt`)**: Clean text transcript with optional timestamp toggle.
  - **SubRip Subtitles (`.srt`)**: Standard subtitle format with microsecond timestamp blocks.
  - **WebVTT (`.vtt`)**: Web standard video text track subtitles.
  - **JSON (`.json`)**: Structured transcript data with metadata, word counts, and segment arrays.
  - **Markdown (`.md`)**: Formatted document with properties table and blockquoted dialogue.
  - **CSV / Excel (`.csv`)**: Tabular dataset with start/end timestamps, duration, and text.
  - **Download All as ZIP (`.zip`)**: One-click archive bundling all 6 formats together.

---

### 📱 Social Media & Media Grabbers
- **Spotify Playlist Downloader (`spotify-downloader`)**: Resolve Spotify playlists, albums, and tracks with artwork and audio metadata.
- **YouTube Video Downloader (`youtube-downloader`)**: Fetch YouTube streams across multiple video resolutions and audio streams.
- **Thumbnail Grabber (`thumbnail-grabber`)**: Extract Full HD (1080p), HD, and SD thumbnails from YouTube videos.
- **YouTube Tags Extractor (`youtube-tags`)**: Inspect and copy ranking metadata and tags from public YouTube videos.
- **Instagram Post Downloader (`instagram-downloader`)**: Download carousel photos, reels, and video media from public posts.
- **Pinterest Image Downloader (`pinterest-downloader`)**: Extract original high-resolution uncompressed Pinterest pins.

---

### 📝 Text & Data Utilities
- **Character Counter (`character-counter`)**: Real-time analysis of characters, words, sentences, reading time, and density.
- **Password Generator (`password-generator`)**: Cryptographically secure generator with custom symbol sets and entropy indicators.
- **Text to Binary / Binary to Text (`text-to-binary`, `binary-to-text`)**: Bi-directional conversion between ASCII/UTF-8 strings and binary bytes.
- **Text to ASCII / ASCII to Text (`text-to-ascii`, `ascii-to-text`)**: Convert strings to decimal/hex ASCII representations.
- **Case Converters (`uppercase-text`, `lowercase-text`, `capitalize-words`)**: Title Case, UPPERCASE, lowercase, camelCase, and snake_case transformations.
- **List Utilities (`reverse-list`, `randomize-list`, `repeat-text`)**: Reorder, shuffle, and duplicate line items with custom delimiters.
- **IP to Binary (`ip-to-binary`)**: Convert IPv4 and IPv6 network addresses into binary subnet notation.
- **Numbers to Words (`numbers-to-words`)**: Convert numeric values into written currency and words.
- **Text to Image (`text-to-image`)**: Render formatted text and code snippets into shareable PNG cards.
- **Bionic Reading Converter (`bionic-reading`)**: Format text for rapid reading by emphasizing word fixation anchors.
- **Random Object Generator (`random-object`)**: Generate random words, nouns, and test dataset values.

---

## 🚀 Tech Stack

### Frontend & Core
- **Language**: Vanilla ECMAScript Modules (ESM) & HTML5
- **Styling**: Vanilla CSS (Custom Design System, CSS Variables, CSS Grid, Glassmorphism)
- **Routing**: Lightweight Hash-based Client-Side Router (`src/router.js`)
- **Build Tool**: [Vite 8.0+](https://vitejs.dev/)

### Client-Side Processing Engines
- **PDF Manipulation**: [`pdf-lib`](https://pdf-lib.js.org/) & [`jspdf`](https://github.com/parallax/jsPDF)
- **PDF Encryption**: `@pdfsmaller/pdf-encrypt-lite`
- **Image Compression**: [`browser-image-compression`](https://github.com/Donaldcwl/browser-image-compression)
- **Archive Generation**: [`jszip`](https://stuk.github.io/jszip/)
- **File Downloads**: [`file-saver`](https://github.com/eligrey/FileSaver.js/)

### Serverless & Backend Helpers
- **YouTube Extraction Engine**: [`@distube/ytdl-core`](https://github.com/distubejs/ytdl-core), [`youtubei.js`](https://github.com/LuanRT/YouTube.js), [`play-dl`](https://github.com/play-dl/play-dl)
- **Analytics**: [`@vercel/analytics`](https://vercel.com/analytics)
- **Serverless Platform**: Vercel Serverless Functions (`/api/*`)

---

## 🏗️ Architecture & Design

### Directory Structure

```
AIOT/
├── api/                             # Serverless backend functions (Vercel / Local Dev)
│   ├── acrobat-resolve.js           # Resolves Adobe Acrobat shared public links
│   ├── instagram.js                 # Instagram post scraper and media stream parser
│   ├── pinterest.js                 # High-resolution Pinterest pin image resolver
│   ├── spotify-download.js          # Audio download dispatcher for Spotify tracks
│   ├── spotify-info.js              # Spotify playlist/album metadata extractor
│   ├── youtube-download.js          # YouTube video/audio download streaming endpoint
│   └── youtube-info.js              # YouTube video metadata and formats inspector
├── public/                          # Public static assets & favicon
│   └── vite.svg
├── src/                             # Core frontend source code
│   ├── assets/                      # Application icons and static illustrations
│   ├── components/                  # Reusable UI components
│   │   ├── footer.js                # Global application footer
│   │   ├── navbar.js                # Navigation bar with category filter and search
│   │   └── toast.js                 # Toast notification system
│   ├── pages/                       # Page view controllers
│   │   ├── home.js                  # Homepage grid view and category filter logic
│   │   └── tool-page.js             # Dynamic tool runner host wrapper
│   ├── tools/                       # Tool implementation modules
│   │   ├── image-tools.js           # Image compressors, croppers, and format converters
│   │   ├── pdf-tools.js             # Comprehensive PDF suite engine (148KB of logic)
│   │   ├── social-tools.js          # Social media scrapers and canvas generators
│   │   └── text-tools.js            # String manipulation, cipher, and list transformers
│   ├── main.js                      # Application bootstrap, DOM hydration & theme setup
│   ├── router.js                    # Client-side hash router
│   ├── style.css                    # Unified CSS design system & typography tokens
│   ├── tools-data.js                # Centralized registry of all tools & categories
│   └── utils.js                     # Global utilities (DOM helpers, file downloads, toasts)
├── index.html                       # Single Page Application HTML entrypoint
├── package.json                     # Project manifest and dependency declarations
├── vercel.json                      # Vercel routing rules & API rewrites
└── vite.config.js                   # Vite config with custom local /api/ dev middleware
```

---

### Client-Side Execution Flow

```mermaid
flowchart TD
    User([User in Browser]) -->|Selects Tool / Drops File| UI[Dynamic Tool Controller]
    
    subgraph Client-Side Memory Sandbox
        UI -->|Image Operations| Canvas[HTML5 Canvas / browser-image-compression]
        UI -->|PDF Operations| PDFLib[pdf-lib / jspdf / pdf-encrypt-lite]
        UI -->|Text Operations| TextEngine[Native JavaScript ES Modules]
        
        Canvas -->|Processed ArrayBuffer| BlobGen[Blob Generator]
        PDFLib -->|Serialized Document| BlobGen
        TextEngine -->|Transformed Output| OutputDOM[Render to Screen / Clipboard]
    end
    
    BlobGen -->|Client-Side Download| FileSaver[Trigger Direct File Save]
    
    subgraph Remote Serverless Helper (Only When External Metadata Required)
        UI -->|Spotify / YouTube / IG Link| APIEndpoints[/api/ serverless routes]
        APIEndpoints -->|Sanitized JSON / Audio URL| UI
    end
```

---

### Serverless API Layer
While 95% of tools run 100% in the client's browser, media extraction features (e.g. YouTube audio metadata, Spotify track listing, Instagram carousels) utilize serverless endpoints located under `api/`:
- **Local Development**: Handled by the custom Vite middleware in `vite.config.js` (`vercelApiDevPlugin`), dynamically routing requests from `http://localhost:5173/api/*` to the matching JavaScript handler in `api/`.
- **Production**: Vercel automatically deploys each file in `api/*.js` as an isolated Node.js Serverless Function.

---

## 📋 Prerequisites

Before running this project locally, ensure you have:

- **Node.js**: `v18.0.0` or higher (`v20+` recommended)
- **Package Manager**: `npm` (v9+), `pnpm`, or `yarn`
- **Modern Browser**: Chrome, Firefox, Safari, or Edge supporting WebAssembly and HTML5 Canvas.

---

## ⚡ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/nottherajyk/AIOT_V1.git
cd AIOT_V1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Local Development Server
```bash
npm run dev
```

The application will start with hot-module reloading and local API support at:
```
http://localhost:5173
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with local serverless API middleware on port `5173`. |
| `npm run build` | Compiles and optimizes assets into the `dist/` directory for production. |
| `npm run preview` | Spins up a local web server to preview the production build in `dist/`. |

---

## 🔌 API Reference

The serverless functions in `api/` provide lightweight proxying and metadata parsing for social media utilities:

### `GET /api/youtube-info?url={videoUrl}`
Extracts title, thumbnail URLs, author, duration, and available stream qualities for a YouTube video.

### `GET /api/youtube-download?url={videoUrl}&quality={itag}`
Streams the selected video/audio stream directly to the client with appropriate `Content-Disposition` headers.

### `GET /api/spotify-info?url={spotifyUrl}`
Fetches track metadata, duration, cover art, and preview URLs from a Spotify playlist, album, or track URL.

### `GET /api/spotify-download?title={trackTitle}&artist={artistName}`
Resolves high-quality audio streams for a requested track and downloads the `.m4a` file.

### `GET /api/instagram?url={postUrl}`
Extracts full-resolution image URLs and video streams from public Instagram posts and reels.

### `GET /api/pinterest?url={pinUrl}`
Parses and returns original, uncompressed image URLs for a given Pinterest pin.

---

## 🔒 Privacy & Security Guarantees

1. **Client-Side Isolation**: Files processed by Image and PDF tools (e.g. merging sensitive tax documents, converting confidential images, signing contracts) **never leave your device**. They are manipulated in browser volatile memory (`ArrayBuffer` / `Blob`) and discarded upon tab closure.
2. **XSS Sanitization**: Dynamic user inputs, URL parameters, and API outputs are strictly sanitized with HTML encoding prior to DOM injection.
3. **No External Storage**: There is no database or persistent cloud storage attached to this application. No telemetry or file payloads are logged.

---

## 🌐 Deployment

### 1. Deploying to Vercel (Recommended)

This project is configured natively for Vercel:

1. Push your repository to GitHub / GitLab.
2. Import your project into the [Vercel Dashboard](https://vercel.com/new).
3. Vercel automatically detects the Vite framework and configures:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Serverless API Routes**: `api/`
4. Click **Deploy**.

Alternatively, deploy using the Vercel CLI:
```bash
npm i -g vercel
vercel
```

---

### 2. Docker Deployment

To containerize the application for self-hosted environments:

Create a `Dockerfile` in the root:
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production server stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/api ./api
COPY package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
```

Build and run:
```bash
docker build -t wherearemytools:latest .
docker run -d -p 3000:3000 --name my-tools wherearemytools:latest
```

---

## 🛠️ Troubleshooting

### Issue: Social media tool returns "Download Failed" or "Proxy Error"
- **Cause**: Instagram, YouTube, or Pinterest frequently rotate rate limits on public proxy endpoints.
- **Solution**: The application includes automatic fallback proxy chains. If an endpoint fails, verify that the URL is public (not from a private account) and retry after a few seconds.

### Issue: Large PDF or Image crashes or reloads page
- **Cause**: Browser memory limitations on mobile devices when handling extremely large files (100MB+).
- **Solution**: Use standard desktop browsers (Chrome/Firefox/Edge) for large batch conversions, or compress images prior to merging.

### Issue: Local `/api/` calls return 404 in custom dev servers
- **Cause**: Running with standard static servers instead of `npm run dev`.
- **Solution**: Always use `npm run dev` to ensure the custom `vercelApiDevPlugin` in `vite.config.js` is active.

---

## 🤝 Contributing

Contributions are welcome! To add a new tool or improve existing features:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/awesome-new-tool`).
3. Register your tool metadata in [`src/tools-data.js`](src/tools-data.js).
4. Implement your tool controller in [`src/tools/`](src/tools/).
5. Commit your changes (`git commit -m 'Add awesome new tool'`).
6. Push to the branch (`git push origin feature/awesome-new-tool`).
7. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.



