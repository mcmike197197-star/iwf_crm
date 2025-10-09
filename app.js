// ========== IWF CRM v9 — Logica principală ==========

// Referințe elemente
const login = document.getElementById('login');
const app = document.getElementById('app');
const btn = document.getElementById('btn-enter');
const spinner = document.getElementById('spinner');
const nav = document.querySelector('.nav');
const content = document.getElementById('content');

// Funcție de schimbare pagină
function changeView(view) {
  document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`[data-view='${view}']`);
  if (activeBtn) activeBtn.classList.add('active');

  if (view === 'dashboard') {
    content.innerHTML = `<div class="card"><h2>Panou principal</h2><p>Statistici generale, activitate recentă și informații despre recrutări.</p></div>`;
  }
  if (view === 'candidates') {
    content.innerHTML = `<div class="card"><h2>Candidați</h2><p>Listă candidați externi și interni. (funcționalități complete vor fi adăugate)</p></div>`;
  }
  if (view === 'clients') {
    content.innerHTML = `<div class="card"><h2>Clienți</h2><p>Companii partenere și contacte asociate.</p></div>`;
  }
  if (view === 'orders') {
    content.innerHTML = `<div class="card"><h2>Comenzi</h2><p>Monitorizare plasamente și poziții active.</p></div>`;
  }
  if (view === 'requests') {
    content.innerHTML = `<div class="card"><h2>Cereri interne</h2><p>Solicitări și aprobări interne.</p></div>`;
  }
  if (view === 'reports') {
    content.innerHTML = `<div class="card"><h2>Rapoarte</h2><p>Analiză performanță și grafice de recrutare.</p></div>`;
  }
  if (view === 'settings') {
    content.innerHTML = `<div class="card"><h2>Setări</h2><p>Personalizare aplicație și preferințe.</p></div>`;
  }
}

// Login funcțional
btn.addEventListener('click', () => {
  spinner.style.display = 'block';
  setTimeout(() => {
    spinner.style.display = 'none';
    login.style.display = 'none';
    app.style.display = 'flex';
    changeView('dashboard');
  }, 1000);
});

// Navigare între pagini
nav.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const view = btn.dataset.view;
  changeView(view);
});

// Pornire aplicație (implicit login)
changeView('dashboard');
