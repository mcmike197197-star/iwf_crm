// =====================================
// IWF CRM v10 — Experience layer
// =====================================

const loginSection = document.getElementById('login');
const appShell = document.getElementById('app');
const btnEnter = document.getElementById('btn-enter');
const spinner = document.getElementById('spinner');
const nav = document.getElementById('nav');
const mainContent = document.getElementById('main-content');
const crumb = document.getElementById('crumb');
const mainArea = document.querySelector('.main');
const searchInput = document.getElementById('global-search');
const toast = document.getElementById('toast');

const VIEW_LABELS = {
  dashboard: 'Panou principal',
  candidates: 'Candidați',
  clients: 'Clienți',
  orders: 'Comenzi',
  requests: 'Cereri interne',
  reports: 'Rapoarte',
  settings: 'Setări'
};

const IWF_APP = window.IWF_APP || {};
window.IWF_APP = IWF_APP;

let toastTimer = null;
function showToast(message, tone = 'info') {
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.tone = tone;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 220);
  }, 2600);
}

IWF_APP.showToast = showToast;

function setActiveNav(view) {
  document.querySelectorAll('.nav button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
}

function showView(view) {
  const label = VIEW_LABELS[view] || 'Panou principal';
  crumb.textContent = label;
  if (mainArea) {
    mainArea.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const renderer = {
    dashboard: renderDashboard,
    orders: renderOrdersOverview,
    requests: renderRequestsOverview,
    reports: renderReportsOverview,
    settings: renderSettingsOverview
  }[view] || renderDashboard;

  renderer();
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

IWF_APP.showView = showView;

function revealApp() {
  document.body.classList.remove('login-open');
  loginSection.classList.add('hidden');
  appShell.classList.remove('hidden');
  showView('dashboard');
  if (window.lucide) {
    window.lucide.createIcons();
  }
  showToast('Bine ai venit în workspace-ul IWF CRM!', 'success');
}

btnEnter?.addEventListener('click', () => {
  spinner.classList.remove('hidden');
  setTimeout(() => {
    spinner.classList.add('hidden');
    revealApp();
  }, 900);
});

nav?.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-view]');
  if (!btn) return;
  const view = btn.dataset.view;
  setActiveNav(view);
  showView(view);
});

if (searchInput) {
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      showToast(`Căutare globală pentru "${event.target.value}" (demo)`, 'info');
    }
  });
}

function triggerNav(view) {
  const button = nav?.querySelector(`button[data-view="${view}"]`);
  if (button) {
    button.click();
  }
}

function handleQuickAction(action) {
  switch (action) {
    case 'candidate':
      triggerNav('candidates');
      setTimeout(() => window.IWF_APP?.showToast('Deschidere listă candidați (demo).', 'info'), 120);
      break;
    case 'order':
      triggerNav('orders');
      setTimeout(() => window.IWF_APP?.showToast('Sari direct în comenzi active.', 'info'), 120);
      break;
    case 'reports':
      triggerNav('reports');
      setTimeout(() => window.IWF_APP?.showToast('Rapoarte avansate generate pe baza datelor demo.', 'success'), 120);
      break;
    case 'calendar':
      triggerNav('requests');
      setTimeout(() => window.IWF_APP?.showToast('Agenda de recrutare internă este deschisă.', 'info'), 120);
      break;
    case 'notifications':
      showToast('Ai 3 notificări noi privind interviurile de azi.', 'info');
      break;
    case 'notes':
      showToast('Asistentul AI poate pregăti note pentru următoarele interviuri.', 'success');
      break;
    default:
      showToast('Acțiune rapidă în curs de implementare.', 'info');
  }
}

document.body.addEventListener('click', (event) => {
  const actionBtn = event.target.closest('[data-quick]');
  if (!actionBtn) return;
  handleQuickAction(actionBtn.dataset.quick);
});

if (window.lucide) {
  window.addEventListener('DOMContentLoaded', () => {
    window.lucide.createIcons();
  });
}

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    showToast('Paleta de comenzi AI se va deschide în versiunea live.', 'info');
  }
});

