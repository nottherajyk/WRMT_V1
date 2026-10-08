// ===== TOOLS DATA =====

// SVG icon helper — returns a consistent, sized inline SVG string
const svg = (path, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${path}</svg>`;

// ── Image Tool Icons ──
const ICON_IMAGE_CONVERT = svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>');
const ICON_VECTOR        = svg('<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>');
const ICON_CODE          = svg('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>');
const ICON_COMPRESS      = svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>');
const ICON_CROP          = svg('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>');
const ICON_INVERT        = svg('<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/>');
const ICON_KEY           = svg('<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>');
const ICON_BW            = svg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="22"/>');

// ── PDF Tool Icons ──
const ICON_DOC_CONVERT   = svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>');
const ICON_PDF_COMPRESS  = svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>');
const ICON_LINK          = svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>');
const ICON_LOCK          = svg('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>');
const ICON_UNLOCK        = svg('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>');
const ICON_META          = svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>');
const ICON_MERGE         = svg('<line x1="17" y1="1" x2="17" y2="11"/><path d="M9 7L3 13l6 6"/><path d="M3 13h14a4 4 0 0 0 0-8h-1"/>');
const ICON_SPLIT         = svg('<line x1="17" y1="1" x2="17" y2="11"/><line x1="7" y1="1" x2="7" y2="11"/><path d="M3 7l4-4 4 4"/><path d="M13 7l4-4 4 4"/><path d="M3 17l4 4 4-4"/><path d="M13 17l4 4 4-4"/>');
const ICON_PPT           = svg('<path d="M4 3h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2z"/><path d="M9 7h4a2 2 0 0 1 0 4H9v4"/>');
const ICON_EXCEL         = svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13l3 4"/><path d="M11 13l-3 4"/><line x1="14" y1="13" x2="17" y2="13"/><line x1="14" y1="17" x2="17" y2="17"/>');
const ICON_EDIT          = svg('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>');
const ICON_SIGN          = svg('<path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L20 7.5V13"/><path d="M16 19h6"/><path d="M17 16l4 4-2 2-4-4z"/>');
const ICON_WATERMARK     = svg('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 9v6"/><path d="M9 12h6"/>');
const ICON_ROTATE        = svg('<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M22 12.5a10 10 0 0 1-18.8 4.2L2.5 16"/>');
const ICON_HTML          = svg('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/>');
const ICON_ORGANIZE      = svg('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>');
const ICON_TRASH         = svg('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>');
const ICON_EXTRACT       = svg('<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>');
const ICON_PDFA          = svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 17v-6h3a2 2 0 0 1 0 4H9"/><circle cx="15" cy="15" r="2"/>');
const ICON_REPAIR        = svg('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>');
const ICON_PAGENUM       = svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="15" r="2"/><line x1="12" y1="13" x2="12" y2="15"/>');
const ICON_SCAN          = svg('<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="4" y1="12" x2="20" y2="12"/>');
const ICON_OCR           = svg('<path d="M4 7V4h3"/><path d="M20 7V4h-3"/><path d="M4 17v3h3"/><path d="M20 17v3h-3"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="15" x2="15" y2="15"/>');
const ICON_COMPARE       = svg('<rect x="2" y="3" width="9" height="18" rx="2"/><rect x="13" y="3" width="9" height="18" rx="2"/><line x1="9" y1="12" x2="13" y2="12"/>');
const ICON_REDACT        = svg('<rect x="3" y="11" width="18" height="8" rx="1" fill="currentColor"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>');
const ICON_CROP_PDF      = svg('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>');
const ICON_FORMS         = svg('<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/><line x1="7" y1="16" x2="11" y2="16"/>');
const ICON_SUMMARIZE     = svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/><path d="M17 10l2-2m0 0l-2-2m2 2h-4"/>');
const ICON_TRANSLATE     = svg('<path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/>');
const ICON_MARKDOWN      = svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 15V9l3 3 3-3v6"/><path d="M17 13l-2 2m0 0l-2-2m2 2v-4"/>');

// ── Social Tool Icons ──
const ICON_YOUTUBE       = svg('<path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor"/>');
const ICON_TAGS          = svg('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>');
const ICON_INSTAGRAM     = svg('<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>');
const ICON_DOWNLOAD      = svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>');
const ICON_PINTEREST     = svg('<path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.267.641 1.267 1.408 0 .858-.546 2.141-.828 3.33-.236.995.499 1.806 1.476 1.806 1.772 0 3.136-1.867 3.136-4.561 0-2.385-1.715-4.051-4.163-4.051-2.835 0-4.498 2.126-4.498 4.322 0 .856.33 1.773.741 2.274a.3.3 0 0 1 .069.288c-.076.312-.244.995-.276 1.134-.044.183-.145.222-.334.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.967-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>');
const ICON_SPOTIFY       = svg('<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.308-1.758-8.793-.963-.335.077-.67-.133-.746-.467-.077-.334.132-.67.467-.745 3.816-.871 7.087-.496 9.722 1.115.293.18.386.563.207.853zm1.23-2.737c-.226.367-.706.482-1.072.257-2.687-1.652-6.785-2.131-9.965-1.166-.413.126-.848-.106-.973-.519-.125-.413.106-.848.519-.973 3.632-1.102 8.147-.568 11.234 1.328.366.226.481.707.257 1.073zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.501.153-1.03-.131-1.183-.633-.153-.502.131-1.03.633-1.183 3.535-1.073 9.404-.866 12.983 1.258.452.268.602.852.334 1.304-.268.451-.852.602-1.304.334z" fill="currentColor"/>');

// ── Audio Tool Icons ──
const ICON_MP4_TO_MP3   = svg('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M7 21h10"/><path d="M12 17v4"/><polygon points="10 7 15 10 10 13 10 7" fill="currentColor"/>');
const ICON_TRANSCRIBE   = svg('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>');
const CAT_AUDIO         = svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>');

// ── Text Tool Icons ──
const ICON_COUNTER       = svg('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>');
const ICON_PASSWORD      = svg('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/>');
const ICON_BINARY        = svg('<path d="M4 6h2v4H4z" fill="currentColor"/><path d="M8 4h2v8H8z" fill="currentColor"/><path d="M14 10h2v4h-2z" fill="currentColor"/><path d="M18 6h2v4h-2z" fill="currentColor"/>');
const ICON_TEXT_EDIT     = svg('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>');
const ICON_TERMINAL      = svg('<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>');
const ICON_CAPITALIZE    = svg('<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>');
const ICON_CASE_UP       = svg('<path d="M8 6l4-4 4 4"/><line x1="12" y1="2" x2="12" y2="14"/><path d="M4 18h16"/>');
const ICON_CASE_DOWN     = svg('<path d="M8 18l4 4 4-4"/><line x1="12" y1="22" x2="12" y2="10"/><path d="M4 6h16"/>');
const ICON_REVERSE       = svg('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>');
const ICON_SHUFFLE       = svg('<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>');
const ICON_REPEAT        = svg('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>');
const ICON_NETWORK       = svg('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>');
const ICON_HASH          = svg('<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>');
const ICON_IMAGE_TEXT    = svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>');
const ICON_BOOK          = svg('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>');
const ICON_DICE          = svg('<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>');

export const tools = [
  // ===== IMAGE TOOLS =====
  { id:'webp-to-jpg',      name:'WEBP to JPG',           desc:'Convert WEBP Image to JPG Online.',                                      category:'image',  icon: ICON_IMAGE_CONVERT },
  { id:'jpg-to-svg',       name:'JPG to SVG',            desc:'Convert JPG/JPEG Image to SVG Online.',                                  category:'image',  icon: ICON_VECTOR        },
  { id:'base64-to-image',  name:'BASE64 to Image',       desc:'Easily convert BASE64 format to an image online.',                       category:'image',  icon: ICON_CODE          },
  { id:'compress-image',   name:'Compress Image',        desc:'Easily reduce the size of an image.',                                    category:'image',  icon: ICON_COMPRESS      },
  { id:'png-to-jpg',       name:'PNG to JPG',            desc:'Convert PNG Image to JPG Online.',                                       category:'image',  icon: ICON_IMAGE_CONVERT },
  { id:'svg-to-png',       name:'SVG to PNG',            desc:'Convert SVG Image to PNG Online.',                                       category:'image',  icon: ICON_VECTOR        },
  { id:'png-to-svg',       name:'PNG to SVG',            desc:'Convert PNG Image to SVG Online.',                                       category:'image',  icon: ICON_VECTOR        },
  { id:'image-cropper',    name:'Image Cropper',         desc:'Crop JPG, PNG or GIF by defining a rectangle in pixels.',                category:'image',  icon: ICON_CROP          },
  { id:'invert-colors',    name:'Invert Image Colors',   desc:'Easily invert the colors of an image online.',                           category:'image',  icon: ICON_INVERT        },
  { id:'jpg-to-png',       name:'JPG to PNG',            desc:'Convert JPG/JPEG Image to PNG Online.',                                  category:'image',  icon: ICON_IMAGE_CONVERT },
  { id:'image-to-base64',  name:'Image to BASE64',       desc:'Easily convert an image to BASE64 format online.',                      category:'image',  icon: ICON_KEY           },
  { id:'black-and-white',  name:'Black & White',         desc:'Easily convert an image to black and white online.',                    category:'image',  icon: ICON_BW            },

  // ===== PDF TOOLS =====
  { id:'merge-pdf',        name:'Merge PDF',             desc:'Easily merge multiple PDFs into one in the order you want.',           category:'pdf', section:'Organize PDF', isWorkflow: true, icon: ICON_MERGE         },
  { id:'split-pdf',        name:'Split PDF',             desc:'Split a PDF into separate files by page or custom ranges.',            category:'pdf', section:'Organize PDF', isWorkflow: true, icon: ICON_SPLIT         },
  { id:'organize-pdf',     name:'Organize PDF',          desc:'Rearrange, rotate, delete, or duplicate pages in your PDF document.',   category:'pdf', section:'Organize PDF', icon: ICON_ORGANIZE      },
  { id:'remove-pages',     name:'Remove Pages',          desc:'Select and delete unwanted pages from your PDF file.',                  category:'pdf', section:'Organize PDF', icon: ICON_TRASH         },
  { id:'extract-pages',    name:'Extract Pages',         desc:'Extract specific pages or page ranges from a PDF into new files.',      category:'pdf', section:'Organize PDF', icon: ICON_EXTRACT       },
  { id:'rotate-pdf',       name:'Rotate PDF',            desc:'Rotate all or individual pages in your PDF document with one click.',   category:'pdf', section:'Organize PDF', icon: ICON_ROTATE        },
  { id:'crop-pdf',         name:'Crop PDF',              desc:'Crop PDF margins or select custom rectangular page areas.',             category:'pdf', section:'Organize PDF', icon: ICON_CROP_PDF      },

  { id:'compress-pdf',     name:'Compress PDF',          desc:'Reduce the file size of your PDF while keeping maximum quality.',       category:'pdf', section:'Optimize PDF', isWorkflow: true, icon: ICON_PDF_COMPRESS },
  { id:'repair-pdf',       name:'Repair PDF',            desc:'Recover data and fix structural damage in corrupted PDF documents.',    category:'pdf', section:'Optimize PDF', icon: ICON_REPAIR        },
  { id:'pdf-to-pdfa',      name:'PDF to PDF/A',          desc:'Transform PDF into ISO-standardized PDF/A format for long-term archiving.', category:'pdf', section:'Optimize PDF', icon: ICON_PDFA },

  { id:'pdf-to-word',      name:'PDF to Word',           desc:'Convert PDF documents to editable Microsoft Word DOCX files.',          category:'pdf', section:'Convert PDF',  isWorkflow: true, icon: ICON_DOC_CONVERT  },
  { id:'pdf-to-powerpoint',name:'PDF to PowerPoint',     desc:'Convert PDF slides into editable Microsoft PowerPoint (PPTX) presentations.', category:'pdf', section:'Convert PDF', icon: ICON_PPT },
  { id:'pdf-to-excel',     name:'PDF to Excel',          desc:'Pull table and text data straight from PDFs into Excel spreadsheets.', category:'pdf', section:'Convert PDF',  icon: ICON_EXCEL         },
  { id:'word-to-pdf',      name:'Word to PDF',           desc:'Convert Microsoft Word DOCX files to PDF documents online.',           category:'pdf', section:'Convert PDF',  icon: ICON_DOC_CONVERT  },
  { id:'powerpoint-to-pdf',name:'PowerPoint to PDF',     desc:'Convert Microsoft PowerPoint (PPTX) presentations into PDF documents.', category:'pdf', section:'Convert PDF',  icon: ICON_PPT },
  { id:'excel-to-pdf',     name:'Excel to PDF',          desc:'Convert Microsoft Excel spreadsheets and CSV tables into PDF documents.', category:'pdf', section:'Convert PDF',  icon: ICON_EXCEL },
  { id:'pdf-to-images',    name:'PDF to JPG',            desc:'Convert PDF pages into high-quality JPG or PNG images client-side.',   category:'pdf', section:'Convert PDF',  icon: ICON_IMAGE_CONVERT },
  { id:'jpg-to-pdf',       name:'JPG to PDF',            desc:'Easily convert JPG, PNG, and WEBP images into a unified PDF.',          category:'pdf', section:'Convert PDF',  icon: ICON_DOC_CONVERT   },
  { id:'html-to-pdf',      name:'HTML to PDF',           desc:'Convert raw HTML code, rich web text, or URLs into PDF documents.',    category:'pdf', section:'Convert PDF',  icon: ICON_HTML          },
  { id:'pdf-to-markdown',  name:'PDF to Markdown',       desc:'Convert PDF pages into clean Markdown formatting for notes and LLMs.',  category:'pdf', section:'Convert PDF',  icon: ICON_MARKDOWN      },

  { id:'edit-pdf',         name:'Edit PDF',              desc:'Add text, shapes, drawings, and freehand annotations directly to your PDF.', category:'pdf', section:'Edit PDF', isWorkflow: true, icon: ICON_EDIT },
  { id:'add-page-numbers', name:'Page Numbers',          desc:'Add customizable page numbers, headers, and footers to your PDF.',      category:'pdf', section:'Edit PDF',     icon: ICON_PAGENUM       },
  { id:'pdf-watermark',    name:'Watermark PDF',         desc:'Stamp custom text or image watermarks across your PDF pages.',          category:'pdf', section:'Edit PDF',     icon: ICON_WATERMARK     },
  { id:'pdf-forms',        name:'PDF Forms',             desc:'Fill out, edit, and flatten interactive PDF form fields seamlessly.',   category:'pdf', section:'Edit PDF',     icon: ICON_FORMS         },

  { id:'sign-pdf',         name:'Sign PDF',              desc:'Sign documents with drawn, typed, or uploaded electronic signatures.',  category:'pdf', section:'PDF Security', isWorkflow: true, icon: ICON_SIGN          },
  { id:'protect-pdf',      name:'Protect PDF',           desc:'Easily protect and encrypt a PDF file with a secure password.',        category:'pdf', section:'PDF Security', icon: ICON_LOCK          },
  { id:'unlock-pdf',       name:'Unlock PDF',            desc:'Easily unlock and remove security passwords from your PDF files.',     category:'pdf', section:'PDF Security', icon: ICON_UNLOCK        },
  { id:'redact-pdf',       name:'Redact PDF',            desc:'Permanently mask and redact confidential text or areas in a PDF.',      category:'pdf', section:'PDF Security', icon: ICON_REDACT        },

  { id:'scan-to-pdf',      name:'Scan to PDF',           desc:'Capture document scans using your camera and compile them into a PDF.', category:'pdf', section:'PDF Intelligence', isWorkflow: true, icon: ICON_SCAN          },
  { id:'ocr-pdf',          name:'OCR PDF',               desc:'Extract text from scanned PDFs and generate searchable text documents.', category:'pdf', section:'PDF Intelligence', icon: ICON_OCR           },
  { id:'compare-pdf',      name:'Compare PDF',           desc:'Side-by-side visual and text diff comparison between two PDF documents.', category:'pdf', section:'PDF Intelligence', icon: ICON_COMPARE      },
  { id:'pdf-summarize',    name:'AI Summarizer',         desc:'Generate key takeaways, executive summaries, and briefs from your PDF.', category:'pdf', section:'PDF Intelligence', icon: ICON_SUMMARIZE     },
  { id:'translate-pdf',    name:'Translate PDF',         desc:'Translate text in your PDF document into over 30 languages.',           category:'pdf', section:'PDF Intelligence', icon: ICON_TRANSLATE     },
  { id:'pdf-metadata',     name:'PDF Metadata',          desc:"Easily preview, view, and inspect a PDF's internal metadata.",          category:'pdf', section:'PDF Intelligence', icon: ICON_META          },
  { id:'acrobat-downloader',name:'Acrobat Link Downloader',desc:'Download or convert files from any Adobe Acrobat public shared link.',category:'pdf', section:'PDF Intelligence', icon: ICON_LINK         },

  // ===== SOCIAL MEDIA TOOLS =====
  { id:'spotify-downloader',    name:'Spotify Playlist Downloader', desc:'Download high-quality MP3 songs directly from any Spotify playlist, album, or track link.', category:'social', icon: ICON_SPOTIFY },
  { id:'thumbnail-grabber',     name:'Thumbnail Grabber',          desc:'Easily download thumbnail images from a YouTube video.',        category:'social', icon: ICON_YOUTUBE   },
  { id:'youtube-tags',          name:'YouTube Tags Extractor',     desc:'Extract tags from a YouTube video.',                            category:'social', icon: ICON_TAGS      },
  { id:'instagram-downloader',  name:'Instagram Post Downloader',  desc:'Easily download any post images from Instagram.',              category:'social', icon: ICON_INSTAGRAM },
  { id:'youtube-downloader',    name:'YouTube Video Downloader',   desc:'Download YouTube videos in different qualities (MP4).',        category:'social', icon: ICON_DOWNLOAD },
  { id:'pinterest-downloader',  name:'Pinterest Image Downloader', desc:'Download Pinterest images in full native resolution.',         category:'social', icon: ICON_PINTEREST },

  // ===== AUDIO TOOLS =====
  { id:'mp4-to-mp3',        name:'MP4 to MP3',            desc:'Extract crystal clear MP3 audio from MP4 video files with custom bitrates and trimming.', category:'audio', isWorkflow: true, icon: ICON_MP4_TO_MP3 },
  { id:'mp3-to-text',       name:'MP3 to Text Transcriber', desc:'Transcribe speech from MP3 audio into TXT, SRT, VTT, JSON, Markdown, and CSV formats.', category:'audio', isWorkflow: true, icon: ICON_TRANSCRIBE },

  // ===== TEXT & LISTS TOOLS =====
  { id:'character-counter', name:'Character Counter',         desc:'Easily count the number of characters in a text.',        category:'text', icon: ICON_COUNTER   },
  { id:'password-generator',name:'Password Generator',        desc:'Easily generate a secure and random password.',           category:'text', icon: ICON_PASSWORD  },
  { id:'text-to-binary',    name:'Text to Binary',            desc:'Easily convert text to binary format.',                   category:'text', icon: ICON_BINARY    },
  { id:'binary-to-text',    name:'Binary to Text',            desc:'Easily convert binary to readable text.',                 category:'text', icon: ICON_BINARY    },
  { id:'text-to-ascii',     name:'Text to ASCII',             desc:'Easily convert text to ASCII codes.',                     category:'text', icon: ICON_TERMINAL  },
  { id:'ascii-to-text',     name:'ASCII to Text',             desc:'Easily convert ASCII codes to readable text.',            category:'text', icon: ICON_TERMINAL  },
  { id:'capitalize-words',  name:'Capitalize Words',          desc:'Easily capitalize the first letter of each word.',        category:'text', icon: ICON_CAPITALIZE},
  { id:'uppercase-text',    name:'Uppercase Text',            desc:'Easily convert text to uppercase.',                       category:'text', icon: ICON_CASE_UP   },
  { id:'lowercase-text',    name:'Lowercase Text',            desc:'Easily convert text to lowercase.',                       category:'text', icon: ICON_CASE_DOWN },
  { id:'reverse-list',      name:'Reverse List',              desc:'Easily reverse the elements of a list online.',           category:'text', icon: ICON_REVERSE   },
  { id:'randomize-list',    name:'Randomize List',            desc:'Easily randomize the elements of a list online.',         category:'text', icon: ICON_SHUFFLE   },
  { id:'repeat-text',       name:'Repeat Text',               desc:'Easily repeat a text multiple times online.',             category:'text', icon: ICON_REPEAT    },
  { id:'ip-to-binary',      name:'IP to Binary',              desc:'Easily convert IP addresses to binary format.',           category:'text', icon: ICON_NETWORK   },
  { id:'numbers-to-words',  name:'Numbers to Words',          desc:'Easily convert a number to readable words.',              category:'text', icon: ICON_HASH      },
  { id:'text-to-image',     name:'Convert Text to Image',     desc:'Convert a text to an image online.',                     category:'text', icon: ICON_IMAGE_TEXT},
  { id:'bionic-reading',    name:'Bionic Reading Converter',  desc:'Convert text to bionic reading to read faster.',         category:'text', icon: ICON_BOOK      },
  { id:'random-object',     name:'Random Object Generator',   desc:'Generate a list of random objects.',                     category:'text', icon: ICON_DICE      },
];

// Category SVG icons
const CAT_IMAGE  = svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>');
const CAT_PDF    = svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>');
const CAT_SOCIAL = svg('<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>');
const CAT_TEXT   = svg('<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>');

export const categories = [
  { id:'all',    name:'All Tools',   icon: svg('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>') },
  { id:'image',  name:'Image Tools', icon: CAT_IMAGE,  gradient:'var(--cat-image)'  },
  { id:'pdf',    name:'PDF Tools',   icon: CAT_PDF,    gradient:'var(--cat-pdf)'    },
  { id:'audio',  name:'Audio Tools', icon: CAT_AUDIO,  gradient:'var(--cat-audio)'  },
  { id:'social', name:'Social Media',icon: CAT_SOCIAL, gradient:'var(--cat-social)' },
  { id:'text',   name:'Text & Lists',icon: CAT_TEXT,   gradient:'var(--cat-text)'   },
];
