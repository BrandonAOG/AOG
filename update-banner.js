// ============================================================
//  Always On Generators – Field Hub
//  Update Banner  |  update-banner.js  |  v2.0.2
//
//  HOW TO USE:
//  1. Add this to the <head> of every page (or index.html):
//       <script src="../update-banner.js"></script>
//
//  2. Each time you bump the SW version, update CHANGELOG
//     below with what changed. Keep it short — one line each.
//
//  3. Bump APP_VERSION to match CACHE_NAME in sw.js.
// ============================================================

(function () {

  // ── UPDATE THIS every time you bump the SW version ────────
  var APP_VERSION = 'v2.0.2';

  var CHANGELOG = [
    'Describe your first change here',
    'Describe your second change here',
    'Add or remove lines as needed'
  ];
  // ──────────────────────────────────────────────────────────


  if (!('serviceWorker' in navigator)) return;

  // ── Inject banner CSS ──────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#aog-update-banner {',
    '  position: fixed;',
    '  top: 0; left: 0; right: 0;',
    '  z-index: 9999;',
    '  background: #1a1a2e;',
    '  color: #fff;',
    '  font-family: sans-serif;',
    '  font-size: 14px;',
    '  padding: 12px 16px;',
    '  display: flex;',
    '  align-items: flex-start;',
    '  gap: 12px;',
    '  box-shadow: 0 2px 8px rgba(0,0,0,0.4);',
    '  transform: translateY(-100%);',
    '  transition: transform 0.35s ease;',
    '}',
    '#aog-update-banner.show {',
    '  transform: translateY(0);',
    '}',
    '#aog-update-banner .aog-banner-text {',
    '  flex: 1;',
    '  line-height: 1.5;',
    '}',
    '#aog-update-banner .aog-banner-title {',
    '  font-weight: bold;',
    '  font-size: 15px;',
    '  margin-bottom: 4px;',
    '}',
    '#aog-update-banner .aog-banner-list {',
    '  margin: 0;',
    '  padding-left: 18px;',
    '  color: #ccc;',
    '}',
    '#aog-update-banner .aog-banner-list li {',
    '  margin: 2px 0;',
    '}',
    '#aog-update-banner .aog-banner-btn {',
    '  background: #e8a020;',
    '  color: #000;',
    '  border: none;',
    '  border-radius: 6px;',
    '  padding: 8px 14px;',
    '  font-weight: bold;',
    '  font-size: 13px;',
    '  cursor: pointer;',
    '  white-space: nowrap;',
    '  align-self: center;',
    '}',
    '#aog-update-banner .aog-banner-btn:hover {',
    '  background: #f5b535;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // ── Build the banner HTML ──────────────────────────────────
  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'aog-update-banner';

    var listItems = CHANGELOG.map(function (item) {
      return '<li>' + item + '</li>';
    }).join('');

    banner.innerHTML =
      '<div class="aog-banner-text">' +
        '<div class="aog-banner-title">⚡ App Update Available — ' + APP_VERSION + '</div>' +
        '<ul class="aog-banner-list">' + listItems + '</ul>' +
      '</div>' +
      '<button class="aog-banner-btn" id="aog-update-btn">Update Now</button>';

    document.body.insertBefore(banner, document.body.firstChild);

    // Slide in after a short delay so transition fires
    setTimeout(function () {
      banner.classList.add('show');
    }, 100);

    // Update Now — tell SW to activate, then reload
    document.getElementById('aog-update-btn').addEventListener('click', function () {
      if (window._aogWaitingWorker) {
        window._aogWaitingWorker.postMessage({ action: 'SKIP_WAITING' });
      }
      window.location.reload();
    });
  }

  // ── Register SW and watch for updates ─────────────────────
  navigator.serviceWorker.register('../sw.js', { scope: '../' })
    .then(function (reg) {

      // Already a waiting worker on load (e.g. user had tab open)
      if (reg.waiting) {
        window._aogWaitingWorker = reg.waiting;
        showBanner();
        return;
      }

      // New worker found while page is open
      reg.addEventListener('updatefound', function () {
        var newWorker = reg.installing;
        newWorker.addEventListener('statechange', function () {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            window._aogWaitingWorker = newWorker;
            showBanner();
          }
        });
      });
    })
    .catch(function (err) {
      console.warn('[AOG] SW registration failed:', err);
    });

  // ── Reload all tabs once new SW takes control ──────────────
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    window.location.reload();
  });

})();
