const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const pdfParse = require('pdf-parse');
const { marked } = require('marked');

var DOCS_DIR = './docs';
var OUTPUT_DIR = './output';
var SITE_URL = process.env.SITE_URL || 'http://localhost:8000';
var TEXT_THRESHOLD = 150;
var TESSERACT_LANG = 'ind+eng';
var PDFJS_VERSION = '3.11.174';
var PDFJS_URL = 'https://github.com/mozilla/pdf.js/releases/download/v' + PDFJS_VERSION + '/pdfjs-' + PDFJS_VERSION + '-dist.zip';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slugify(relPath) {
  return relPath.replace(/\\/g, '/').replace(/\//g, '__').replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getPrefix(depth) {
  var p = '';
  for (var i = 0; i < depth; i++) p += '../';
  return p || './';
}

// ========== SCAN FOLDER REKURSIF ==========
function walkDir(dir, relPath) {
  var entries = [];
  if (!fs.existsSync(dir)) return entries;
  var items = fs.readdirSync(dir, { withFileTypes: true });
  var folders = [];
  var files = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (item.name.startsWith('.')) continue;
    var full = path.join(dir, item.name);
    var rel = relPath ? relPath + '/' + item.name : item.name;

    if (item.isDirectory()) {
      folders.push({ type: 'folder', name: item.name, relPath: rel, children: walkDir(full, rel) });
    } else if (item.isFile()) {
      files.push({ type: 'file', name: item.name, relPath: rel, fullPath: full });
    }
  }

  return folders.concat(files);
}

// ========== PROSES FILE ==========
async function processPDF(filePath) {
  var filename = path.basename(filePath);
  console.log('  PDF: ' + filename);
  try {
    var buffer = fs.readFileSync(filePath);
    var data = await pdfParse(buffer);
    var numPages = data.numpages || 1;
    var avg = data.text ? data.text.length / numPages : 0;

    if (avg > TEXT_THRESHOLD && data.text && data.text.trim().length > 100) {
      console.log('    -> Text (' + Math.round(avg) + ' chars/page)');
      return { text: data.text, pages: numPages, method: 'text' };
    }

    console.log('    -> Scanned, OCR...');
    var tmp = '/tmp/ocr-' + Date.now();
    ensureDir(tmp);
    try {
      execSync('pdftoppm -png -r 300 "' + filePath + '" "' + tmp + '/page"', { stdio: 'pipe', timeout: 300000 });
      var pages = fs.readdirSync(tmp).filter(function(f) { return f.endsWith('.png'); }).sort();
      var ocr = '';
      for (var i = 0; i < pages.length; i++) {
        try {
          ocr += execSync('tesseract "' + path.join(tmp, pages[i]) + '" stdout -l ' + TESSERACT_LANG + ' --psm 6 2>/dev/null', { timeout: 120000 }).toString() + '\n\n';
        } catch(e) {}
      }
      console.log('    -> OCR done (' + pages.length + ' pages)');
      return { text: ocr || data.text || '', pages: pages.length || numPages, method: 'ocr' };
    } finally {
      try { execSync('rm -rf "' + tmp + '"'); } catch(e) {}
    }
  } catch(err) {
    console.error('    Error: ' + err.message);
    return { text: '', pages: 1, method: 'error' };
  }
}

function processMD(filePath) {
  var raw = fs.readFileSync(filePath, 'utf-8');
  console.log('  MD: ' + path.basename(filePath));
  var html = marked.parse ? marked.parse(raw) : marked(raw);
  return { text: raw, html: html, method: 'markdown' };
}

function processImage(filePath) {
  console.log('  IMG: ' + path.basename(filePath));
  try {
    var text = execSync('tesseract "' + filePath + '" stdout -l ' + TESSERACT_LANG + ' --psm 6 2>/dev/null', { timeout: 120000 }).toString();
    return { text: text, method: 'ocr-image' };
  } catch(e) {
    return { text: '', method: 'error' };
  }
}