function renderDashboard() {
  const kpis = [
    { icon: 'users', label: 'Candidați activi', value: '126', note: '+12% vs. luna trecută', tone: 'success' },
    { icon: 'briefcase', label: 'Comenzi deschise', value: '18', note: '8 în fază de ofertă', tone: 'info' },
    { icon: 'clock-10', label: 'Timp mediu plasare', value: '24 zile', note: '-3 zile față de SLA', tone: 'success' },
    { icon: 'coins', label: 'Fee estimat', value: '1.3M RON', note: 'Forecast Q2 actualizat', tone: 'info' }
  ];

  const pipeline = [
    { stage: 'Propus', count: 34, pct: 48 },
    { stage: 'Interviu', count: 26, pct: 62 },
    { stage: 'Ofertă', count: 14, pct: 78 },
    { stage: 'Angajat', count: 9, pct: 92 }
  ];

  const timeline = [
    { title: 'Interviu final — TechWorks', time: 'Astăzi · 14:30', meta: 'Inginer software · Ana C.', tone: 'success' },
    { title: 'Feedback client — RetailPro', time: 'Astăzi · 12:00', meta: 'Operator depozit · Vlad P.', tone: 'info' },
    { title: 'Ofertă trimisă — ClujSoft', time: 'Ieri · 18:10', meta: 'QA Lead · confirmare în 24h', tone: 'warn' },
    { title: 'Cerere nouă — Stratospark', time: 'Ieri · 10:00', meta: 'Coordonator depozit · prioritate ridicată', tone: 'info' }
  ];

  const focusClients = [
    { client: 'ClujSoft', roles: 3, stage: 'Interviu final', manager: 'A. Ionescu' },
    { client: 'RetailPro', roles: 2, stage: 'Ofertă transmisă', manager: 'M. Dumitrescu' },
    { client: 'TechWorks România', roles: 4, stage: 'Screening tehnic', manager: 'I. Petrescu' }
  ];

  const quickWins = [
    { title: 'Finalizează contractul pentru Ana C.', detail: 'Ofertă acceptată — așteaptă semnarea digitală', tone: 'success' },
    { title: 'Trimite shortlist către Green Energy', detail: '3 candidați calificați disponibili azi', tone: 'info' },
    { title: 'Planifică interviu pentru Iulia N.', detail: 'Disponibilitate marți, 09:30', tone: 'warn' }
  ];

  const heroHTML = `
    <div class="card hero-card glass">
      <header>
        <div>
          <span class="pill pill-glass"><i data-lucide="sparkles"></i> Command center</span>
          <h1>Bine ai revenit, Ana!</h1>
          <p class="muted">Monitorizează pipeline-urile globale, SLA-urile și acțiunile urgente într-un singur spațiu.</p>
        </div>
        <div class="hero-meta">
          <div><strong>3</strong> interviuri finale programate azi</div>
          <div><strong>6</strong> candidați în faza de ofertă</div>
          <div><strong>18</strong> comenzi active în portofoliu</div>
        </div>
      </header>
      <div class="hero-actions">
        <button class="btn pill" data-quick="candidate"><i data-lucide="user-plus"></i> Adaugă candidat</button>
        <button class="btn pill secondary" data-quick="order"><i data-lucide="file-plus-2"></i> Comandă nouă</button>
        <button class="btn secondary" data-quick="reports"><i data-lucide="bar-chart-3"></i> Raport instant</button>
      </div>
    </div>`;

  const kpiHTML = `
    <div class="kpi-grid">
      ${kpis.map(k => `
        <div class="kpi-card">
          <div class="muted small"><i data-lucide="${k.icon}"></i> ${k.label}</div>
          <div class="kpi-value">${k.value}</div>
          <span class="muted small">${k.note}</span>
        </div>`).join('')}
    </div>`;

  const pipelineHTML = `
    <div class="card">
      <h3>Pipeline candidați</h3>
      <p class="muted small">Monitorizează etapele principale pentru plasările în derulare.</p>
      <div class="kpi-grid" style="margin-top:16px;">
        ${pipeline.map(p => `
          <div class="kpi-card">
            <div class="muted small">${p.stage}</div>
            <div class="kpi-value">${p.count}</div>
            <div class="progress"><div class="progress-bar" style="width:${p.pct}%"></div></div>
          </div>`).join('')}
      </div>
    </div>`;

  const timelineHTML = `
    <div class="card">
      <h3>Timeline zilnic</h3>
      <p class="muted small">Evenimente imediate pentru candidați și clienți.</p>
      <div class="timeline" style="margin-top:16px;">
        ${timeline.map(item => `
          <div class="timeline-item">
            <span class="timeline-bullet"></span>
            <strong>${item.title}</strong>
            <span class="muted small">${item.time} • ${item.meta}</span>
          </div>`).join('')}
      </div>
    </div>`;

  const focusHTML = `
    <div class="card">
      <h3>Clienți în focus</h3>
      <div class="table-wrap" style="margin-top:16px;">
        <table>
          <thead><tr><th>Client</th><th>Roluri active</th><th>Stadiu</th><th>Account manager</th></tr></thead>
          <tbody>
            ${focusClients.map(row => `
              <tr>
                <td><strong>${row.client}</strong></td>
                <td>${row.roles}</td>
                <td>${row.stage}</td>
                <td>${row.manager}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  const quickWinsHTML = `
    <div class="card">
      <h3>Acțiuni recomandate</h3>
      <div class="list-tile" style="margin-top:16px;">
        ${quickWins.map(win => `
          <div>
            <div><strong>${win.title}</strong></div>
            <div class="muted small">${win.detail}</div>
          </div>`).join('')}
      </div>
    </div>`;

  mainContent.innerHTML = `
    ${heroHTML}
    ${kpiHTML}
    <div class="grid-two">
      ${pipelineHTML}
      ${timelineHTML}
    </div>
    <div class="grid-two">
      ${focusHTML}
      ${quickWinsHTML}
    </div>
  `;
}

