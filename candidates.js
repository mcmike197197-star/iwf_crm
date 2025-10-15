 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/candidates.js b/candidates.js
index 52c99893eb34aca019783c4b49fbc355cef3ddd7..c3a4c9db27d9d286e82006dcad5144f0d4f79f06 100644
--- a/candidates.js
+++ b/candidates.js
@@ -1,41 +1,44 @@
 // ===============================
 // IWF CRM v9 — Candidates module
 // Lista + paginare + profil cu taburi
 // ===============================
 
 (function () {
   // ---- Config & storage keys
   const STORAGE_KEY = 'iwf_crm_v9_candidates';
   const STATE_KEY = 'iwf_crm_v9_candidates_ui';
 
   // ---- DOM refs already exist from index.html/app.js
   const mainContent = document.getElementById('main-content');
   const nav = document.querySelector('.nav');
 
   // ---- UI state (pagina curentă, filtrul, ultima vedere)
-  const ui = loadState() || { page: 1, perPage: 25, query: '', lastView: 'list' };
+  const DEFAULT_UI = { page: 1, perPage: 25, query: '', status: 'all', sort: 'recent', lastView: 'list' };
+  const ui = Object.assign({}, DEFAULT_UI, loadState() || {});
+  if (!['all', 'active', 'inactive'].includes(ui.status)) ui.status = DEFAULT_UI.status;
+  if (!['recent', 'name', 'experience'].includes(ui.sort)) ui.sort = DEFAULT_UI.sort;
 
   // ---- DB mock: 50 candidați RO + listă clienți
   let db = loadDB();
   if (!db) {
     db = seed();
     persistDB();
   }
 
   // ---------- Helpers ----------
   function saveState() { localStorage.setItem(STATE_KEY, JSON.stringify(ui)); }
   function loadState() {
     try { return JSON.parse(localStorage.getItem(STATE_KEY) || 'null'); } catch(e){ return null; }
   }
   function persistDB() { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
   function loadDB() {
     try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch(e){ return null; }
   }
   function fmtDate(d) {
     const dd = new Date(d);
     if (isNaN(dd)) return d || '';
     return dd.toLocaleDateString('ro-RO');
   }
   function ageFromDOB(d) {
     if (!d) return '';
     const dt = new Date(d);
@@ -92,133 +95,250 @@
         documents: [],
         history: [{ when: created, who: 'Manager demo', action: 'Profil creat'}],
         placements: [],
         financial: { feeMultiplier: 1.3, net: 5000, gross: null, fee: null }
       });
     }
 
     return { candidates, clients };
   }
 
   // ---------- Router pentru nav: setăm view-ul "candidates" după ce app.js își face treaba ----------
   nav.addEventListener('click', (e) => {
     const btn = e.target.closest('button[data-view="candidates"]');
     if (!btn) return;
     // lăsăm app.js să-și pună placeholderul, apoi randăm noi peste
     setTimeout(renderList, 0);
   });
 
   // Dacă cineva vrea să cheme din consolă:
   window.IWF_CANDIDATES = {
     openList: () => renderList(),
     openProfile: (id) => openProfile(id)
   };
 
   // ---------- Listă + paginare ----------