// ========== GENERATE HTML ==========
function makeFolderHTML(folderName, relPath, entries, depth, allDocsCount) {
  var prefix = getPrefix(depth);
  var parts = relPath ? relPath.split('/') : [];
  var breadcrumb = '<a href="' + prefix + 'index.html" class="crumb">📁 Home</a>';
  var crumbPath = '';
  for (var i = 0; i < parts.length; i++) {
    crumbPath += (i > 0 ? '/' : '') + parts[i];
    var crumbLink = getPrefix(depth - i - 1) + 'index.html';
    if (i === parts.length - 1) {
      breadcrumb += ' <span class="sep">›</span> <span class="crumb-current">📂 ' + escapeHtml(parts[i]) + '</span>';
    } else {
      breadcrumb += ' <span class="sep">›</span> <a href="' + crumbLink + '" class="crumb">' + escapeHtml(parts[i]) + '</a>';
    }
  }

  var items = '';

  // Folders first
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.type !== 'folder') continue;
    var folderLink = e.name + '/index.html';
    var fileCount = countFiles(e.children);
    items += '<a href="' + folderLink + '" class="card folder-card">' +
      '<div class="icon">📁</div>' +
      '<div class="info">' +
        '<div class="fname">' + escapeHtml(e.name) + '</div>' +
        '<div class="meta">' + fileCount + ' file</div>' +
      '</div>' +
      '<div class="arrow">›</div>' +
    '</a>';
  }

  // Files
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.type !== 'file') continue;
    var ext = path.extname(e.name).toLowerCase();
    var icon = ext === '.pdf' ? '📄' : ext === '.md' ? '📝' : '🖼️';
    var slug = slugify(e.relPath);
    items += '<a href="' + prefix + 'view/' + slug + '.html" class="card">' +
      '<div class="icon">' + icon + '</div>' +
      '<div class="info">' +
        '<div class="fname">' + escapeHtml(e.name) + '</div>' +
        '<div class="meta">' + ext.toUpperCase().replace('.', '') + '</div>' +
      '</div>' +
    '</a>';
  }

  if (!items) {
    items = '<div class="empty">Folder ini kosong.</div>';
  }

  return '<!DOCTYPE html>' +
'<html lang="id">' +
'<head>' +
'  <meta charset="UTF-8">' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'  <title>' + escapeHtml(folderName || 'Documents') + '</title>' +
'  <style>' + getCSS() + '</style>' +
'</head>' +
'<body>' +
'  <div class="wrap">' +
'    <div class="breadcrumb">' + breadcrumb + '</div>' +
'    <h1>' + (folderName ? '📂 ' + escapeHtml(folderName) : '📚 Document Repository') + '</h1>' +
'    <p class="subtitle">' + allDocsCount + ' total dokumen · Full-Text Search · AI-Ready</p>' +
'    <input type="text" class="search-box" id="search" placeholder="Cari di semua dokumen..." autocomplete="off">' +
'    <div class="status-bar" id="status"></div>' +
'    <div id="list">' + items + '</div>' +
'  </div>' +
'  <script>' +
'    var docsData = [];' +
'    fetch("' + prefix + 'docs-data.json")' +
'      .then(function(r){ return r.json(); })' +
'      .then(function(d){ docsData = d; })' +
'      .catch(function(){});' +
'    var defaultHTML = document.getElementById("list").innerHTML;' +
'    document.getElementById("search").addEventListener("input", function() {' +
'      var q = this.value.trim().toLowerCase();' +
'      var st = document.getElementById("status");' +
'      var el = document.getElementById("list");' +
'      if (!q || q.length < 2) { el.innerHTML = defaultHTML; st.textContent = ""; return; }' +
'      var matches = [];' +
'      docsData.forEach(function(doc) {' +
'        var tl = (doc.text || "").toLowerCase();' +
'        var nl = (doc.filename || "").toLowerCase();' +
'        var pos = tl.indexOf(q);' +
'        if (pos !== -1 || nl.indexOf(q) !== -1) {' +
'          var sn = "";' +
'          if (pos !== -1) {' +
'            var s = Math.max(0, pos - 60);' +
'            var e = Math.min(doc.text.length, pos + q.length + 60);' +
'            sn = (s > 0 ? "..." : "") + doc.text.substring(s, e) + (e < doc.text.length ? "..." : "");' +
'          }' +
'          matches.push({ doc: doc, snippet: sn });' +
'        }' +
'      });' +
'      st.textContent = "Ditemukan " + matches.length + " dokumen";' +
'      if (!matches.length) { el.innerHTML = \'<div class="empty">Tidak ditemukan.</div>\'; return; }' +
'      el.innerHTML = matches.map(function(m) {' +
'        var d = m.doc;' +
'        var icon = d.type === "pdf" ? "📄" : d.type === "md" ? "📝" : "🖼️";' +
'        var safeSn = m.snippet.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");' +
'        var snH = m.snippet ? \'<div class="snippet">\' + safeSn + \'</div>\' : "";' +
'        return \'<a href="' + prefix + 'view/\' + d.slug + \'.html" class="card">\' +' +
'          \'<div class="icon">\' + icon + \'</div>\' +' +
'          \'<div class="info">\' +' +
'            \'<div class="fname">\' + d.filename + \'</div>\' +' +
'            \'<div class="meta">\' + (d.folder ? d.folder + " · " : "") + d.method.toUpperCase() + \'</div>\' +' +
'            snH +' +
'          \'</div></a>\';' +
'      }).join("");' +
'    });' +
'  </script>' +
'</body>' +
'</html>';
}