function renderOrdersOverview() {
  mainContent.innerHTML = `
    <div class="card glass">
      <h2>Monitorizare comenzi</h2>
      <p class="muted small">Distribuție comenzi, SLA-uri și prognoză de ocupare în timp real.</p>
      <div class="kpi-grid" style="margin-top:16px;">
        <div class="kpi-card">
          <div class="muted small"><i data-lucide="target"></i> Obiectiv total</div>
          <div class="kpi-value">74 poziții</div>
          <span class="muted small">65% acoperite</span>
        </div>
        <div class="kpi-card">
          <div class="muted small"><i data-lucide="alarm-clock"></i> SLA mediu</div>
          <div class="kpi-value">24 zile</div>
          <span class="muted small">-3 zile vs. Q1</span>
        </div>
        <div class="kpi-card">
          <div class="muted small"><i data-lucide="shield-check"></i> Comenzi critice</div>
          <div class="kpi-value">4</div>
          <span class="muted small">Necesită shortlist în 48h</span>
        </div>
      </div>
      <div class="table-wrap" style="margin-top:20px;">
        <table>
          <thead><tr><th>ID</th><th>Client</th><th>Rol</th><th>Progres</th><th>Prioritate</th></tr></thead>
          <tbody>
            <tr><td><strong>ORD-102</strong></td><td>TechWorks</td><td>Inginer software</td><td>3/5</td><td><span class="badge warn">Ridicată</span></td></tr>
            <tr><td><strong>ORD-099</strong></td><td>RetailPro</td><td>Supervisor logistică</td><td>2/4</td><td><span class="badge info">Medie</span></td></tr>
            <tr><td><strong>ORD-095</strong></td><td>ClujSoft</td><td>QA Lead</td><td>1/2</td><td><span class="badge success">Control</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="hero-actions" style="margin-top:20px;">
        <button class="btn" data-quick="order"><i data-lucide="file-plus-2"></i> Creează comandă</button>
        <button class="btn secondary" data-quick="reports"><i data-lucide="bar-chart-3"></i> Raport comandă</button>
      </div>
    </div>
  `;
}

