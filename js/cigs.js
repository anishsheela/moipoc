// =============================================================
// ALKOSHOP — Alcohol & Tobacco portal screens
// Age requirement: country-based (DE: 18+, IN: 25+, US: 21+)
// Country of residence required
// =============================================================

const router = new Router();

// Minimum purchase age by country
const AC_AGE_RULES = {
  'Germany':       18,
  'India':         25,
  'United States': 21,
};

const AC_FLAGS = {
  'Germany':       '🇩🇪',
  'India':         '🇮🇳',
  'United States': '🇺🇸',
};

function acLogoSVG(size = 32) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#92400e"/>
    <text x="20" y="28" text-anchor="middle" font-size="22" fill="#fbbf24">🍷</text>
  </svg>`;
}

function acTopBar(showProfile = false) {
  return `
    <header class="ac-topbar">
      <div class="ac-logo-mark">
        ${acLogoSVG(30)}
        <span class="ac-logo-text"><span class="ac-alco">Alko</span><span class="ac-shop">shop</span></span>
      </div>
      ${showProfile ? `
        <div class="ac-topbar-actions">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ac-text-muted)">
            <div class="avatar" style="background:#92400e;width:30px;height:30px;font-size:11px">AJ</div>
            Alex Johnson
          </div>
        </div>` : `
        <div class="ac-topbar-actions">
          <a href="index.html">← Demo Hub</a>
        </div>`}
    </header>`;
}

// ── Auth helpers ───────────────────────────────────────────────
function startAuth(demoDob = null, demoCountry = null) {
  if (demoDob) sessionStorage.setItem('moi_demo_dob', demoDob);
  if (demoCountry) sessionStorage.setItem('moi_demo_country', demoCountry);
  // Determine the relevant age threshold for this country
  const effectiveCountry = demoCountry || MOCK.currentUser.moi.country.value;
  const minAge = AC_AGE_RULES[effectiveCountry] || 21;
  sessionStorage.setItem('moi_oauth_request', JSON.stringify({
    appName: 'Alkoshop',
    appId: 'cigs',
    requestId: 'req_' + Date.now(),
    certUsed: MOCK.currentUser.certs.numberplate.id,
    requiredFields: ['firstName', 'lastName', `above${minAge}`, 'country'],
    optionalFields: ['email'],
    returnTo: 'cigs.html#redirecting'
  }));
  router.go('cert-check');
}

// Demo scenario helpers
function startAuthUS()       { startAuth(null, null);           } // Alex (US, 34) → passes US 21+ rule
function startAuthUSYoung()  { startAuth('2007-06-01', null);   } // US user, 18 → fails US 21+ rule
function startAuthIndia()    { startAuth(null, 'India');        } // Alex in India context, 34 → passes India 25+ rule
function startAuthIndiaYng() { startAuth('2003-01-01', 'India');} // India user, 23 → fails India 25+ rule
function startAuthGermany()  { startAuth('2008-04-01', 'Germany');} // Germany, 18 → passes German 18+ rule

// ── Screen: Login ──────────────────────────────────────────────
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="ac-screen">
      ${acTopBar()}
      <div class="ac-hero">
        <div class="ac-login-card">
          <div style="font-size:48px;margin-bottom:4px">🍷</div>
          <h1 class="ac-login-tagline">Shop wines, spirits &amp; more.</h1>
          <p class="ac-login-sub">Purchase age is determined by your country of residence and attested by your Osmio ID Pair. Your date of birth is never shared.</p>

          <div class="ac-trust-bar">
            <span>Age attested</span>
            <span class="ac-trust-bar-dot"></span>
            <span>Country-checked</span>
            <span class="ac-trust-bar-dot"></span>
            <span>No passwords</span>
          </div>

          <button class="ac-age-rules-toggle" onclick="document.getElementById('ac-age-rules').classList.toggle('hidden')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Age requirements by country
          </button>
          <div id="ac-age-rules" class="hidden" style="margin-bottom:8px">
            <div style="display:flex;flex-direction:column;gap:4px;padding:10px;background:var(--ac-surface-2);border:1px solid var(--ac-border);border-radius:10px">
              <div style="display:flex;justify-content:space-between;padding:5px 6px;font-size:12.5px">
                <span>🇩🇪 Germany</span><strong style="color:var(--ac-amber-lt)">18+</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding:5px 6px;font-size:12.5px">
                <span>🇺🇸 United States</span><strong style="color:var(--ac-amber-lt)">21+</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding:5px 6px;font-size:12.5px">
                <span>🇮🇳 India</span><strong style="color:var(--ac-amber-lt)">25+</strong>
              </div>
            </div>
          </div>

          <button class="btn-osmio-ac" onclick="startAuthUS()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Sign in with Osmio ID Pair
          </button>

          <div class="ac-demo-links">
            <span class="ac-demo-link-label">Demo scenarios</span>
            <span class="ac-demo-link" onclick="startAuthUS()">
              ✓ Alex — US resident, age 34 — passes 21+ (US rule)
            </span>
            <span class="ac-demo-link" onclick="startAuthUSYoung()">
              ⚠ US resident, age 18 — fails 21+ (US rule)
            </span>
            <span class="ac-demo-link" onclick="startAuthIndia()">
              ✓ Alex — India resident, age 34 — passes 25+ (India rule)
            </span>
            <span class="ac-demo-link" onclick="startAuthIndiaYng()">
              ⚠ India resident, age 23 — fails 25+ (India rule)
            </span>
            <span class="ac-demo-link" onclick="startAuthGermany()">
              ✓ Germany resident, age 18 — passes 18+ (Germany rule)
            </span>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Screen: Osmio ID Pair Check ────────────────────────────────
function renderCertCheck() {
  document.getElementById('app').innerHTML = `
    <div class="ac-screen">
      ${acTopBar()}
      <div class="ac-cert-screen">
        <div class="ac-cert-card">
          <div class="ac-cert-header">
            <div class="ac-cert-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2>Verifying your Osmio ID</h2>
            <p>Authenticating with your Osmio ID Pair</p>
          </div>
          <div class="cert-steps" id="cert-steps"></div>
        </div>
      </div>
    </div>`;

  const steps = [
    { icon: 'spin', type: 'loading', text: 'Scanning for Osmio ID Pair...', sub: null, delay: 0 },
    { icon: 'check', type: 'success', text: 'Osmio ID Pair detected', sub: MOCK.currentUser.certs.numberplate.id, delay: 900 },
    { icon: 'spin', type: 'loading', text: 'Validating with OSMIO Certificate Authority...', sub: null, delay: 1300 },
    { icon: 'check', type: 'success', text: 'Signature valid · Osmio ID Pair trusted', sub: `Issuer: ${MOCK.currentUser.certs.numberplate.issuer}`, delay: 2400 },
    { icon: 'check', type: 'success', text: 'Osmio ID Pair expires: Nov 15, 2026', sub: `Serial: ${MOCK.currentUser.certs.numberplate.serial}`, delay: 2800 },
    { icon: 'idqa', type: 'info', text: 'IDQA Score resolved', sub: 'Scale: 0–24 · ID Attested at 12', idqa: MOCK.currentUser.idqa, delay: 3300 },
    { icon: 'spin', type: 'loading', text: 'Preparing MOI licence request (age + country)...', sub: null, delay: 3800 },
  ];

  steps.forEach((step, i) => {
    setTimeout(() => {
      const container = document.getElementById('cert-steps');
      if (!container) return;

      let iconHtml;
      if (step.icon === 'spin') {
        iconHtml = `<span>${SPINNER_SVG}</span>`;
      } else {
        iconHtml = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12" stroke-dasharray="40" stroke-dashoffset="40" style="animation:checkDraw .3s ease forwards"/></svg>`;
      }

      const div = document.createElement('div');
      div.className = 'cert-step';
      div.innerHTML = `
        <div class="cert-step-icon ${step.type}">${iconHtml}</div>
        <div class="cert-step-text">
          <strong>${step.text}</strong>
          ${step.sub ? `<span>${step.sub}</span>` : ''}
          ${step.idqa ? `<div class="cert-step-idqa">✓ IDQA ${step.idqa}/24 · ID Attested</div>` : ''}
        </div>`;
      container.appendChild(div);

      if (i === steps.length - 1) {
        setTimeout(() => { window.location.href = 'moi.html#consent'; }, 1000);
      }
    }, step.delay);
  });
}