function countFiles(entries) {
  var c = 0;
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].type === 'file') c++;
    else if (entries[i].children) c += countFiles(entries[i].children);
  }
  return c;
}

function makeViewerHTML(doc) {
  var pdfRelPath = doc.relPath || doc.filename;
  var pdfPath = '../docs/' + pdfRelPath.split('/').map(encodeURIComponent).join('/');
  var pdfJsUrl = '../pdfjs/web/viewer.html?file=' + encodeURIComponent('../../docs/' + pdfRelPath);
  var body = '';

  if (doc.type === 'pdf') {
    body = '<div class="toolbar">' +
      '<a href="../index.html" class="back">← Kembali</a>' +
      '<span>📄 ' + escapeHtml(doc.filename) + '</span>' +
      '<a href="' + pdfPath + '" class="btn" download>⬇ Download</a>' +
      '<a href="' + pdfPath + '" class="btn" target="_blank">🌐 File Asli</a>' +
      '<a href="../text/' + doc.slug + '.txt" class="btn" target="_blank">📃 Text</a>' +
    '</div>' +
    '<iframe src="' + pdfJsUrl + '" style="width:100%;height:calc(100vh - 50px);border:none"></iframe>';
  } else if (doc.type === 'md') {
    body = '<div class="toolbar">' +
      '<a href="../index.html" class="back">← Kembali</a>' +
      '<span>📝 ' + escapeHtml(doc.filename) + '</span>' +
      '<a href="' + pdfPath + '" class="btn" download>⬇ Download</a>' +
      '<a href="../text/' + doc.slug + '.txt" class="btn" target="_blank">📃 Text</a>' +
    '</div><div class="md">' + doc.html + '</div>';
  } else {
    body = '<div class="toolbar">' +
      '<a href="../index.html" class="back">← Kembali</a>' +
      '<span>🖼️ ' + escapeHtml(doc.filename) + '</span>' +
      '<a href="' + pdfPath + '" class="btn" download>⬇ Download</a>' +
      '<a href="../text/' + doc.slug + '.txt" class="btn" target="_blank">📃 OCR</a>' +
    '</div>' +
    '<div style="text-align:center;padding:2rem"><img src="' + pdfPath + '" style="max-width:100%;max-height:70vh;border-radius:8px"></div>' +
    '<details style="max-width:800px;margin:1rem auto;padding:1rem;background:#fff;border-radius:8px"><summary>📃 OCR Result</summary><pre style="white-space:pre-wrap;margin-top:1rem">' + escapeHtml(doc.text) + '</pre></details>';
  }

  return '<!DOCTYPE html>' +
'<html lang="id">' +
'<head>' +
'  <meta charset="UTF-8">' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'  <title>' + escapeHtml(doc.filename) + '</title>' +
'  <style>' + getCSS() + '</style>' +
'</head>' +
'<body style="overflow:hidden">' + body + '</body>' +
'</html>';
}

