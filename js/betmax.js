// =============================================================
// BETMAX — Sports Betting app screens
// Age requirement: 18+ · Region: US ✓, Germany ✓, India ✗
// =============================================================

const router = new Router();

// Countries allowed / denied for sports betting
const BM_REGION_RULES = {
  'United States': true,
  'Germany':       true,
  'India':         false,
};

function bmLogoSVG(size = 32) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#16a34a"/>
    <path d="M20 6 L26 16 L38 18 L29 27 L31 39 L20 33 L9 39 L11 27 L2 18 L14 16Z" fill="#ca8a04" opacity=".9"/>
    <path d="M20 10 L24 18 L33 19.5 L26.5 26 L28 35 L20 31 L12 35 L13.5 26 L7 19.5 L16 18Z" fill="#fef08a"/>
  </svg>`;
}

function bmTopBar(showProfile = false) {
  return `
    <header class="bm-topbar">
      <div class="bm-logo-mark">
        ${bmLogoSVG(30)}
        <span class="bm-logo-text"><span class="bm-bet">Bet</span><span class="bm-max">Max</span></span>
      </div>
      ${showProfile ? `
        <div class="bm-topbar-actions">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--bm-text-muted)">
            <div class="avatar" style="background:#16a34a;width:30px;height:30px;font-size:11px">AJ</div>
            Alex Johnson
          </div>
        </div>` : `
        <div class="bm-topbar-actions">
          <a href="index.html" style="font-size:12px;color:var(--bm-text-muted);font-weight:600">← Demo Hub</a>
        </div>`}
    </header>`;
}

// ── Auth helpers ───────────────────────────────────────────────
function startAuth(demoDob = null, demoCountry = null) {
  if (demoDob) sessionStorage.setItem('moi_demo_dob', demoDob);
  if (demoCountry) sessionStorage.setItem('moi_demo_country', demoCountry);
  sessionStorage.setItem('moi_oauth_request', JSON.stringify({
    appName: 'BetMax',
    appId: 'betmax',
    requestId: 'req_' + Date.now(),
    certUsed: MOCK.currentUser.certs.numberplate.id,
    requiredFields: ['firstName', 'lastName', 'above18', 'country'],
    optionalFields: ['email'],
    returnTo: 'betmax.html#redirecting'
  }));
  router.go('cert-check');
}

function startAuthYoung() {
  startAuth('2010-05-15'); // age ~15 in 2026 → under 18
}

function startAuthIndia() {
  startAuth(null, 'India'); // adult but India region → blocked
}

// ── Screen: Login ──────────────────────────────────────────────
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="bm-screen">
      ${bmTopBar()}
      <div class="bm-hero">
        <div class="bm-login-card">
          ${bmLogoSVG(48)}
          <h1 class="bm-login-tagline" style="margin-top:12px">Bet on what you know.</h1>
          <p class="bm-login-sub">BetMax Sports — regulated betting platform. Must be 18+. Available in permitted regions only.</p>

          <div class="bm-trust-bar">
            <span>18+ verified</span>
            <span class="bm-trust-bar-dot"></span>
            <span>Region-checked</span>
            <span class="bm-trust-bar-dot"></span>
            <span>No passwords</span>
          </div>

          <button class="btn-osmio-bm" onclick="startAuth()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Sign in with Osmio ID Pair
          </button>

          <div class="bm-demo-links">
            <span class="bm-demo-link-label">Demo scenarios</span>
            <span class="bm-demo-link" onclick="startAuth()">
              ✓ Normal signup — Alex (US, age 34) passes 18+ &amp; region check
            </span>
            <span class="bm-demo-link" onclick="startAuthYoung()">
              ⚠ Simulate: Under-18 user → Age restriction
            </span>
            <span class="bm-demo-link" onclick="startAuthIndia()">
              ⚠ Simulate: India resident → Region not permitted
            </span>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Screen: Osmio ID Pair Check ────────────────────────────────
function renderCertCheck() {
  document.getElementById('app').innerHTML = `
    <div class="bm-screen">
      ${bmTopBar()}
      <div class="bm-cert-screen">
        <div class="bm-cert-card">
          <div class="bm-cert-header">
            <div class="bm-cert-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
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
    { icon: 'spin', type: 'loading', text: 'Preparing MOI licence request (18+ · country)...', sub: null, delay: 3800 },
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
    <div class="bm-screen">
      ${bmTopBar()}
      <div class="bm-redirect-screen">
        <div class="bm-redirect-card">
          <div class="bm-redirect-spinner">
            ${SPINNER_SVG.replace('width="18"','width="28"').replace('height="18"','height="28"').replace('stroke-width="2.5"','stroke-width="2"').replace('currentColor','#16a34a')}
          </div>
          <h2>Receiving your profile</h2>
          <p>Securely transferring your MOI data to BetMax…</p>
          <div class="bm-redirect-progress">
            <div class="bm-redirect-bar" id="prog-bar"></div>
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
function renderAgeDenied() {
  sessionStorage.removeItem('moi_demo_dob');
  sessionStorage.removeItem('moi_demo_country');
  document.getElementById('app').innerHTML = `
    <div class="bm-screen">
      ${bmTopBar()}
      <div class="bm-denied-screen">
        <div class="bm-denied-card">
          <div class="bm-denied-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef476f" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2>Age Restriction</h2>
          <p>You must be 18 or older to use BetMax Sports.<br>
          Your MOI age attestation confirmed you do not meet this requirement.</p>

          <div style="margin-bottom:20px;padding:14px;background:rgba(239,71,111,.08);border:1px solid rgba(239,71,111,.2);border-radius:10px;font-size:12.5px;color:var(--bm-text-muted);text-align:left">
            <strong style="color:var(--bm-text);display:block;margin-bottom:4px">Privacy preserved</strong>
            Your date of birth was never shared. MOI sent only the pass/fail verdict for the 18+ check, attested by your Osmio ID Pair.
          </div>

          <button class="btn-outline-bm" style="width:100%" onclick="router.go('login')">
            ← Back to login
          </button>
        </div>
      </div>
    </div>`;
}

