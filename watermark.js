/**
 * Sell Party Watermark System
 * Unremovable watermark overlay + image burner
 * Include this script on any page or stream to protect content
 */
(function() {
  'use strict';

  const BRAND = 'sell.party';
  const WATERMARK_TEXT = 'Sell Party';
  const WATERMARK_URL = 'sell.party';

  // ============================================================
  // 1. UNREMOVABLE PAGE OVERLAY WATERMARK
  // Creates a watermark that regenerates if removed via DevTools
  // ============================================================
  function createOverlayWatermark() {
    const id = '_sp_wm_' + Math.random().toString(36).substr(2, 6);

    function buildWatermark() {
      // Remove any existing
      const existing = document.getElementById(id);
      if (existing) existing.remove();

      const el = document.createElement('div');
      el.id = id;
      el.setAttribute('data-sp', '1');

      // Create canvas-based watermark pattern (harder to remove than text)
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');

      // Draw diagonal watermark text
      ctx.save();
      ctx.translate(150, 75);
      ctx.rotate(-25 * Math.PI / 180);
      ctx.font = '600 18px Arial, Helvetica, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.textAlign = 'center';
      ctx.fillText(WATERMARK_TEXT, 0, -10);
      ctx.font = '400 12px Arial, Helvetica, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillText(WATERMARK_URL, 0, 10);
      ctx.restore();

      const dataUrl = canvas.toDataURL();

      // Apply as repeating background
      Object.assign(el.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '2147483647',
        backgroundImage: `url(${dataUrl})`,
        backgroundRepeat: 'repeat',
        opacity: '1',
        mixBlendMode: 'normal',
        userSelect: 'none',
        webkitUserSelect: 'none'
      });

      document.body.appendChild(el);
      return el;
    }

    // Initial creation
    buildWatermark();

    // Regenerate if removed (MutationObserver)
    const observer = new MutationObserver(function(mutations) {
      if (!document.getElementById(id)) {
        buildWatermark();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Regenerate on interval as backup
    setInterval(function() {
      if (!document.getElementById(id)) {
        buildWatermark();
      }
      // Prevent style tampering
      const el = document.getElementById(id);
      if (el) {
        el.style.display = '';
        el.style.visibility = '';
        el.style.opacity = '1';
        el.style.zIndex = '2147483647';
      }
    }, 1000);

    // Prevent removal via console
    Object.defineProperty(HTMLElement.prototype, 'remove', {
      value: function() {
        if (this.getAttribute && this.getAttribute('data-sp') === '1') {
          return; // Block removal of watermark
        }
        this.parentNode && this.parentNode.removeChild(this);
      },
      writable: false,
      configurable: false
    });
  }

  // ============================================================
  // 2. CORNER BADGE WATERMARK (visible branding)
  // Fixed corner badge that shows on streams/content
  // ============================================================
  function createCornerBadge(position) {
    position = position || 'bottom-right';
    const badge = document.createElement('div');
    badge.setAttribute('data-sp', '1');

    const positions = {
      'top-left': { top: '12px', left: '12px' },
      'top-right': { top: '12px', right: '12px' },
      'bottom-left': { bottom: '12px', left: '12px' },
      'bottom-right': { bottom: '12px', right: '12px' }
    };
    const pos = positions[position] || positions['bottom-right'];

    Object.assign(badge.style, {
      position: 'fixed',
      ...pos,
      zIndex: '2147483646',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '8px',
      padding: '8px 16px',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '14px',
      fontWeight: '800',
      letterSpacing: '-0.02em',
      pointerEvents: 'none',
      userSelect: 'none',
      webkitUserSelect: 'none',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    });

    badge.innerHTML = '<span style="background:linear-gradient(135deg,#FFD700,#FFA500);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Sell</span> <span style="background:linear-gradient(135deg,#00D4FF,#0099FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Party</span>';

    document.body.appendChild(badge);

    // Regenerate if removed
    const obs = new MutationObserver(function() {
      if (!badge.parentNode) document.body.appendChild(badge);
    });
    obs.observe(document.body, { childList: true });
  }

  // ============================================================
  // 3. IMAGE WATERMARK BURNER
  // Permanently burns watermark into images (canvas-based)
  // Cannot be removed without destroying the image
  // ============================================================
  function burnWatermark(imageSource, options) {
    options = options || {};
    const opacity = options.opacity || 0.3;
    const position = options.position || 'bottom-right';
    const fontSize = options.fontSize || 24;
    const padding = options.padding || 20;

    return new Promise(function(resolve, reject) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Calculate position
        let x, y, align;
        switch (position) {
          case 'top-left':
            x = padding; y = padding + fontSize; align = 'left'; break;
          case 'top-right':
            x = canvas.width - padding; y = padding + fontSize; align = 'right'; break;
          case 'bottom-left':
            x = padding; y = canvas.height - padding; align = 'left'; break;
          case 'center':
            x = canvas.width / 2; y = canvas.height / 2; align = 'center'; break;
          default: // bottom-right
            x = canvas.width - padding; y = canvas.height - padding; align = 'right';
        }

        // Draw main watermark text with shadow (makes it visible on any background)
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
        ctx.textAlign = align;

        // Shadow for visibility on light backgrounds
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Gold "Sell"
        const sellWidth = ctx.measureText('Sell ').width;
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Sell', align === 'right' ? x - ctx.measureText('Party').width - 8 : x, y);

        // Cyan "Party"
        ctx.fillStyle = '#00D4FF';
        ctx.fillText('Party', align === 'right' ? x : x + sellWidth, y);

        // URL below
        ctx.font = `600 ${Math.round(fontSize * 0.5)}px Arial, Helvetica, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = opacity * 0.7;
        ctx.fillText(WATERMARK_URL, x, y + fontSize * 0.6);

        ctx.restore();

        // Also add a subtle repeating pattern across the image (anti-crop protection)
        ctx.save();
        ctx.globalAlpha = 0.03;
        ctx.font = `600 ${Math.round(fontSize * 0.6)}px Arial, Helvetica, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        for (let row = 0; row < canvas.height; row += 120) {
          for (let col = 0; col < canvas.width; col += 200) {
            ctx.save();
            ctx.translate(col, row);
            ctx.rotate(-25 * Math.PI / 180);
            ctx.fillText(WATERMARK_TEXT, 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();

        resolve({
          canvas: canvas,
          dataUrl: canvas.toDataURL('image/png', 1.0),
          blob: function(cb) { canvas.toBlob(cb, 'image/png', 1.0); }
        });
      };
      img.onerror = reject;
      img.src = imageSource;
    });
  }

  // ============================================================
  // 4. VIDEO/STREAM OVERLAY
  // Overlay watermark on video elements
  // ============================================================
  function watermarkVideo(videoElement, options) {
    options = options || {};
    const container = videoElement.parentElement;
    if (!container) return;

    container.style.position = 'relative';

    const overlay = document.createElement('div');
    overlay.setAttribute('data-sp', '1');
    Object.assign(overlay.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '10',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      padding: '12px'
    });

    overlay.innerHTML = `
      <div style="background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);border-radius:6px;padding:6px 12px;font-family:Arial,sans-serif;font-weight:800;font-size:16px;border:1px solid rgba(255,255,255,0.1)">
        <span style="background:linear-gradient(135deg,#FFD700,#FFA500);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Sell</span>
        <span style="background:linear-gradient(135deg,#00D4FF,#0099FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Party</span>
      </div>
    `;

    container.appendChild(overlay);

    // Protect from removal
    const obs = new MutationObserver(function() {
      if (!overlay.parentNode) container.appendChild(overlay);
    });
    obs.observe(container, { childList: true });
  }

  // ============================================================
  // 5. ANTI-SCREENSHOT PROTECTION
  // Makes it harder to screenshot without watermark
  // ============================================================
  function enableAntiScreenshot() {
    // Disable right-click on protected content
    document.addEventListener('contextmenu', function(e) {
      if (e.target.closest('[data-protected]')) {
        e.preventDefault();
      }
    });

    // Disable drag on images
    document.addEventListener('dragstart', function(e) {
      if (e.target.tagName === 'IMG' && e.target.closest('[data-protected]')) {
        e.preventDefault();
      }
    });

    // Detect PrintScreen (limited but helps)
    document.addEventListener('keyup', function(e) {
      if (e.key === 'PrintScreen') {
        // Flash the watermark brighter momentarily
        document.querySelectorAll('[data-sp="1"]').forEach(function(el) {
          el.style.opacity = '0.5';
          setTimeout(function() { el.style.opacity = '1'; }, 500);
        });
      }
    });
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.SellPartyWatermark = {
    // Add subtle page-wide watermark overlay
    overlay: createOverlayWatermark,

    // Add visible corner badge
    badge: createCornerBadge,

    // Burn watermark permanently into an image
    // Usage: SellPartyWatermark.burn('image.jpg').then(r => img.src = r.dataUrl)
    burn: burnWatermark,

    // Overlay watermark on a video element
    // Usage: SellPartyWatermark.video(document.querySelector('video'))
    video: watermarkVideo,

    // Enable anti-screenshot measures
    protect: enableAntiScreenshot,

    // Initialize everything (overlay + badge + anti-screenshot)
    init: function(options) {
      options = options || {};
      if (options.overlay !== false) createOverlayWatermark();
      if (options.badge !== false) createCornerBadge(options.badgePosition || 'bottom-right');
      if (options.protect !== false) enableAntiScreenshot();
    }
  };

  // Auto-init if data attribute present on script tag
  var scripts = document.getElementsByTagName('script');
  var currentScript = scripts[scripts.length - 1];
  if (currentScript && currentScript.hasAttribute('data-auto')) {
    document.addEventListener('DOMContentLoaded', function() {
      window.SellPartyWatermark.init();
    });
  }
})();