function getCSS() {
  return '* { margin:0; padding:0; box-sizing:border-box; }' +
    'body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; background:#f4f6f8; color:#333; }' +
    '.wrap { max-width:900px; margin:0 auto; padding:2rem 1rem; }' +
    '.breadcrumb { margin-bottom:1rem; font-size:14px; }' +
    '.crumb { color:#2563eb; text-decoration:none; }' +
    '.crumb:hover { text-decoration:underline; }' +
    '.crumb-current { color:#333; font-weight:600; }' +
    '.sep { color:#94a3b8; margin:0 6px; }' +
    'h1 { font-size:24px; margin-bottom:4px; color:#111; }' +
    '.subtitle { color:#666; margin-bottom:1.5rem; font-size:14px; }' +
    '.search-box { width:100%; padding:12px 16px; font-size:15px; border:2px solid #ccd0d5; border-radius:8px; margin-bottom:1rem; outline:none; }' +
    '.search-box:focus { border-color:#2563eb; }' +
    '.status-bar { font-size:13px; color:#666; margin-bottom:0.75rem; min-height:18px; }' +
    '.card { display:flex; align-items:center; gap:1rem; background:#fff; padding:1rem 1.2rem; border-radius:8px; margin-bottom:0.5rem; box-shadow:0 1px 3px rgba(0,0,0,0.06); text-decoration:none; color:inherit; transition:box-shadow 0.2s; }' +
    '.card:hover { box-shadow:0 3px 10px rgba(0,0,0,0.12); }' +
    '.folder-card { border-left:3px solid #2563eb; }' +
    '.icon { font-size:1.8rem; line-height:1; }' +
    '.info { flex:1; }' +
    '.fname { font-weight:600; color:#1e293b; font-size:15px; }' +
    '.meta { font-size:12px; color:#888; margin-top:2px; }' +
    '.arrow { color:#94a3b8; font-size:20px; font-weight:bold; }' +
    '.snippet { font-size:13px; color:#444; margin-top:6px; background:#f9f9f9; padding:6px 10px; border-radius:4px; }' +
    '.empty { text-align:center; padding:3rem; color:#888; }' +
    '.toolbar { display:flex; align-items:center; gap:0.75rem; padding:10px 16px; background:#1e293b; color:#fff; flex-wrap:wrap; }' +
    '.toolbar span { font-weight:600; font-size:14px; margin-right:auto; }' +
    '.btn { color:#fff; text-decoration:none; background:#2563eb; padding:5px 10px; border-radius:4px; font-size:12px; }' +
    '.btn:hover { background:#1d4ed8; }' +
    '.back { color:#94a3b8; text-decoration:none; font-size:13px; }' +
    '.back:hover { color:#fff; }' +
    '.md { max-width:800px; margin:2rem auto; padding:2rem; background:#fff; border-radius:8px; line-height:1.8; overflow-y:auto; height:calc(100vh - 80px); }' +
    '.md h1,.md h2,.md h3 { margin:1.5rem 0 0.5rem; }' +
    '.md pre { background:#f1f5f9; padding:1rem; border-radius:4px; overflow-x:auto; }' +
    '.md code { background:#f1f5f9; padding:2px 6px; border-radius:3px; }';
}

