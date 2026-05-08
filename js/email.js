// =============================================================
// EMAIL CLIENT — OSMIO Mock Inbox
// =============================================================

let currentPersonaId = null;
let currentEmailId   = null;

function getPersona(id) {
  return MOCK.emailPersonas.find(p => p.id === id) || MOCK.emailPersonas[0];
}

function getEmails(email) {
  return MOCK.emails[email] || [];
}

function unreadCount(email) {
  return getEmails(email).filter(e => !e.read).length;
}

function tagLabel(tag) {
  const map = {
    'new-request':           'Request',
    'attestation-submitted': 'Submitted',
    'officer-assigned':      'Confirmed',
    'new-assignment':        'Assignment',
    'reminder':              'Reminder',
    'schedule':              'Schedule',
    'availability':          'Availability',
  };
  return map[tag] || tag;
}

function fmtEmailDate(iso) {
  const d = new Date(iso);
  const today = new Date('2026-04-24');
  const diff = Math.floor((today - d) / 86400000);
  if (diff === 0) return d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return d.toLocaleDateString('en-US', { weekday:'short' });
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}

function fmtEmailDateFull(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
}

// ── Render full layout ─────────────────────────────────────────
function renderEmailApp() {
  const persona = getPersona(currentPersonaId);
  const emails  = getEmails(persona.email);
  const current = currentEmailId ? emails.find(e => e.id === currentEmailId) : null;

  document.getElementById('app').innerHTML = `
  <div class="email-layout">

    <!-- Personas sidebar -->
    <div class="em-personas">
      <div class="em-personas-header">
        <div class="em-personas-logo">
          <div class="em-personas-logo-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div class="em-personas-logo-text">OSMIO Mail</div>
        </div>
        <div class="em-personas-sub">Demo inbox viewer</div>
      </div>
      <div class="em-persona-list">
        <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.22);padding:4px 10px 8px">Accounts</div>
        ${MOCK.emailPersonas.map(p => {
          const unread = unreadCount(p.email);
          return `
          <div class="em-persona-item ${p.id === currentPersonaId ? 'active' : ''}" onclick="switchPersona('${p.id}')">
            ${avatar(p.initials, p.avatarColor, 36)}
            <div class="em-persona-info">
              <div class="em-persona-name">${p.name}</div>
              <div class="em-persona-role">${p.role}</div>
            </div>
            ${unread > 0 ? `<div class="em-persona-badge">${unread}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Inbox list -->
    <div class="em-inbox">
      <div class="em-inbox-header">
        <div class="em-inbox-title">${persona.name}</div>
        <div class="em-inbox-sub">${persona.email} · ${emails.length} message${emails.length!==1?'s':''}</div>
      </div>
      <div class="em-inbox-list">
        ${emails.length === 0 ? `
        <div style="padding:40px;text-align:center;color:#c4cad4;font-size:13.5px">No messages</div>
        ` : emails.map(e => `
        <div class="em-email-row ${e.id === currentEmailId ? 'active' : ''} ${!e.read ? 'unread' : ''}" onclick="openEmail('${e.id}')">
          ${!e.read ? '<div class="em-email-unread-dot"></div>' : ''}
          <div class="em-email-avatar">
            <div class="avatar" style="background:#374151;width:36px;height:36px;font-size:13px">
              ${e.fromName.substring(0,1)}
            </div>
          </div>
          <div class="em-email-body-wrap">
            <div class="em-email-from">${e.fromName}</div>
            <div class="em-email-subject">${e.subject}</div>
          </div>
          <div class="em-email-meta">
            <div class="em-email-time">${fmtEmailDate(e.date)}</div>
            ${e.tag ? `<div class="em-email-tag ${e.tag}">${tagLabel(e.tag)}</div>` : ''}
          </div>
        </div>`).join('')}
      </div>
    </div>

    <!-- Email reader -->
    <div class="em-reader">
      ${current ? `
      <div class="em-reader-header">
        <div class="em-reader-subject">${current.subject}</div>
        <div class="em-reader-meta-row">
          <div class="em-reader-meta-item"><strong>From:</strong> ${current.fromName} &lt;${current.from}&gt;</div>
          <div class="em-reader-meta-item"><strong>To:</strong> ${current.to}</div>
          <div class="em-reader-meta-date">${fmtEmailDateFull(current.date)}</div>
        </div>
      </div>
      <div class="em-reader-body">
        <div class="em-reader-body-inner">
          ${current.body}
        </div>
      </div>
      ` : `
      <div class="em-no-email">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <div style="font-size:15px;font-weight:600;color:#c4cad4">Select an email to read</div>
        <div style="font-size:13px">Choose a message from the inbox on the left</div>
      </div>
      `}
    </div>

  </div>`;
}

function switchPersona(id) {
  currentPersonaId = id;
  currentEmailId   = null;
  // Update hash
  window.location.hash = id;
  renderEmailApp();
}

function openEmail(id) {
  currentEmailId = id;
  // Mark as read
  const persona = getPersona(currentPersonaId);
  const emails  = getEmails(persona.email);
  const e = emails.find(x => x.id === id);
  if (e) e.read = true;
  renderEmailApp();
}

// ── Init: read persona from hash ───────────────────────────────
function init() {
  const hash = window.location.hash.slice(1);
  const persona = MOCK.emailPersonas.find(p => p.id === hash);
  currentPersonaId = persona ? persona.id : MOCK.emailPersonas[0].id;
  renderEmailApp();
}

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (hash && MOCK.emailPersonas.find(p => p.id === hash)) {
    currentPersonaId = hash;
    currentEmailId = null;
    renderEmailApp();
  }
  // Update demo nav active state
  document.querySelectorAll('#demo-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `email.html${location.hash}`);
  });
});

init();
