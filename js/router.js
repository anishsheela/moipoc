// =============================================================
// ROUTER — Simple hash-based SPA router with fade transitions
// =============================================================

class Router {
  constructor() {
    this.routes = {};
    this._bound = this._resolve.bind(this);
    window.addEventListener('hashchange', this._bound);
  }

  on(hash, handler) {
    this.routes[hash] = handler;
    return this;
  }

  go(hash) {
    window.location.hash = hash;
  }

  init(defaultHash) {
    const current = window.location.hash.slice(1);
    if (!current) {
      window.location.hash = defaultHash;
    } else {
      this._resolve();
    }
  }

  _resolve() {
    const hash = window.location.hash.slice(1) || '';
    const handler = this.routes[hash] || this.routes['*'];
    if (!handler) return;

    const app = document.getElementById('app');
    if (!app) return;

    // Fade out
    app.style.opacity = '0';
    app.style.transform = 'translateY(6px)';
    app.style.transition = 'opacity 0.18s ease, transform 0.18s ease';

    setTimeout(() => {
      handler();
      // Fade in
      app.style.opacity = '0';
      app.style.transform = 'translateY(6px)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          app.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          app.style.opacity = '1';
          app.style.transform = 'translateY(0)';
        });
      });
    }, 180);
  }
}

// ── Helpers shared across all apps ────────────────────────────

function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function avatar(initials, color, size = 44) {
  return `<div class="avatar" style="background:${color};width:${size}px;height:${size}px;font-size:${Math.round(size * 0.36)}px">${initials}</div>`;
}

function idqaBadge(score) {
  // Max achievable now is 12 (ID verified); scale goes to 24 (attestation, future)
  const cls = score >= 12 ? 'idqa-high' : score >= 8 ? 'idqa-mid' : 'idqa-low';
  const label = score >= 12 ? 'ID Verified' : score >= 8 ? 'Email Verified' : 'Unverified';
  return `<span class="idqa-badge ${cls}">IDQA ${score}/24 · ${label}</span>`;
}

function verifiedBadge(verified) {
  return verified
    ? `<span class="badge badge-verified">Verified</span>`
    : `<span class="badge badge-unverified">Unverified</span>`;
}

function statusBadge(status) {
  const map = {
    pending:  'badge-pending',
    approved: 'badge-verified',
    rejected: 'badge-rejected',
    none:     'badge-none'
  };
  return `<span class="badge ${map[status] || 'badge-none'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

// Shield SVG icon (MOI brand mark)
const SHIELD_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

// Lock SVG
const LOCK_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

// Check SVG
const CHECK_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

// X SVG
const X_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

// Spinner SVG
const SPINNER_SVG = `<svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