// ── Screen: Returning from MOI ─────────────────────────────────
function renderRedirecting() {
  document.getElementById('app').innerHTML = `
    <div class="ac-screen">
      ${acTopBar()}
      <div class="ac-redirect-screen">
        <div class="ac-redirect-card">
          <div style="font-size:32px">🛡️</div>
          <h2>Verifying your details</h2>
          <p>Checking age and country of residence via MOI…</p>
          <div class="ac-redirect-progress">
            <div class="ac-redirect-bar" id="prog-bar"></div>
          </div>
        </div>
      </div>
    </div>`;

  requestAnimationFrame(() => {
    const bar = document.getElementById('prog-bar');
    if (bar) bar.style.width = '100%';
  });

  setTimeout(() => router.go('dashboard'), 2400);
}

// ── Screen: Age Denied ─────────────────────────────────────────
function renderAgeDenied(minAge, country) {
  sessionStorage.removeItem('moi_demo_dob');
  sessionStorage.removeItem('moi_demo_country');
  const flag = AC_FLAGS[country] || '🌍';
  document.getElementById('app').innerHTML = `
    <div class="ac-screen">
      ${acTopBar()}
      <div class="ac-denied-screen">
        <div class="ac-denied-card">
          <div class="ac-denied-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2>Age Restriction</h2>
          <p>The minimum purchase age in <strong style="color:var(--ac-text)">${flag} ${country}</strong> is <strong style="color:var(--ac-amber-lt)">${minAge}+</strong>.<br>
          Your MOI age attestation confirmed you do not meet this requirement.</p>

          <div style="margin-bottom:20px;padding:14px;background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.15);border-radius:10px;font-size:12.5px;color:var(--ac-text-muted);text-align:left">
            <strong style="color:var(--ac-text);display:block;margin-bottom:4px">Privacy preserved</strong>
            Your date of birth was never shared. MOI computed the age check result and sent only the pass/fail verdict, attested by your Osmio ID Pair.
          </div>

          <button class="btn-outline-ac" style="width:100%" onclick="router.go('login')">
            ← Back to login
          </button>
        </div>
      </div>
    </div>`;
}