-  function getFiltered() {
-    const q = (ui.query || '').trim().toLowerCase();
-    let list = db.candidates.filter(c => c.external); // doar externi conform cerinței
-    if (q) {
-      list = list.filter(c =>
-        (`${c.firstName} ${c.lastName}`.toLowerCase().includes(q)) ||
-        (c.email || '').toLowerCase().includes(q) ||
-        (c.title || '').toLowerCase().includes(q) ||
-        (c.location || '').toLowerCase().includes(q)
-      );
-    }
-    return list;
-  }
+  function getFiltered() {
+    const q = (ui.query || '').trim().toLowerCase();
+    let list = db.candidates.filter(c => c.external); // doar externi conform cerinței
+
+    if (ui.status === 'active') {
+      list = list.filter(c => c.status === 'Activ');
+    } else if (ui.status === 'inactive') {
+      list = list.filter(c => c.status !== 'Activ');
+    }
+
+    if (q) {
+      list = list.filter(c =>
+        (`${c.firstName} ${c.lastName}`.toLowerCase().includes(q)) ||
+        (c.email || '').toLowerCase().includes(q) ||
+        (c.title || '').toLowerCase().includes(q) ||
+        (c.location || '').toLowerCase().includes(q)
+      );
+    }
+
+    if (ui.sort === 'name') {
+      list.sort((a, b) => {
+        const nameA = `${a.lastName || ''} ${a.firstName || ''}`.trim();
+        const nameB = `${b.lastName || ''} ${b.firstName || ''}`.trim();
+        return nameA.localeCompare(nameB, 'ro', { sensitivity: 'base' });
+      });
+    } else if (ui.sort === 'experience') {
+      list.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
+    } else {
+      list.sort((a, b) => {
+        const aDate = new Date(a.createdAt || 0).getTime();
+        const bDate = new Date(b.createdAt || 0).getTime();
+        return bDate - aDate;
+      });
+    }
+
+    return list;
+  }
 
   function paginate(list) {
     const total = list.length;
     const pages = Math.max(1, Math.ceil(total / ui.perPage));
     if (ui.page > pages) ui.page = pages;
     const start = (ui.page - 1) * ui.perPage;
     const slice = list.slice(start, start + ui.perPage);
     return { total, pages, slice };
   }
 