// ── Screen: Region Denied ──────────────────────────────────────
function renderRegionDenied(country) {
  sessionStorage.removeItem('moi_demo_dob');
  sessionStorage.removeItem('moi_demo_country');
  document.getElementById('app').innerHTML = `
    <div class="bm-screen">
      ${bmTopBar()}
      <div class="bm-denied-screen">
        <div class="bm-denied-card">
          <div class="bm-denied-icon" style="background:rgba(245,158,11,.1)">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
          <h2>Region Not Permitted</h2>
          <p>BetMax Sports is not currently licensed to operate in <strong style="color:var(--bm-text)">${country || 'your region'}</strong>.<br>
          Sports betting may be restricted or not regulated in this jurisdiction.</p>

          <div style="margin-bottom:20px;padding:14px;background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);border-radius:10px;font-size:12.5px;color:var(--bm-text-muted);text-align:left">
            <strong style="color:var(--bm-gold);display:block;margin-bottom:6px">Permitted regions</strong>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span style="padding:3px 8px;background:rgba(22,163,74,.1);border:1px solid rgba(22,163,74,.2);border-radius:6px;font-size:11.5px;color:#16a34a;font-weight:600">🇺🇸 United States</span>
              <span style="padding:3px 8px;background:rgba(22,163,74,.1);border:1px solid rgba(22,163,74,.2);border-radius:6px;font-size:11.5px;color:#16a34a;font-weight:600">🇩🇪 Germany</span>
              <span style="padding:3px 8px;background:rgba(239,71,111,.08);border:1px solid rgba(239,71,111,.2);border-radius:6px;font-size:11.5px;color:#ef476f;font-weight:600">🇮🇳 India — not permitted</span>
            </div>
          </div>

          <div style="margin-bottom:20px;padding:14px;background:rgba(0,180,216,.04);border:1px solid rgba(0,180,216,.1);border-radius:10px;font-size:12.5px;color:var(--bm-text-muted);text-align:left">
            <strong style="color:var(--bm-text);display:block;margin-bottom:4px">How this was checked</strong>
            Your country of residence was attested by your Osmio ID Pair and shared with BetMax as a required field. Your raw date of birth was never shared — only the 18+ pass/fail result.
          </div>

          <button class="btn-outline-bm" style="width:100%" onclick="router.go('login')">
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
  const above18 = shared.above18 !== undefined ? shared.above18 : { value: true, verified: moi.dob.verified };
  const country = shared.country || moi.country;

  // Age gate
  if (above18 && above18.value === false) {
    renderAgeDenied();
    return;
  }

  // Region gate
  const countryVal = country ? country.value : null;
  if (countryVal && BM_REGION_RULES[countryVal] === false) {
    renderRegionDenied(countryVal);
    return;
  }

  sessionStorage.removeItem('moi_demo_dob');
  sessionStorage.removeItem('moi_demo_country');

  const firstName = (shared.firstName || moi.firstName).value;
  const countryFlag = { 'United States': '🇺🇸', 'Germany': '🇩🇪', 'India': '🇮🇳' }[countryVal] || '🌍';

  document.getElementById('app').innerHTML = `
    <div class="bm-screen">
      ${bmTopBar(true)}
      <div class="bm-dashboard">
        <div class="bm-dash-welcome">Welcome back, verified bettor</div>
        <div class="bm-dash-name">${firstName}'s Bets ⚽</div>

        <div class="bm-moi-notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Age 18+ verified via MOI · Region: ${countryFlag} ${countryVal || 'Verified'} · Signed in with Osmio ID Pair
        </div>

        <div class="bm-section-label">Live matches — place your bets</div>
        <div class="bm-odds-grid">
          <div class="bm-match-card">
            <div class="bm-match-teams">Man City vs Arsenal</div>
            <div class="bm-match-league">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League · Live 67'</div>
            <div class="bm-match-odds">
              <div class="bm-odd"><div class="bm-odd-label">Home</div><div class="bm-odd-val">1.85</div></div>
              <div class="bm-odd"><div class="bm-odd-label">Draw</div><div class="bm-odd-val">3.40</div></div>
              <div class="bm-odd"><div class="bm-odd-label">Away</div><div class="bm-odd-val">4.20</div></div>
            </div>
          </div>
          <div class="bm-match-card">
            <div class="bm-match-teams">Lakers vs Warriors</div>
            <div class="bm-match-league">🇺🇸 NBA · Starts 20:30</div>
            <div class="bm-match-odds">
              <div class="bm-odd"><div class="bm-odd-label">Lakers</div><div class="bm-odd-val">2.10</div></div>
              <div class="bm-odd"><div class="bm-odd-label">Warriors</div><div class="bm-odd-val">1.72</div></div>
            </div>
          </div>
          <div class="bm-match-card">
            <div class="bm-match-teams">Real Madrid vs Bayern</div>
            <div class="bm-match-league">🏆 Champions League · Live 34'</div>
            <div class="bm-match-odds">
              <div class="bm-odd"><div class="bm-odd-label">Home</div><div class="bm-odd-val">2.25</div></div>
              <div class="bm-odd"><div class="bm-odd-label">Draw</div><div class="bm-odd-val">3.10</div></div>
              <div class="bm-odd"><div class="bm-odd-label">Away</div><div class="bm-odd-val">3.50</div></div>
            </div>
          </div>
          <div class="bm-match-card">
            <div class="bm-match-teams">Djokovic vs Alcaraz</div>
            <div class="bm-match-league">🎾 ATP Madrid · Live Set 2</div>
            <div class="bm-match-odds">
              <div class="bm-odd"><div class="bm-odd-label">Djokovic</div><div class="bm-odd-val">1.55</div></div>
              <div class="bm-odd"><div class="bm-odd-label">Alcaraz</div><div class="bm-odd-val">2.45</div></div>
            </div>
          </div>
        </div>

        <div style="padding:16px 20px;background:var(--bm-surface);border:1px solid var(--bm-border);border-radius:12px;font-size:13px;color:var(--bm-text-muted);margin-bottom:20px">
          <strong style="color:var(--bm-gold);display:block;margin-bottom:4px">💰 Wallet balance: £250.00</strong>
          Open bets: 2 · Total staked: £35.00 · Potential return: £82.50
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn-outline-bm" onclick="router.go('login')">← Sign out</button>
          <button class="btn-outline-bm" onclick="window.location.href='moi.html#dashboard'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Manage MOI Data
          </button>
        </div>
      </div>
    </div>`;
}

// ── Router init ────────────────────────────────────────────────
router
  .on('login',         renderLogin)
  .on('cert-check',    renderCertCheck)
  .on('redirecting',   renderRedirecting)
  .on('dashboard',     renderDashboard)
  .on('age-denied',    renderAgeDenied)
  .on('region-denied', () => renderRegionDenied('India'))
  .init('login');

document.querySelectorAll('#demo-nav a').forEach(a => {
  if (a.href === location.href) a.classList.add('active');
});
window.addEventListener('hashchange', () => {
  document.querySelectorAll('#demo-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `betmax.html${location.hash}`);
  });
});