function renderRequestsOverview() {
  mainContent.innerHTML = `
    <div class="card glass">
      <h2>Cereri interne în derulare</h2>
      <p class="muted small">Companiile din grup și statusul cererilor de recrutare interne.</p>
      <div class="kpi-grid" style="margin-top:16px;">
        <div class="kpi-card">
          <div class="muted small">Cereri active</div>
          <div class="kpi-value">12</div>
          <span class="muted small">4 cu prioritate ridicată</span>
        </div>
        <div class="kpi-card">
          <div class="muted small">Candidați propuși</div>
          <div class="kpi-value">31</div>
          <span class="muted small">8 în fază de interviu</span>
        </div>
        <div class="kpi-card">
          <div class="muted small">Rată conversie</div>
          <div class="kpi-value">42%</div>
          <span class="muted small">vs. țintă 38%</span>
        </div>
      </div>
      <div class="list-tile" style="margin-top:18px;">
        <div>
          <strong>Stratospark — Coordonator depozit</strong>
          <div class="muted small">În selecție · 2 candidați în shortlist</div>
        </div>
        <div>
          <strong>International Work Finder — Specialist recrutare</strong>
          <div class="muted small">Deschisă · așteaptă shortlist actualizat</div>
        </div>
        <div>
          <strong>Sasu EcoSynergy — Tehnician mentenanță</strong>
          <div class="muted small">Ofertă transmisă · follow-up în 24h</div>
        </div>
      </div>
    </div>
  `;
}

function renderReportsOverview() {
  mainContent.innerHTML = `
    <div class="card glass">
      <h2>Rapoarte & forecast</h2>
      <p class="muted small">Trenduri, performanță financiară și evoluția pipeline-ului.</p>
      <div class="kpi-grid" style="margin-top:16px;">
        <div class="kpi-card">
          <div class="muted small">Hires luna curentă</div>
          <div class="kpi-value">21</div>
          <span class="muted small">+4 față de luna trecută</span>
        </div>
        <div class="kpi-card">
          <div class="muted small">Fee mediu / angajat</div>
          <div class="kpi-value">62k RON</div>
          <span class="muted small">ROI +18%</span>
        </div>
        <div class="kpi-card">
          <div class="muted small">Conversie pipeline</div>
          <div class="kpi-value">27%</div>
          <span class="muted small">Țintă Q2: 30%</span>
        </div>
      </div>
      <div class="hero-actions" style="margin-top:20px;">
        <button class="btn secondary" data-quick="reports"><i data-lucide="sparkles"></i> Exportă insight-uri</button>
      </div>
    </div>
  `;
}

function renderSettingsOverview() {
  mainContent.innerHTML = `
    <div class="card glass">
      <h2>Personalizare demo</h2>
      <p class="muted small">Activează module experimentale și resetează datele generate în browser.</p>
      <div class="kpi-grid" style="margin-top:16px;">
        <div class="kpi-card">
          <div class="muted small">Mod AI Assistant</div>
          <div class="muted small">Explicații contextuale pentru candidați</div>
          <button class="btn secondary" data-toggle="ai">Activează (demo)</button>
        </div>
        <div class="kpi-card">
          <div class="muted small">Integrare calendar</div>
          <div class="muted small">Sincronizare Outlook & Google</div>
          <button class="btn secondary" data-toggle="calendar">Sincronizare</button>
        </div>
        <div class="kpi-card">
          <div class="muted small">Audit & export</div>
          <div class="muted small">CSV complet candidați & comenzi</div>
          <button class="btn secondary" data-toggle="export">Generează CSV</button>
        </div>
      </div>
      <div class="hero-actions" style="margin-top:24px;">
        <button class="btn" id="reset-demo"><i data-lucide="rotate-ccw"></i> Resetare date demo</button>
      </div>
    </div>
  `;

  mainContent.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(`${btn.dataset.toggle} va fi activat în versiunea conectată.`, 'info');
    });
  });

  document.getElementById('reset-demo')?.addEventListener('click', () => {
    resetDemo();
  });
}

function resetDemo() {
  localStorage.clear();
  showToast('Datele demo au fost resetate. Reîncărcare în curs…', 'success');
  setTimeout(() => window.location.reload(), 1000);
}

window.resetDemo = resetDemo;