// ========== MAIN BUILD ==========
async function build() {
  console.log('🚀 Build dimulai...');
  if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
  ensureDir(OUTPUT_DIR + '/docs');
  ensureDir(OUTPUT_DIR + '/view');
  ensureDir(OUTPUT_DIR + '/text');

  console.log('📦 Download PDF.js...');
  try {
    execSync('curl -sL -o /tmp/pdfjs.zip "' + PDFJS_URL + '"', { timeout: 60000 });
    execSync('unzip -q -o /tmp/pdfjs.zip -d ' + OUTPUT_DIR + '/pdfjs');
    console.log('   ✅ PDF.js siap');
  } catch(e) { console.log('   ⚠️ PDF.js gagal'); }

  // Scan semua folder & file
  console.log('📂 Scan folder docs/...');
  var tree = walkDir(DOCS_DIR, '');
  var allDocs = [];

  // Proses semua file rekursif
  async function processEntries(entries, relFolder) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.type === 'folder') {
        await processEntries(e.children, e.relPath);
      } else {
        var ext = path.extname(e.name).toLowerCase();
        var slug = slugify(e.relPath);
        var result;

        try {
          if (ext === '.pdf') result = await processPDF(e.fullPath);
          else if (ext === '.md') result = processMD(e.fullPath);
          else if (['.png','.jpg','.jpeg','.tiff','.bmp','.webp'].includes(ext)) result = processImage(e.fullPath);
          else { console.log('  Skip: ' + e.name); continue; }

          var type = ext === '.pdf' ? 'pdf' : ext === '.md' ? 'md' : 'image';
          var doc = {
            filename: e.name,
            relPath: e.relPath,
            slug: slug,
            type: type,
            text: result.text || '',
            html: result.html || null,
            pages: result.pages || 1,
            method: result.method,
            folder: relFolder || ''
          };
          allDocs.push(doc);

          // Copy file asli (pertahankan struktur folder)
          var destDir = path.join(OUTPUT_DIR, 'docs', path.dirname(e.relPath));
          ensureDir(destDir);
          fs.copyFileSync(e.fullPath, path.join(destDir, e.name));

          // Simpan plain text
          fs.writeFileSync(OUTPUT_DIR + '/text/' + slug + '.txt', result.text || '', 'utf-8');

          // Generate viewer
          fs.writeFileSync(OUTPUT_DIR + '/view/' + slug + '.html', makeViewerHTML(doc), 'utf-8');
        } catch(err) {
          console.error('  ❌ ' + e.name + ': ' + err.message);
        }
      }
    }
  }

  await processEntries(tree, '');
  console.log('📊 Total: ' + allDocs.length + ' dokumen diproses');

  // Generate halaman index per folder
  console.log('🏠 Generate halaman folder...');
  function generateFolderPages(entries, relPath, depth) {
    var folderName = relPath ? relPath.split('/').pop() : '';
    var outDir = relPath ? path.join(OUTPUT_DIR, relPath) : OUTPUT_DIR;
    ensureDir(outDir);

    var html = makeFolderHTML(folderName, relPath, entries, depth, allDocs.length);
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
    console.log('   ✅ ' + (relPath || '(root)') + '/index.html');

    for (var i = 0; i < entries.length; i++) {
      if (entries[i].type === 'folder') {
        generateFolderPages(entries[i].children, entries[i].relPath, depth + 1);
      }
    }
  }
  generateFolderPages(tree, '', 0);

  // Database dokumen untuk search
  console.log('💾 Save search data...');
  fs.writeFileSync(OUTPUT_DIR + '/docs-data.json', JSON.stringify(allDocs.map(function(d) {
    return { filename: d.filename, slug: d.slug, type: d.type, pages: d.pages, method: d.method, folder: d.folder, text: d.text };
  })), 'utf-8');

  // AI files
  var llms = '# Document Repository\n\n' + allDocs.length + ' documents.\n\n## Documents\n\n' + allDocs.map(function(d) {
    return '- [' + d.filename + '](' + SITE_URL + '/view/' + d.slug + '.html) | Text: ' + SITE_URL + '/text/' + d.slug + '.txt';
  }).join('\n') + '\n';
  fs.writeFileSync(OUTPUT_DIR + '/llms.txt', llms, 'utf-8');

  var sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + allDocs.map(function(d) {
    return '  <url><loc>' + SITE_URL + '/view/' + d.slug + '.html</loc></url>';
  }).join('\n') + '\n</urlset>';
  fs.writeFileSync(OUTPUT_DIR + '/sitemap.xml', sitemap, 'utf-8');
  fs.writeFileSync(OUTPUT_DIR + '/robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + SITE_URL + '/sitemap.xml\n', 'utf-8');

  console.log('🎉 Selesai! ' + allDocs.length + ' dokumen berhasil.');
}

build().catch(function(err) { console.error('Fatal:', err); process.exit(1); });