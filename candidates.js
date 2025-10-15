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


  // ---- DB mock: 50 candidați RO + listă clienți
  let db = loadDB();
  if (!db) {
    db = seed();
    persistDB();
  }

  // ---------- Helpers ----------
  const notify = (msg, tone='info') => {
    if (window.IWF_APP?.showToast) { window.IWF_APP.showToast(msg, tone); }
    else { alert(msg); }
  };

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
    if (isNaN(dt)) return '';
    const diff = Date.now() - dt.getTime();
    const a = new Date(diff);
    return Math.abs(a.getUTCFullYear() - 1970);
  }
  function download(filename, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8;' }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function exportFiltered(list) {
    const header = 'id,nume,email,locatie,functie,status,experienta,creatLa';
    const rows = list.map(c => [
      c.id,
      `${c.firstName} ${c.lastName}`.trim(),
      c.email || '',
      c.location || '',
      c.title || '',
      c.status || '',
      c.experienceYears || 0,
      c.createdAt || ''
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
    download('candidati_filtrati.csv', [header].concat(rows).join('\n'));
    notify('Export CSV generat din filtrul curent.', 'success');
  }
  function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }

  // ---------- Seeding ----------
  function seed() {
    const first = [
      'Andrei','Ioana','Răzvan','Marius','Bogdan','Sorina','Matei','Alexandra','Elena','Vlad',
      'Cristina','Alin','Bianca','Cătălin','Daria','Iulia','Mihai','Adrian','Irina','Larisa'
    ];
    const last = [
      'Popescu','Marin','Dumitru','Petrescu','Iancu','Radu','Nichita','Vasilescu','Stoica','Dobre',
      'Ilie','Moldovan','Enache','Toma','Pop','Neagu','Georgescu','Stan','Cojocaru','Lungu'
    ];
    const cities = [
      'București','Cluj-Napoca','Iași','Brașov','Constanța','Timișoara','Sibiu','Oradea','Ploiești','Arad'
    ];
    const titles = [
      'Operator stivuitor','Inginer software','Asistent medical','Bucătar','Contabil',
      'Șofer CE','Reprezentant vânzări','Suport clienți','Tehnician service','Montator'
    ];
    const rand = a => a[Math.floor(Math.random()*a.length)];
    const clients = [
      'TransLogistic SRL','Hotel Continental','TechWorks România','EuroFoods SRL','Construct Plus',
      'Green Energy RO','MedicaLine','RetailPro','AutoDrive','BlueTech','FreshMarket','AgroFarm',
      'UrbanWorks','NovaPrint','ClujSoft'
    ];
    const candidates = [];
    const now = new Date();

    for (let i=1;i<=50;i++){
      const fn = rand(first), ln = rand(last);
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@exemplu.ro`;
      const created = new Date(now - Math.floor(Math.random()*1000*60*60*24*400)).toISOString();
      const dob = new Date(1985 + Math.floor(Math.random()*15), Math.floor(Math.random()*12), 1+Math.floor(Math.random()*27)).toISOString().slice(0,10);
      candidates.push({
        id: `cand-${i}`,
        external: true,
        firstName: fn,
        lastName: ln,
        email,
        phone: `+40 7${2000000 + i}`,
        nationality: 'România',
        location: `${rand(cities)}, România`,
        title: rand(titles),
        experienceYears: Math.floor(Math.random()*15),
        createdBy: 'Manager demo',
        createdAt: created,
        dob,
        status: Math.random()>.2 ? 'Activ' : 'Inactiv',
        notes: '',
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

    if (q) {
      list = list.filter(c =>
        (`${c.firstName} ${c.lastName}`.toLowerCase().includes(q)) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.location || '').toLowerCase().includes(q)
      );
    }

    return list;
  }

  function paginate(list) {
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / ui.perPage));
    if (ui.page > pages) ui.page = pages;
    const start = (ui.page - 1) * ui.perPage;
    const slice = list.slice(start, start + ui.perPage);
    return { total, pages, slice };
  }


    `;

    // setăm inputul de căutare la valoarea curentă
    const q = document.getElementById('cand_q');
    q.value = ui.query || '';

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
      persistDB();
      ui.page = 1; ui.query = ''; saveState();
      notify('Profil candidat nou creat (demo).', 'success');
      openProfile(id);
    });

    if (window.lucide) { window.lucide.createIcons(); }
  }

  // ---------- Profil candidat ----------
  const STAGES = ['Propus','Candidat sunat','Interviu candidat','Pas interviu','Interviu final client','Propunere','Angajat'];

  function openProfile(id) {
    ui.lastView = 'profile'; ui.lastId = id; saveState();
    const c = db.candidates.find(x => x.id === id);
    if (!c) { renderList(); return; }

    mainContent.innerHTML = `
      <div class="card">
        <button class="btn" id="back_to_list">⟵ Înapoi la lista de candidați</button>
      </div>

      <div class="card" style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
        <div style="min-width:220px">
          <div style="width:88px;height:88px;border-radius:50%;background:#f2e8f0;color:#a62091;font-weight:900;display:flex;align-items:center;justify-content:center;font-size:28px">
            ${c.firstName[0]}${c.lastName[0]}
          </div>
        </div>
        <div style="flex:1">
          <h2 style="margin:0">${c.firstName} ${c.lastName} <span class="badge ${c.status==='Activ'?'success':'warn'}">${c.status}</span></h2>
          <div class="muted" style="margin-top:4px">${c.title||'Funcție nedefinită'} • ${c.location||''}</div>
          <div class="muted" style="font-size:13px;margin-top:4px">Creat de <strong>${c.createdBy}</strong> pe <strong>${fmtDate(c.createdAt)}</strong></div>
        </div>
        <div>
          <button class="btn" id="save_profile">💾 Salvează</button>
        </div>
      </div>

      <div class="card">
        <div style="display:flex;gap:8px;flex-wrap:wrap" id="tabs">
          <button class="btn" data-tab="profil">Profil</button>
          <button class="btn" data-tab="documente">Documente</button>
          <button class="btn" data-tab="istoric">Istoric</button>
          <button class="btn" data-tab="plasari">Plasări</button>
          <button class="btn" data-tab="financiar">Financiar</button>
        </div>
      </div>

      <div id="tab-content"></div>
    `;

    document.getElementById('back_to_list').addEventListener('click', ()=>{ ui.lastView='list'; saveState(); renderList(); });
    document.getElementById('save_profile').addEventListener('click', ()=>{ persistDB(); notify('Modificările din profil au fost salvate.', 'success'); });

    const tabs = document.getElementById('tabs');
    tabs.addEventListener('click', (e)=>{
      const b = e.target.closest('button[data-tab]');
      if (!b) return;
      renderTab(b.dataset.tab, c);
    });

    // deschide implicit Profil
    renderTab('profil', c);
  }

  function renderTab(which, c) {
    const host = document.getElementById('tab-content');

    if (which === 'profil') {
      host.innerHTML = `
        <div class="card">
          <h3>Profil general</h3>
          <div style="display:grid;grid-template-columns:repeat(2, minmax(220px, 1fr));gap:10px">
            <label>Nume complet <input id="pf_full" class="input" value="${c.firstName} ${c.lastName}"></label>
            <label>Funcție <input id="pf_title" class="input" value="${c.title||''}"></label>
            <label>Email <input id="pf_email" class="input" value="${c.email||''}"></label>
            <label>Telefon <input id="pf_phone" class="input" value="${c.phone||''}"></label>
            <label>Naționalitate <input id="pf_nat" class="input" value="${c.nationality||'România'}"></label>
            <label>Locație <input id="pf_loc" class="input" value="${c.location||''}"></label>
            <label>Data nașterii <input id="pf_dob" type="date" class="input" value="${(c.dob||'').slice(0,10)}"></label>
            <label>Experiență (ani) <input id="pf_exp" type="number" class="input" value="${c.experienceYears||0}"></label>
            <label>Status
              <select id="pf_status" class="input">
                <option ${c.status==='Activ'?'selected':''}>Activ</option>
                <option ${c.status==='Inactiv'?'selected':''}>Inactiv</option>
              </select>
            </label>
          </div>
          <div style="margin-top:8px" class="muted">Vârstă estimată: <strong>${ageFromDOB(c.dob)||'—'}</strong> ani</div>
          <div style="margin-top:10px"><label>Note</label><textarea id="pf_notes" class="input" style="min-height:120px">${c.notes||''}</textarea></div>
          <div style="margin-top:12px"><button class="btn" id="pf_save_local">Salvează modificări</button></div>
        </div>
      `;
      document.getElementById('pf_save_local').addEventListener('click', ()=>{
        const [firstName, ...rest] = (document.getElementById('pf_full').value||'').trim().split(' ');
        c.firstName = firstName || c.firstName;
        c.lastName = rest.join(' ') || c.lastName;
        c.title = document.getElementById('pf_title').value || '';
        c.email = document.getElementById('pf_email').value || '';
        c.phone = document.getElementById('pf_phone').value || '';
        c.nationality = document.getElementById('pf_nat').value || 'România';
        c.location = document.getElementById('pf_loc').value || '';
        c.dob = document.getElementById('pf_dob').value || '';
        c.experienceYears = parseInt(document.getElementById('pf_exp').value||'0',10) || 0;
        c.status = document.getElementById('pf_status').value;
        c.notes = document.getElementById('pf_notes').value || '';
        c.history.push({ when: new Date().toISOString(), who:'Manager demo', action:'Profil actualizat' });
        persistDB();
        notify('Profil candidat actualizat.', 'success');
      });
      return;
    }

    if (which === 'documente') {
      host.innerHTML = `
        <div class="card">
          <h3>Documente</h3>
          <div style="display:grid;grid-template-columns:repeat(3, minmax(220px, 1fr));gap:10px">
            <label>Categorie
              <select id="doc_cat" class="input">
                <option>Carte identitate</option>
                <option>Statement bancar</option>
                <option>Diplomă</option>
                <option>CV</option>
                <option>Ofertă</option>
                <option>Alt document…</option>
              </select>
            </label>
            <label>Denumire
              <input id="doc_name" class="input" placeholder="Ex: CI - față/spate">
            </label>
            <label>Fișier
              <input id="doc_file" type="file" class="input">
            </label>
          </div>
          <div style="margin-top:12px"><button class="btn" id="doc_add">Încarcă (mock)</button></div>

          <div class="card" style="margin-top:12px">
            <h4 style="margin:0 0 8px">Documente existente</h4>
            <div id="doc_list">${renderDocs(c)}</div>
          </div>
        </div>
      `;
      document.getElementById('doc_add').addEventListener('click', ()=>{
        const cat = document.getElementById('doc_cat').value;
        const nm = document.getElementById('doc_name').value || '(fără nume)';
        c.documents.push({ id: 'doc-'+Date.now(), category: cat, name: nm, when: new Date().toISOString() });
        c.history.push({ when:new Date().toISOString(), who:'Manager demo', action:'Încărcat document: '+nm });
        persistDB();
        renderTab('documente', c);
      });
      return;
    }

    if (which === 'istoric') {
      host.innerHTML = `
        <div class="card">
          <h3>Istoric (audit trail)</h3>
          <div>${c.history.map(h=>`
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:8px 0">
              <div><strong>${h.who}</strong> — ${h.action}</div>
              <div class="muted" style="font-size:12px">${fmtDate(h.when)}</div>
            </div>
          `).join('') || '<div class="muted">Fără evenimente.</div>'}</div>
          <div style="margin-top:12px"><button class="btn" id="audit_dl">Descarcă CSV</button></div>
        </div>
      `;
      document.getElementById('audit_dl').addEventListener('click', ()=>{
        const rows = ['when,who,action'].concat(c.history.map(h=>`${h.when},${h.who},${h.action.replaceAll(',',';')}`));
        download(`audit_${c.id}.csv`, rows.join('\n'));
      });
      return;
    }

    if (which === 'plasari') {
      host.innerHTML = `
        <div class="card">
          <h3>Adaugă plasare</h3>
          <div style="display:grid;grid-template-columns:repeat(3, minmax(220px, 1fr));gap:10px">
            <label>Client <input id="pl_client" class="input" placeholder="Tastează primele litere…"></label>
            <label>Poziție <input id="pl_title" class="input" placeholder="Ex: Operator depozit"></label>
            <label>Etapă
              <select id="pl_stage" class="input">
                ${STAGES.map(s=>`<option>${s}</option>`).join('')}
              </select>
            </label>
          </div>
          <div style="margin-top:10px"><button class="btn" id="pl_add">Salvează plasarea</button></div>
        </div>

        <div class="card">
          <h3>Plasări existente</h3>
          <div>${(c.placements||[]).map(p=>{
            const pct = Math.round((STAGES.indexOf(p.stage)/(STAGES.length-1))*100);
            return `
              <div style="display:flex;align-items:center;gap:10px;margin:8px 0">
                <div style="min-width:240px"><strong>${p.client}</strong><div class="muted" style="font-size:12px">${p.title}</div></div>
                <div style="flex:1;height:8px;border-radius:999px;background:linear-gradient(90deg,#d946ef,#f59e0b,#22c55e);position:relative">
                  <div style="position:absolute;top:0;bottom:0;width:2px;background:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.3);left:${pct}%"></div>
                </div>
                <div class="muted" style="min-width:120px;font-size:12px;text-align:right">${p.stage}</div>
              </div>
            `;
          }).join('') || '<div class="muted">Nicio plasare încă.</div>'}</div>
        </div>
      `;

      // simplu autocomplete: Enter salvează
      const inputClient = document.getElementById('pl_client');
      inputClient.addEventListener('input', ()=>{
        // optional: se poate afișa un dropdown; deocamdată doar validăm la salvare
      });

      document.getElementById('pl_add').addEventListener('click', ()=>{
        const clientName = (document.getElementById('pl_client').value||'').trim();
        const title = (document.getElementById('pl_title').value||'').trim() || 'Poziție';
        const stage = document.getElementById('pl_stage').value;
        if (!clientName) { notify('Completează numele clientului.', 'warn'); return; }

        // dacă numele introdus începe cu literele unui client existent, îl „snap-uim” pe acela
        const snap = db.clients.find(x => x.toLowerCase().startsWith(clientName.toLowerCase()));
        const clientFinal = snap ? snap : clientName;

        c.placements.push({ id:'pl-'+Date.now(), client: clientFinal, title, stage });
        c.history.push({ when:new Date().toISOString(), who:'Manager demo', action:`Plasare: ${clientFinal} • ${title} (${stage})` });
        persistDB();
        renderTab('plasari', c);
      });
      return;
    }

    if (which === 'financiar') {
      const fm = c.financial || { feeMultiplier: 1.3, net: 0, gross: null, fee: null };
      const grossCalc = v => Math.round((v||0)*1.43); // estimativ
      host.innerHTML = `
        <div class="card">
          <h3>Financiar</h3>
          <div style="display:grid;grid-template-columns:repeat(2, minmax(220px, 1fr));gap:10px">
            <label>Fee (multiplicator) <input id="fi_mult" type="number" step="0.01" class="input" value="${fm.feeMultiplier||1.3}"></label>
            <label>Salariu NET (RON) <input id="fi_net" type="number" class="input" value="${fm.net||0}"></label>
            <label>Salariu BRUT (RON) <input id="fi_gross" type="number" class="input" value="${fm.gross||grossCalc(fm.net)||0}"></label>
            <label>Fee final (RON) <input id="fi_fee" type="number" class="input" value="${fm.fee||((fm.feeMultiplier||1.3)*(fm.gross||grossCalc(fm.net)||0))}"></label>
          </div>
          <div style="margin-top:10px"><button class="btn" id="fi_calc">Recalculează</button> <button class="btn" id="fi_save">Salvează</button></div>
          <p class="muted" style="margin-top:8px;font-size:12px">Notă: conversia NET→BRUT este estimativă (×1.43) pentru demo.</p>
        </div>
      `;
      const $ = id => document.getElementById(id);
      $('fi_calc').addEventListener('click', ()=>{
        const mult = parseFloat($('fi_mult').value||'1.3');
        const net = parseInt($('fi_net').value||'0',10);
        const gross = parseInt($('fi_gross').value||grossCalc(net),10);
        const fee = Math.round(mult * gross);
        $('fi_gross').value = gross;
        $('fi_fee').value = fee;
      });
      $('fi_save').addEventListener('click', ()=>{
        c.financial = {
          feeMultiplier: parseFloat($('fi_mult').value||'1.3'),
          net: parseInt($('fi_net').value||'0',10),
          gross: parseInt($('fi_gross').value||'0',10),
          fee: parseInt($('fi_fee').value||'0',10)
        };
        c.history.push({ when:new Date().toISOString(), who:'Manager demo', action:'Financiar actualizat' });
        persistDB();
        notify('Date financiare salvate.', 'success');
      });
      return;
    }
  }

  function renderDocs(c){
    if (!c.documents || !c.documents.length) return '<div class="muted">Nu există documente.</div>';
    return c.documents.map(d=>`
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:6px 0">
        <div><strong>${d.name}</strong><div class="muted" style="font-size:12px">${d.category}</div></div>
        <div class="muted" style="font-size:12px">${fmtDate(d.when)}</div>
      </div>
    `).join('');
  }

  // ---------- Pornire automată dacă utilizatorul intră pe „Candidați” ----------
  // Dacă user-ul a rămas în profil la refresh, îl redeschidem
  document.addEventListener('DOMContentLoaded', ()=>{
    const active = document.querySelector('.nav button.active');
    if (active && active.dataset.view === 'candidates') {
      // afișăm lista sau profilul după starea salvată
      if (ui.lastView === 'profile' && ui.lastId) {
        // mic delay ca app.js să scrie placeholder-ul
        setTimeout(()=>openProfile(ui.lastId), 0);
      } else {
        setTimeout(renderList, 0);
      }
    }
  });
})();