-  function renderList() {
-    ui.lastView = 'list'; saveState();
-    const list = getFiltered();
-    const { total, pages, slice } = paginate(list);
-
-    const tableRows = slice.map(c => `
-      <tr>
-        <td>
-          <a href="#" data-open="${c.id}" style="font-weight:700">${c.firstName} ${c.lastName}</a>
-          <div class="muted" style="font-size:12px">${c.email}</div>
-        </td>
-        <td>${c.location||''}</td>
-        <td>${c.title||''}</td>
-        <td>${c.experienceYears||0} ani</td>
-        <td><span class="badge ${c.status==='Activ'?'success':'warn'}">${c.status}</span></td>
-      </tr>
-    `).join('');
-
-    mainContent.innerHTML = `
-      <div class="card">
-        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
-          <h2 style="margin:0">Candidați externi</h2>
-          <div style="display:flex;gap:8px;align-items:center">
-            <input id="cand_q" placeholder="Caută nume, email, funcție, oraș" class="input" style="padding:8px 12px;min-width:280px">
-            <button class="btn" id="cand_add">Adaugă candidat</button>
-          </div>
-        </div>
-        <div style="margin-top:10px;overflow:auto">
-          <table>
-            <thead>
-              <tr><th>Candidat</th><th>Locație</th><th>Funcție</th><th>Experiență</th><th>Status</th></tr>
-            </thead>
-            <tbody>${tableRows}</tbody>
-          </table>
-        </div>
-        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px">
-          <div class="muted" style="font-size:13px">Total: <strong>${total}</strong> • Pagina <strong>${ui.page}</strong> / ${pages}</div>
-          <div style="display:flex;gap:8px">
-            <button class="btn" id="pg_prev" ${ui.page<=1?'disabled':''}>◀️ Anterioară</button>
-            <button class="btn" id="pg_next" ${ui.page>=pages?'disabled':''}>Următoare ▶️</button>
-          </div>
-        </div>
-      </div>
-    `;
-
-    // setăm inputul de căutare la valoarea curentă
-    const q = document.getElementById('cand_q');
-    q.value = ui.query || '';
-    q.addEventListener('keydown', (e)=>{
-      if (e.key === 'Enter') {
-        ui.query = q.value;
-        ui.page = 1;
-        saveState();
-        renderList();
-      }
-    });
-
-    document.getElementById('pg_prev')?.addEventListener('click', ()=>{
-      if (ui.page>1){ ui.page--; saveState(); renderList(); }
-    });
+  function renderList() {
+    ui.lastView = 'list'; saveState();
+    const list = getFiltered();
+    const { total, pages, slice } = paginate(list);
+
+    const cards = slice.map(c => {
+      const initials = `${(c.firstName || '?')[0] || ''}${(c.lastName || '?')[0] || ''}`.toUpperCase();
+      const createdAt = fmtDate(c.createdAt) || '—';
+      const history = (c.history && c.history.length) ? c.history[c.history.length - 1] : null;
+      const historyText = history ? `${fmtDate(history.when)} • ${history.action}` : 'Fără activitate recentă';
+      const statusClass = c.status === 'Activ' ? 'candidate-status--active' : 'candidate-status--inactive';
+      return `
+        <article class="candidate-card">
+          <div class="candidate-card__header">
+            <div class="candidate-avatar" aria-hidden="true">${initials}</div>
+            <div class="candidate-card__title">
+              <a href="#" data-open="${c.id}" class="candidate-name">${c.firstName} ${c.lastName}</a>
+              <p class="candidate-role">${c.title || 'Funcție nedefinită'}</p>
+            </div>
+            <span class="candidate-status ${statusClass}">${c.status}</span>
+          </div>
+          <div class="candidate-card__meta">
+            <span>📍 ${c.location || 'Locație indisponibilă'}</span>
+            <span>💼 ${c.experienceYears || 0} ani experiență</span>
+            <span>🗓 ${createdAt}</span>
+          </div>
+          <div class="candidate-card__contact">
+            <span>✉️ ${c.email || '—'}</span>
+            <span>📞 ${c.phone || '—'}</span>
+          </div>
+          <div class="candidate-card__footer">
+            <span class="candidate-history">${historyText}</span>
+            <button class="btn btn-light" data-open="${c.id}">Deschide profil</button>
+          </div>
+        </article>
+      `;
+    }).join('');
+
+    const emptyState = `
+      <div class="card candidate-empty">
+        <h3>Nu există candidați în această listă</h3>
+        <p>Încearcă să elimini filtrele de căutare sau adaugă un nou candidat pentru a începe să-ți construiești pipeline-ul.</p>
+      </div>
+    `;
+
+    mainContent.innerHTML = `
+      <section class="candidate-page">
+        <div class="card candidate-hero">
+          <div>
+            <p class="candidate-eyebrow">Talent pipeline</p>
+            <h2>Candidați externi</h2>
+            <p>Gestionează aplicanții activi și revino rapid la profilul lor complet, cu istoricul și documentele aferente.</p>
+          </div>
+          <div class="candidate-hero__actions">
+            <div class="candidate-stat">
+              <span class="candidate-stat__label">Total candidați</span>
+              <span class="candidate-stat__value">${total}</span>
+            </div>
+            <button class="btn btn-primary" id="cand_add" type="button">+ Adaugă candidat</button>
+          </div>
+          <p class="candidate-hero__note">Modificările și candidații nou adăugați sunt salvați automat în browserul tău.</p>
+        </div>
+
+        <div class="card candidate-toolbar">
+          <div class="candidate-toolbar__search">
+            <span aria-hidden="true">🔍</span>
+            <input id="cand_q" placeholder="Caută nume, email, funcție sau oraș" autocomplete="off">
+            ${ui.query ? '<button type="button" class="candidate-clear" id="cand_clear">✕</button>' : ''}
+          </div>
+          <div class="candidate-toolbar__meta">
+            <div class="candidate-filters" role="group" aria-label="Status candidați">
+              <button class="chip ${ui.status === 'all' ? 'chip--active' : ''}" data-status="all" type="button">Toți</button>
+              <button class="chip ${ui.status === 'active' ? 'chip--active' : ''}" data-status="active" type="button">Activi</button>
+              <button class="chip ${ui.status === 'inactive' ? 'chip--active' : ''}" data-status="inactive" type="button">Inactivi</button>
+            </div>
+            <label class="candidate-sort" for="cand_sort">
+              <span>Sortare</span>
+              <select id="cand_sort">
+                <option value="recent">Cele mai noi</option>
+                <option value="name">Nume A-Z</option>
+                <option value="experience">Experiență</option>
+              </select>
+            </label>
+            <span class="muted candidate-toolbar__page">Pagina <strong>${ui.page}</strong> din ${pages}</span>
+          </div>
+        </div>
+
+        <div class="candidate-grid">${cards || emptyState}</div>
+
+        <div class="card candidate-pagination">
+          <div class="muted">Se afișează ${slice.length} din ${total} candidați</div>
+          <div class="candidate-pagination__controls">
+            <button class="btn btn-light" id="pg_prev" ${ui.page<=1?'disabled':''}>◀️ Anterioară</button>
+            <button class="btn btn-light" id="pg_next" ${ui.page>=pages?'disabled':''}>Următoare ▶️</button>
+          </div>
+        </div>
+      </section>
+    `;
+
+    // setăm inputul de căutare la valoarea curentă
+    const q = document.getElementById('cand_q');
+    q.value = ui.query || '';
+    let debounce;
+    q.addEventListener('keydown', (e)=>{
+      if (e.key === 'Enter') {
+        ui.query = q.value;
+        ui.page = 1;
+        saveState();
+        renderList();
+      }
+    });
+    q.addEventListener('input', ()=>{
+      clearTimeout(debounce);
+      debounce = setTimeout(()=>{
+        ui.query = q.value;
+        ui.page = 1;
+        saveState();
+        renderList();
+      }, 250);
+    });
+
+    document.getElementById('cand_clear')?.addEventListener('click', ()=>{
+      ui.query = '';
+      ui.page = 1;
+      saveState();
+      renderList();
+    });
+
+    const sortSelect = document.getElementById('cand_sort');
+    if (sortSelect) {
+      sortSelect.value = ui.sort || 'recent';
+      sortSelect.addEventListener('change', ()=>{
+        ui.sort = sortSelect.value || 'recent';
+        ui.page = 1;
+        saveState();
+        renderList();
+      });
+    }
+
+    mainContent.querySelectorAll('[data-status]').forEach(btn => {
+      btn.addEventListener('click', ()=>{
+        const status = btn.getAttribute('data-status') || 'all';
+        if (ui.status === status) return;
+        ui.status = status;
+        ui.page = 1;
+        saveState();
+        renderList();
+      });
+    });
+
+    document.getElementById('pg_prev')?.addEventListener('click', ()=>{
+      if (ui.page>1){ ui.page--; saveState(); renderList(); }
+    });
     document.getElementById('pg_next')?.addEventListener('click', ()=>{
       const pages2 = Math.max(1, Math.ceil(getFiltered().length / ui.perPage));
       if (ui.page<pages2){ ui.page++; saveState(); renderList(); }
     });
 
     // Open profile
     mainContent.querySelectorAll('[data-open]').forEach(a=>{
       a.addEventListener('click', (e)=>{
         e.preventDefault();
         openProfile(a.getAttribute('data-open'));
       });
     });
 
     // Add candidate
     document.getElementById('cand_add').addEventListener('click', ()=>{
       const id = `cand-${Date.now()}`;
       const created = new Date().toISOString();
       const c = {
         id, external:true, firstName:'Prenume', lastName:'Nume', email:'nou@exemplu.ro', phone:'',
         nationality:'România', location:'București, România', title:'', experienceYears:0,
         createdBy: 'Manager demo', createdAt: created, dob:'', status:'Activ', notes:'',
         documents: [], history:[{when:created,who:'Manager demo',action:'Profil creat'}],
         placements: [], financial: { feeMultiplier: 1.3, net: 0, gross: null, fee: null }
       };
       db.candidates.unshift(c);
 
EOF
)