// ── Screen: Dashboard ──────────────────────────────────────────
function renderDashboard() {
  const response = JSON.parse(sessionStorage.getItem('moi_oauth_response') || 'null');
  const moi = MOCK.currentUser.moi;
  const shared = (response && response.shared) || {};

  const country = (shared.country || moi.country);
  const countryVal = country ? country.value : 'United States';
  const minAge = AC_AGE_RULES[countryVal] || 21;
  const flag = AC_FLAGS[countryVal] || '🌍';

  // Determine which above{N} check to use
  const ageKey = `above${minAge}`;
  const ageCheck = shared[ageKey] !== undefined ? shared[ageKey] : { value: true, verified: moi.dob.verified };

  if (ageCheck && ageCheck.value === false) {
    renderAgeDenied(minAge, countryVal);
    return;
  }

  sessionStorage.removeItem('moi_demo_dob');
  sessionStorage.removeItem('moi_demo_country');

  const firstName = (shared.firstName || moi.firstName).value;

  document.getElementById('app').innerHTML = `
    <div class="ac-screen">
      ${acTopBar(true)}
      <div class="ac-dashboard">
        <div class="ac-dash-welcome">Welcome back</div>
        <div class="ac-dash-name">${firstName}'s Cart 🛒</div>

        <div class="ac-moi-notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Age ${minAge}+ verified via MOI · Region: ${flag} ${countryVal} · Osmio ID Pair authenticated
        </div>

        <div class="ac-age-badge">${flag} ${countryVal} — minimum age ${minAge}+</div>

        <div class="ac-section-label">Wines &amp; Spirits</div>
        <div class="ac-product-grid">
          <div class="ac-product-card">
            <div class="ac-product-emoji">🍷</div>
            <div class="ac-product-name">Bordeaux Rouge</div>
            <div class="ac-product-type">Red Wine · France</div>
            <div class="ac-product-price">£18.99</div>
          </div>
          <div class="ac-product-card">
            <div class="ac-product-emoji">🥃</div>
            <div class="ac-product-name">Islay Malt</div>
            <div class="ac-product-type">Whisky · Scotland</div>
            <div class="ac-product-price">£42.50</div>
          </div>
          <div class="ac-product-card">
            <div class="ac-product-emoji">🍾</div>
            <div class="ac-product-name">Brut Champagne</div>
            <div class="ac-product-type">Sparkling · France</div>
            <div class="ac-product-price">£34.00</div>
          </div>
          <div class="ac-product-card">
            <div class="ac-product-emoji">🍺</div>
            <div class="ac-product-name">Craft IPA 6-Pack</div>
            <div class="ac-product-type">Beer · UK</div>
            <div class="ac-product-price">£9.99</div>
          </div>
        </div>

        <div class="ac-section-label">Tobacco &amp; Cigars</div>
        <div class="ac-product-grid">
          <div class="ac-product-card">
            <div class="ac-product-emoji">🚬</div>
            <div class="ac-product-name">Premium Cigars</div>
            <div class="ac-product-type">Cigars · Cuba</div>
            <div class="ac-product-price">£28.00</div>
          </div>
          <div class="ac-product-card">
            <div class="ac-product-emoji">🪴</div>
            <div class="ac-product-name">Rolling Tobacco</div>
            <div class="ac-product-type">Tobacco · UK</div>
            <div class="ac-product-price">£12.50</div>
          </div>
        </div>

        <div style="padding:14px 18px;background:var(--ac-surface);border:1px solid var(--ac-border);border-radius:12px;font-size:12.5px;color:var(--ac-text-muted);margin-bottom:20px;line-height:1.6">
          <strong style="color:var(--ac-amber-lt);display:block;margin-bottom:3px">Age verification</strong>
          Your date of birth was never shared with Alkoshop. MOI computed the ${minAge}+ check based on your country (${flag} ${countryVal}) and shared only the pass/fail result, attested by your Osmio ID Pair.
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn-outline-ac" onclick="router.go('login')">← Sign out</button>
          <button class="btn-outline-ac" onclick="window.location.href='moi.html#dashboard'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Manage MOI Data
          </button>
        </div>
      </div>
    </div>`;
}

// ── Router init ────────────────────────────────────────────────
router
  .on('login',      renderLogin)
  .on('cert-check', renderCertCheck)
  .on('redirecting',renderRedirecting)
  .on('dashboard',  renderDashboard)
  .on('age-denied', renderAgeDenied)
  .init('login');

document.querySelectorAll('#demo-nav a').forEach(a => {
  if (a.href === location.href) a.classList.add('active');
});
window.addEventListener('hashchange', () => {
  document.querySelectorAll('#demo-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `cigs.html${location.hash}`);
  });
});
