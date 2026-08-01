/* ==========================================================================
   IndustrCons OS — MODULE VIEWS
   Each MODULES.<key> returns an HTML string for the #content router in app.js
   ========================================================================== */
const fmtMoney = n => new Intl.NumberFormat('az-AZ', { maximumFractionDigits: 0 }).format(n) + ' ₼';
const fmtNum = n => new Intl.NumberFormat('az-AZ').format(n);

const MODULES = {};

/* ---------------------------------------------------------------- DASHBOARD */
MODULES.dashboard = () => {
  const projects = DB.get('projects', []);
  const tasks = DB.get('tasks', []);
  const incidents = DB.get('hse_incidents', []);
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const activeCount = projects.filter(p => p.status === 'active').length;
  const avgProgress = projects.length ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0;

  return `
  <div class="grid grid-4" style="margin-bottom:18px;">
    ${kpiCard('Aktiv Layihələr', activeCount, '🏗️', '#2E6FF2', '+1 bu ay', 'up')}
    ${kpiCard('Ümumi Büdcə', fmtMoney(totalBudget), '💰', '#22C55E', '', '')}
    ${kpiCard('Xərclənib', fmtMoney(totalSpent), '📉', '#FF7A1A', Math.round(totalSpent/totalBudget*100)+'% istifadə', totalSpent/totalBudget > 0.85 ? 'down':'up')}
    ${kpiCard('Orta İrəliləyiş', avgProgress + '%', '📈', '#6C4CF2', '', '')}
  </div>

  <div class="grid" style="grid-template-columns:2fr 1fr; margin-bottom:18px;">
    <div class="card">
      <div class="card-header">
        <div><h3>Layihələrin İrəliləyişi</h3><p class="card-header-sub">Büdcə və tamamlanma faizi</p></div>
        <button class="btn btn-outline btn-sm" onclick="navigateTo('projects')">Hamısına bax →</button>
      </div>
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${projects.map(p => `
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
              <span style="font-weight:600;">${p.name}</span>
              <span style="color:var(--text-faint); font-family:var(--font-mono);">${p.progress}%</span>
            </div>
            <div class="progress-bar"><div class="progress-bar-fill" style="width:${p.progress}%; ${p.risk==='yüksək' ? 'background:linear-gradient(90deg,var(--orange),var(--red));':''}"></div></div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h3>Bugünkü Tapşırıqlar</h3></div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${tasks.length ? tasks.map(t => `
          <label style="display:flex; align-items:flex-start; gap:10px; font-size:13px; cursor:pointer;">
            <input type="checkbox" ${t.done?'checked':''} onchange="toggleTask('${t.id}')" style="margin-top:3px; width:auto;">
            <span style="${t.done?'text-decoration:line-through; color:var(--text-faint);':''}">
              ${t.title}<br><span style="font-size:11px; color:var(--text-faint);">${t.project} · ${t.due}</span>
            </span>
          </label>
        `).join('') : emptyState('📋','Tapşırıq yoxdur','Hələki heç bir tapşırıq əlavə olunmayıb')}
      </div>
    </div>
  </div>

  <div class="grid grid-2">
    <div class="card">
      <div class="card-header"><h3>Son HSE Qeydləri</h3><span class="badge ${incidents.length?'orange':'green'}">${incidents.length} qeyd</span></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Tarix</th><th>Növ</th><th>Təsvir</th><th>Ciddiyyət</th></tr></thead>
        <tbody>
          ${incidents.map(i => `<tr><td style="font-family:var(--font-mono); font-size:12px;">${i.date}</td><td>${i.type}</td><td>${i.desc}</td><td>${severityBadge(i.severity)}</td></tr>`).join('')}
        </tbody>
      </table></div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Risk Xülasəsi</h3></div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${projects.map(p => `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border);">
            <span style="font-size:13px;">${p.name}</span>
            ${riskBadge(p.risk)}
          </div>
        `).join('')}
      </div>
    </div>
  </div>
  `;
};

function kpiCard(label, value, icon, color, delta, dir) {
  return `
  <div class="card kpi-card">
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      <span class="kpi-label">${label}</span>
      <span class="kpi-icon" style="background:${color}22; color:${color};">${icon}</span>
    </div>
    <span class="kpi-value">${value}</span>
    ${delta ? `<span class="kpi-delta ${dir}">${delta}</span>` : ''}
  </div>`;
}
function emptyState(glyph, title, sub) {
  return `<div class="empty-state"><div class="glyph">${glyph}</div><h4>${title}</h4><p>${sub}</p></div>`;
}
function severityBadge(sev) {
  const map = { 'yüksək': 'red', 'orta': 'orange', 'aşağı': 'green' };
  return `<span class="badge ${map[sev] || 'gray'}">${sev}</span>`;
}
function riskBadge(risk) {
  const map = { 'yüksək': 'red', 'orta': 'orange', 'aşağı': 'green' };
  return `<span class="badge ${map[risk] || 'gray'}">${risk}</span>`;
}

/* ---------------------------------------------------------------- COMPANIES */
MODULES.companies = () => {
  const companies = DB.get('companies', []);
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>Şirkətlər / Müştərilər / Podratçılar</h3><p class="card-header-sub">${companies.length} qeyd</p></div>
      <button class="btn btn-primary btn-sm" onclick="openCompanyForm()">+ Yeni Şirkət</button>
    </div>
    ${companies.length ? `
    <div class="table-wrap"><table>
      <thead><tr><th>Ad</th><th>Növ</th><th>Əlaqədar Şəxs</th><th>Telefon</th><th>Şəhər</th><th>Reytinq</th><th></th></tr></thead>
      <tbody>
        ${companies.map(c => `
          <tr>
            <td style="font-weight:600;">${c.name}</td>
            <td><span class="badge blue">${c.type}</span></td>
            <td>${c.contact}</td>
            <td style="font-family:var(--font-mono); font-size:12px;">${c.phone}</td>
            <td>${c.city}</td>
            <td>${'★'.repeat(c.rating)}${'☆'.repeat(5-c.rating)}</td>
            <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('companies','${c.id}')">Sil</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table></div>
    ` : emptyState('🏢','Şirkət yoxdur','İlk şirkəti əlavə etmək üçün yuxarıdakı düyməni basın')}
  </div>`;
};

function openCompanyForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Şirkət</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="companyForm">
      <div class="field"><label>Şirkət adı</label><input required name="name" placeholder="Məs: Baku Steel Construction"></div>
      <div class="field-row">
        <div class="field"><label>Növ</label>
          <select name="type">
            <option>Sifarişçi</option><option>Podratçı</option><option>Alt-podratçı</option>
            <option>Təchizatçı</option><option>Konsaltinq</option><option>Dövlət Qurumu</option>
          </select>
        </div>
        <div class="field"><label>Şəhər</label><input name="city" placeholder="Bakı"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Əlaqədar şəxs</label><input name="contact" placeholder="Ad Soyad"></div>
        <div class="field"><label>Telefon</label><input name="phone" placeholder="+994 XX XXX XX XX"></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Yadda saxla</button>
      </div>
    </form>
  `);
  document.getElementById('companyForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const companies = DB.get('companies', []);
    companies.push({ id: DB.uid('co'), name: fd.get('name'), type: fd.get('type'), city: fd.get('city'), contact: fd.get('contact'), phone: fd.get('phone'), rating: 4 });
    DB.set('companies', companies);
    logActivity('Yeni şirkət əlavə olundu: ' + fd.get('name'), '🏢');
    closeModal(); showToast('Şirkət əlavə olundu'); renderView('companies');
  };
}

/* ---------------------------------------------------------------- PROJECTS */
MODULES.projects = () => {
  const projects = DB.get('projects', []);
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>Layihələr</h3><p class="card-header-sub">${projects.length} layihə</p></div>
      <button class="btn btn-primary btn-sm" onclick="openProjectForm()">+ Yeni Layihə</button>
    </div>
    <div class="grid grid-2">
      ${projects.map(p => `
        <div class="card" style="background:var(--bg-2);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
            <div>
              <strong style="font-family:var(--font-display); font-size:15px;">${p.name}</strong>
              <div style="font-size:11.5px; color:var(--text-faint); margin-top:2px;">${p.type} · ${p.start} → ${p.end}</div>
            </div>
            ${riskBadge(p.risk)}
          </div>
          <div class="progress-bar" style="margin-bottom:8px;"><div class="progress-bar-fill" style="width:${p.progress}%;"></div></div>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-dim);">
            <span>${fmtMoney(p.spent)} / ${fmtMoney(p.budget)}</span>
            <span style="font-family:var(--font-mono);">${p.progress}%</span>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
};

function openProjectForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Layihə</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="projectForm">
      <div class="field"><label>Layihə adı</label><input required name="name"></div>
      <div class="field-row">
        <div class="field"><label>Növ</label>
          <select name="type"><option>Yüksək bina</option><option>Sənaye</option><option>İnfrastruktur</option><option>Kommersiya</option><option>Yaşayış</option></select>
        </div>
        <div class="field"><label>Büdcə (₼)</label><input required type="number" name="budget" placeholder="1000000"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Başlanğıc</label><input type="date" name="start"></div>
        <div class="field"><label>Son tarix</label><input type="date" name="end"></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Yadda saxla</button>
      </div>
    </form>
  `);
  document.getElementById('projectForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const projects = DB.get('projects', []);
    projects.push({ id: DB.uid('pr'), name: fd.get('name'), type: fd.get('type'), budget: Number(fd.get('budget')), spent: 0, progress: 0, status: 'active', start: fd.get('start'), end: fd.get('end'), risk: 'orta' });
    DB.set('projects', projects);
    logActivity('Yeni layihə yaradıldı: ' + fd.get('name'), '🏗️');
    closeModal(); showToast('Layihə yaradıldı'); renderView('projects');
  };
}

/* ---------------------------------------------------------------- BOQ */
MODULES.boq = () => {
  const rows = DB.get('boq', []);
  const total = CALC.boqTotal(rows);
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>BOQ — Miqdar Cədvəli</h3><p class="card-header-sub">${rows.length} sətir</p></div>
      <button class="btn btn-primary btn-sm" onclick="openBoqForm()">+ Sətir Əlavə Et</button>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Kod</th><th>Təsvir</th><th>Vahid</th><th>Miqdar</th><th>Vahid Qiymət</th><th>Cəm</th><th></th></tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td style="font-family:var(--font-mono); font-size:12px;">${r.code}</td>
            <td>${r.desc}</td>
            <td>${r.unit}</td>
            <td style="font-family:var(--font-mono);">${fmtNum(r.qty)}</td>
            <td style="font-family:var(--font-mono);">${fmtMoney(r.unitPrice)}</td>
            <td style="font-family:var(--font-mono); font-weight:600;">${fmtMoney(r.qty * r.unitPrice)}</td>
            <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('boq','${r.id}')">Sil</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table></div>
    <div style="display:flex; justify-content:flex-end; margin-top:16px; padding-top:16px; border-top:1px solid var(--border);">
      <div style="text-align:right;">
        <div style="font-size:12px; color:var(--text-faint);">ÜMUMİ MƏBLƏĞ</div>
        <div style="font-family:var(--font-mono); font-size:24px; font-weight:600; color:var(--blue);">${fmtMoney(total)}</div>
      </div>
    </div>
  </div>`;
};

function openBoqForm() {
  openModal(`
    <div class="modal-header"><h3>BOQ Sətri Əlavə Et</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="boqForm">
      <div class="field-row">
        <div class="field"><label>Kod</label><input name="code" placeholder="01.010"></div>
        <div class="field"><label>Vahid</label><input name="unit" placeholder="m³ / m² / ton"></div>
      </div>
      <div class="field"><label>Təsvir</label><input required name="desc" placeholder="Beton tökülməsi B25"></div>
      <div class="field-row">
        <div class="field"><label>Miqdar</label><input required type="number" step="any" name="qty"></div>
        <div class="field"><label>Vahid Qiymət (₼)</label><input required type="number" step="any" name="unitPrice"></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Əlavə et</button>
      </div>
    </form>
  `);
  document.getElementById('boqForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rows = DB.get('boq', []);
    rows.push({ id: DB.uid('bq'), code: fd.get('code') || '—', desc: fd.get('desc'), unit: fd.get('unit') || '-', qty: Number(fd.get('qty')), unitPrice: Number(fd.get('unitPrice')) });
    DB.set('boq', rows);
    logActivity('BOQ sətri əlavə olundu: ' + fd.get('desc'), '📐');
    closeModal(); showToast('BOQ sətri əlavə olundu'); renderView('boq');
  };
}

/* ---------------------------------------------------------------- CALCULATORS */
let activeCalcTab = 'concrete';
MODULES.calculators = () => `
  <div class="card">
    <div class="calc-tabs">
      <div class="calc-tab ${activeCalcTab==='concrete'?'active':''}" onclick="setCalcTab('concrete')">🧱 Beton Kalkulyatoru</div>
      <div class="calc-tab ${activeCalcTab==='rebar'?'active':''}" onclick="setCalcTab('rebar')">🔩 Armatur Kalkulyatoru</div>
      <div class="calc-tab ${activeCalcTab==='excavation'?'active':''}" onclick="setCalcTab('excavation')">⛏️ Qazıntı Kalkulyatoru</div>
    </div>
    <div id="calcBody">${renderCalcTab()}</div>
  </div>
`;

function setCalcTab(tab) { activeCalcTab = tab; renderView('calculators'); }

function renderCalcTab() {
  if (activeCalcTab === 'concrete') return concreteCalcHtml();
  if (activeCalcTab === 'rebar') return rebarCalcHtml();
  return excavationCalcHtml();
}

function concreteCalcHtml() {
  return `
  <div class="calc-grid">
    <div>
      <div class="field-row">
        <div class="field"><label>Uzunluq (m)</label><input type="number" id="cc_l" value="10"></div>
        <div class="field"><label>En (m)</label><input type="number" id="cc_w" value="5"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Hündürlük / Qalınlıq (m)</label><input type="number" id="cc_h" value="0.3"></div>
        <div class="field"><label>Qarışıq nisbəti</label>
          <select id="cc_mix"><option value="1:1.5:3">1:1.5:3 (yüksək güc)</option><option value="1:2:4" selected>1:2:4 (standart)</option><option value="1:3:6">1:3:6 (adi)</option></select>
        </div>
      </div>
      <div class="field"><label>İtki payı (%)</label><input type="number" id="cc_waste" value="5"></div>
      <button class="btn btn-primary" onclick="runConcreteCalc()">Hesabla</button>
    </div>
    <div id="cc_result"></div>
  </div>`;
}
function runConcreteCalc() {
  const r = CALC.concrete({
    length: Number(document.getElementById('cc_l').value)||0,
    width: Number(document.getElementById('cc_w').value)||0,
    height: Number(document.getElementById('cc_h').value)||0,
    wastePct: Number(document.getElementById('cc_waste').value)||0,
    mix: document.getElementById('cc_mix').value,
  });
  document.getElementById('cc_result').innerHTML = `
    <div class="calc-result">
      <div class="rline"><span>Xalis həcm</span><strong>${r.volume} m³</strong></div>
      <div class="rline"><span>İtki ilə həcm</span><strong>${r.volumeWithWaste} m³</strong></div>
      <div class="rline"><span>Sement (50kg kisə)</span><strong>${r.cementBags} kisə</strong></div>
      <div class="rline"><span>Qum</span><strong>${r.sandM3} m³</strong></div>
      <div class="rline"><span>Çınqıl</span><strong>${r.aggregateM3} m³</strong></div>
      <div class="rline"><span>Su</span><strong>${r.waterLiters} litr</strong></div>
    </div>`;
}

function rebarCalcHtml() {
  return `
  <div class="calc-grid">
    <div>
      <div class="field-row">
        <div class="field"><label>Diametr (mm)</label>
          <select id="rc_d"><option>8</option><option>10</option><option selected>12</option><option>14</option><option>16</option><option>18</option><option>20</option><option>25</option><option>32</option></select>
        </div>
        <div class="field"><label>Ümumi uzunluq (m)</label><input type="number" id="rc_len" value="500"></div>
      </div>
      <div class="field"><label>İtki payı (%)</label><input type="number" id="rc_waste" value="3"></div>
      <button class="btn btn-primary" onclick="runRebarCalc()">Hesabla</button>
    </div>
    <div id="rc_result"></div>
  </div>`;
}
function runRebarCalc() {
  const r = CALC.rebar({
    diameterMm: Number(document.getElementById('rc_d').value),
    totalLengthM: Number(document.getElementById('rc_len').value)||0,
    wastePct: Number(document.getElementById('rc_waste').value)||0,
  });
  document.getElementById('rc_result').innerHTML = `
    <div class="calc-result">
      <div class="rline"><span>Vahid çəki</span><strong>${r.unitWeightKgM} kg/m</strong></div>
      <div class="rline"><span>Ümumi çəki</span><strong>${r.totalKg} kg</strong></div>
      <div class="rline"><span>Ton olaraq</span><strong>${r.totalTon} ton</strong></div>
    </div>`;
}

function excavationCalcHtml() {
  return `
  <div class="calc-grid">
    <div>
      <div class="field-row">
        <div class="field"><label>Uzunluq (m)</label><input type="number" id="ec_l" value="20"></div>
        <div class="field"><label>En (m)</label><input type="number" id="ec_w" value="10"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Dərinlik (m)</label><input type="number" id="ec_d" value="2"></div>
        <div class="field"><label>Yük maşını tutumu (m³)</label><input type="number" id="ec_truck" value="10"></div>
      </div>
      <div class="field"><label>Genişlənmə payı (%)</label><input type="number" id="ec_bulk" value="20"></div>
      <button class="btn btn-primary" onclick="runExcavationCalc()">Hesabla</button>
    </div>
    <div id="ec_result"></div>
  </div>`;
}
function runExcavationCalc() {
  const r = CALC.excavation({
    length: Number(document.getElementById('ec_l').value)||0,
    width: Number(document.getElementById('ec_w').value)||0,
    depth: Number(document.getElementById('ec_d').value)||0,
    truckCapacityM3: Number(document.getElementById('ec_truck').value)||10,
    bulkingPct: Number(document.getElementById('ec_bulk').value)||20,
  });
  document.getElementById('ec_result').innerHTML = `
    <div class="calc-result">
      <div class="rline"><span>Xalis həcm</span><strong>${r.volume} m³</strong></div>
      <div class="rline"><span>Genişlənmiş həcm</span><strong>${r.bulkedVolume} m³</strong></div>
      <div class="rline"><span>Tələb olunan reys sayı</span><strong>${r.truckTrips} reys</strong></div>
    </div>`;
}

/* ---------------------------------------------------------------- HSE */
MODULES.hse = () => {
  const incidents = DB.get('hse_incidents', []);
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>HSE — Təhlükəsizlik Qeydiyyatı</h3><p class="card-header-sub">Toolbox Talk, Near Miss, Hadisələr</p></div>
      <button class="btn btn-primary btn-sm" onclick="openHseForm()">+ Yeni Qeyd</button>
    </div>
    ${incidents.length ? `
    <div class="table-wrap"><table>
      <thead><tr><th>Tarix</th><th>Növ</th><th>Təsvir</th><th>Ciddiyyət</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${incidents.map(i => `
          <tr>
            <td style="font-family:var(--font-mono); font-size:12px;">${i.date}</td>
            <td><span class="badge blue">${i.type}</span></td>
            <td>${i.desc}</td>
            <td>${severityBadge(i.severity)}</td>
            <td><span class="badge ${i.status==='bağlı'?'green':'orange'}">${i.status}</span></td>
            <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('hse_incidents','${i.id}')">Sil</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table></div>
    ` : emptyState('🦺','Qeyd yoxdur','İlk HSE qeydini əlavə edin')}
  </div>`;
};

function openHseForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni HSE Qeydi</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="hseForm">
      <div class="field-row">
        <div class="field"><label>Tarix</label><input type="date" name="date" required></div>
        <div class="field"><label>Növ</label>
          <select name="type"><option>Toolbox Talk</option><option>Near Miss</option><option>Incident</option><option>Permit To Work</option><option>Risk Assessment</option></select>
        </div>
      </div>
      <div class="field"><label>Təsvir</label><textarea name="desc" rows="3" required></textarea></div>
      <div class="field-row">
        <div class="field"><label>Ciddiyyət</label><select name="severity"><option>aşağı</option><option>orta</option><option>yüksək</option></select></div>
        <div class="field"><label>Status</label><select name="status"><option>açıq</option><option>bağlı</option></select></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Yadda saxla</button>
      </div>
    </form>
  `);
  document.getElementById('hseForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rows = DB.get('hse_incidents', []);
    rows.push({ id: DB.uid('hi'), date: fd.get('date'), type: fd.get('type'), desc: fd.get('desc'), severity: fd.get('severity'), status: fd.get('status') });
    DB.set('hse_incidents', rows);
    logActivity('HSE qeydi əlavə olundu: ' + fd.get('type'), '🦺');
    closeModal(); showToast('HSE qeydi əlavə olundu'); renderView('hse');
  };
}

/* ---------------------------------------------------------------- KANBAN BOARD */
MODULES.board = () => {
  const tasks = DB.get('board_tasks', []);
  const cols = [
    { key: 'todo', label: 'To Do', color: 'var(--text-faint)' },
    { key: 'progress', label: 'İcrada', color: 'var(--blue)' },
    { key: 'done', label: 'Bitib', color: 'var(--green)' },
  ];
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>Kanban Lövhə</h3><p class="card-header-sub">${tasks.length} tapşırıq</p></div>
      <button class="btn btn-primary btn-sm" onclick="openBoardForm()">+ Yeni Tapşırıq</button>
    </div>
    <div class="grid grid-3">
      ${cols.map(c => `
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
            <span style="width:8px; height:8px; border-radius:50%; background:${c.color};"></span>
            <strong style="font-size:12.5px; text-transform:uppercase; letter-spacing:.04em; color:var(--text-dim);">${c.label}</strong>
            <span class="badge gray">${tasks.filter(t=>t.status===c.key).length}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${tasks.filter(t => t.status === c.key).map(t => `
              <div class="card" style="background:var(--bg-2); padding:14px;">
                <div style="font-size:13px; font-weight:600; margin-bottom:6px;">${t.title}</div>
                <div style="font-size:11px; color:var(--text-faint); margin-bottom:10px;">${t.project || '—'} ${t.assignee ? '· '+t.assignee : ''}</div>
                <div style="display:flex; gap:6px;">
                  ${c.key !== 'todo' ? `<button class="btn btn-outline btn-sm" onclick="moveBoardTask('${t.id}','${prevStatus(c.key)}')">◀</button>` : ''}
                  ${c.key !== 'done' ? `<button class="btn btn-outline btn-sm" onclick="moveBoardTask('${t.id}','${nextStatus(c.key)}')">▶</button>` : ''}
                  <button class="btn btn-ghost btn-sm" style="margin-left:auto;" onclick="deleteRow('board_tasks','${t.id}')">Sil</button>
                </div>
              </div>
            `).join('') || `<div style="font-size:12px; color:var(--text-faint); padding:10px 0;">Boşdur</div>`}
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
};
function nextStatus(s) { return s === 'todo' ? 'progress' : 'done'; }
function prevStatus(s) { return s === 'done' ? 'progress' : 'todo'; }
function moveBoardTask(id, status) {
  const tasks = DB.get('board_tasks', []);
  const t = tasks.find(x => x.id === id);
  if (t) t.status = status;
  DB.set('board_tasks', tasks);
  renderView('board');
}
function openBoardForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Tapşırıq</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="boardForm">
      <div class="field"><label>Başlıq</label><input required name="title"></div>
      <div class="field-row">
        <div class="field"><label>Layihə</label><input name="project"></div>
        <div class="field"><label>Məsul şəxs</label><input name="assignee"></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Əlavə et</button>
      </div>
    </form>
  `);
  document.getElementById('boardForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rows = DB.get('board_tasks', []);
    rows.push({ id: DB.uid('bt'), title: fd.get('title'), project: fd.get('project'), assignee: fd.get('assignee'), status: 'todo' });
    DB.set('board_tasks', rows);
    logActivity('Yeni tapşırıq: ' + fd.get('title'), '🗂️');
    closeModal(); showToast('Tapşırıq əlavə olundu'); renderView('board');
  };
}

/* ---------------------------------------------------------------- SITE DIARY */
MODULES['site-diary'] = () => {
  const entries = DB.get('site_diary', []).slice().sort((a,b) => b.date.localeCompare(a.date));
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>Sahə Gündəliyi</h3><p class="card-header-sub">Gündəlik sahə hesabatları</p></div>
      <button class="btn btn-primary btn-sm" onclick="openDiaryForm()">+ Yeni Qeyd</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:14px;">
      ${entries.length ? entries.map(e => `
        <div class="card" style="background:var(--bg-2);">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <strong style="font-family:var(--font-mono);">${e.date}</strong>
            <span class="badge blue">${e.weather || '—'}</span>
          </div>
          <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:6px;">👷 İşçi sayı: ${e.manpower ?? '—'}</div>
          <div style="font-size:13px;">${e.notes}</div>
          <div style="margin-top:10px;"><button class="btn btn-ghost btn-sm" onclick="deleteRow('site_diary','${e.id}')">Sil</button></div>
        </div>
      `).join('') : emptyState('📓','Qeyd yoxdur','İlk sahə gündəliyi qeydini əlavə edin')}
    </div>
  </div>`;
};
function openDiaryForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Sahə Gündəliyi Qeydi</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="diaryForm">
      <div class="field-row">
        <div class="field"><label>Tarix</label><input type="date" name="date" required></div>
        <div class="field"><label>Hava şəraiti</label><input name="weather" placeholder="Günəşli, 28°C"></div>
      </div>
      <div class="field"><label>İşçi sayı</label><input type="number" name="manpower"></div>
      <div class="field"><label>Qeydlər</label><textarea name="notes" rows="4" required></textarea></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Yadda saxla</button>
      </div>
    </form>
  `);
  document.getElementById('diaryForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rows = DB.get('site_diary', []);
    rows.push({ id: DB.uid('sd'), date: fd.get('date'), weather: fd.get('weather'), manpower: Number(fd.get('manpower'))||0, notes: fd.get('notes') });
    DB.set('site_diary', rows);
    logActivity('Sahə gündəliyi qeydi əlavə olundu (' + fd.get('date') + ')', '📓');
    closeModal(); showToast('Gündəlik qeydi əlavə olundu'); renderView('site-diary');
  };
}

/* ---------------------------------------------------------------- DAILY PLANNER */
MODULES.planner = () => {
  const plans = DB.get('daily_planner', []).slice().sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>Gündəlik Planlayıcı</h3><p class="card-header-sub">Vaxt-bloklu tapşırıqlar</p></div>
      <button class="btn btn-primary btn-sm" onclick="openPlannerForm()">+ Yeni Plan</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:8px;">
      ${plans.length ? plans.map(p => `
        <label style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; background:var(--bg-2); cursor:pointer;">
          <input type="checkbox" ${p.done?'checked':''} onchange="togglePlan('${p.id}')" style="width:auto;">
          <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-faint); min-width:100px;">${p.date} · ${p.time}</span>
          <span style="flex:1; ${p.done?'text-decoration:line-through; color:var(--text-faint);':''}">${p.title}</span>
          <button type="button" class="btn btn-ghost btn-sm" onclick="event.preventDefault(); deleteRow('daily_planner','${p.id}')">Sil</button>
        </label>
      `).join('') : emptyState('🗓️','Plan yoxdur','İlk planlanmış tapşırığı əlavə edin')}
    </div>
  </div>`;
};
function togglePlan(id) {
  const rows = DB.get('daily_planner', []);
  const p = rows.find(x => x.id === id);
  if (p) p.done = !p.done;
  DB.set('daily_planner', rows);
  renderView('planner');
}
function openPlannerForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Planlanmış Tapşırıq</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="plannerForm">
      <div class="field-row">
        <div class="field"><label>Tarix</label><input type="date" name="date" required></div>
        <div class="field"><label>Saat</label><input type="time" name="time" required></div>
      </div>
      <div class="field"><label>Başlıq</label><input required name="title"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Əlavə et</button>
      </div>
    </form>
  `);
  document.getElementById('plannerForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rows = DB.get('daily_planner', []);
    rows.push({ id: DB.uid('dp'), date: fd.get('date'), time: fd.get('time'), title: fd.get('title'), done: false });
    DB.set('daily_planner', rows);
    closeModal(); showToast('Plan əlavə olundu'); renderView('planner');
  };
}

/* ---------------------------------------------------------------- NOTES (Sticky + Quick) */
const NOTE_COLORS = ['#FF7A1A', '#2E6FF2', '#22C55E', '#F5B93D', '#6C4CF2'];
MODULES.notes = () => {
  const sticky = DB.get('sticky_notes', []);
  const quick = DB.get('quick_notes', []).slice().reverse();
  return `
  <div class="grid grid-2">
    <div class="card">
      <div class="card-header"><div><h3>Sticky Notes</h3></div><button class="btn btn-primary btn-sm" onclick="openStickyForm()">+ Qeyd</button></div>
      <div class="grid grid-2">
        ${sticky.length ? sticky.map(n => `
          <div style="background:${n.color}22; border:1px solid ${n.color}55; border-radius:12px; padding:14px; position:relative;">
            <div style="font-size:13px; margin-bottom:8px;">${n.text}</div>
            <button class="btn btn-ghost btn-sm" onclick="deleteRow('sticky_notes','${n.id}')">Sil</button>
          </div>
        `).join('') : emptyState('📝','Qeyd yoxdur','')}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div><h3>Sürətli Qeydlər</h3></div><button class="btn btn-primary btn-sm" onclick="openQuickForm()">+ Qeyd</button></div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${quick.length ? quick.map(n => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--bg-2); border-radius:10px; font-size:13px;">
            <span>${n.text}</span>
            <button class="btn btn-ghost btn-sm" onclick="deleteRow('quick_notes','${n.id}')">Sil</button>
          </div>
        `).join('') : emptyState('⚡','Qeyd yoxdur','')}
      </div>
    </div>
  </div>`;
};
function openStickyForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Sticky Note</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="stickyForm">
      <div class="field"><label>Mətn</label><textarea name="text" rows="3" required></textarea></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Əlavə et</button>
      </div>
    </form>
  `);
  document.getElementById('stickyForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rows = DB.get('sticky_notes', []);
    rows.push({ id: DB.uid('sn'), text: fd.get('text'), color: NOTE_COLORS[rows.length % NOTE_COLORS.length] });
    DB.set('sticky_notes', rows);
    closeModal(); showToast('Qeyd əlavə olundu'); renderView('notes');
  };
}
function openQuickForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Sürətli Qeyd</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="quickForm">
      <div class="field"><label>Mətn</label><input name="text" required></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Əlavə et</button>
      </div>
    </form>
  `);
  document.getElementById('quickForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rows = DB.get('quick_notes', []);
    rows.push({ id: DB.uid('qn'), text: fd.get('text') });
    DB.set('quick_notes', rows);
    closeModal(); showToast('Qeyd əlavə olundu'); renderView('notes');
  };
}

/* ---------------------------------------------------------------- RISK REGISTER */
MODULES['risk-register'] = () => {
  const risks = DB.get('risks', []);
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>Risk Reyestri</h3><p class="card-header-sub">${risks.length} risk qeydə alınıb</p></div>
      <button class="btn btn-primary btn-sm" onclick="openRiskForm()">+ Yeni Risk</button>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Risk</th><th>Kateqoriya</th><th>Ehtimal</th><th>Təsir</th><th>Bal</th><th>Sahib</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${risks.map(r => {
          const score = r.likelihood * r.impact;
          const sevColor = score >= 15 ? 'red' : score >= 8 ? 'orange' : 'green';
          return `
          <tr>
            <td style="font-weight:600;">${r.title}<div style="font-size:11px; color:var(--text-faint); font-weight:400;">${r.mitigation||''}</div></td>
            <td>${r.category}</td>
            <td style="font-family:var(--font-mono);">${r.likelihood}/5</td>
            <td style="font-family:var(--font-mono);">${r.impact}/5</td>
            <td><span class="badge ${sevColor}" style="font-family:var(--font-mono);">${score}</span></td>
            <td>${r.owner}</td>
            <td><span class="badge blue">${r.status}</span></td>
            <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('risks','${r.id}')">Sil</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
  </div>`;
};
function openRiskForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Risk</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="riskForm">
      <div class="field"><label>Risk təsviri</label><input required name="title"></div>
      <div class="field-row">
        <div class="field"><label>Kateqoriya</label><input name="category" placeholder="Cədvəl / Maliyyə / Texniki"></div>
        <div class="field"><label>Sahib</label><input name="owner" placeholder="PM / HSE / Satınalma"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Ehtimal (1-5)</label><input type="number" min="1" max="5" name="likelihood" value="3" required></div>
        <div class="field"><label>Təsir (1-5)</label><input type="number" min="1" max="5" name="impact" value="3" required></div>
      </div>
      <div class="field"><label>Azaltma tədbiri</label><input name="mitigation"></div>
      <div class="field"><label>Status</label><select name="status"><option>açıq</option><option>izlənilir</option><option>bağlı</option></select></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Əlavə et</button>
      </div>
    </form>
  `);
  document.getElementById('riskForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rows = DB.get('risks', []);
    rows.push({ id: DB.uid('rk'), title: fd.get('title'), category: fd.get('category')||'—', owner: fd.get('owner')||'—', likelihood: Number(fd.get('likelihood')), impact: Number(fd.get('impact')), mitigation: fd.get('mitigation'), status: fd.get('status') });
    DB.set('risks', rows);
    logActivity('Yeni risk qeydə alındı: ' + fd.get('title'), '⚠️');
    closeModal(); showToast('Risk əlavə olundu'); renderView('risk-register');
  };
}

/* ---------------------------------------------------------------- QA/QC CHECKLIST */
MODULES.qaqc = () => {
  const items = DB.get('qaqc_checklist', []);
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>QA/QC Checklist</h3><p class="card-header-sub">Keyfiyyətə nəzarət yoxlama siyahısı</p></div>
      <button class="btn btn-primary btn-sm" onclick="openQaqcForm()">+ Element</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:8px;">
      ${items.length ? items.map(i => `
        <div style="display:flex; align-items:center; gap:12px; padding:10px 12px; background:var(--bg-2); border-radius:10px;">
          <span style="flex:1; font-size:13px;">${i.text}</span>
          <select onchange="setQaqcStatus('${i.id}', this.value)" style="width:auto;">
            <option value="pending" ${i.status==='pending'?'selected':''}>Gözləyir</option>
            <option value="pass" ${i.status==='pass'?'selected':''}>Keçdi</option>
            <option value="fail" ${i.status==='fail'?'selected':''}>Uğursuz</option>
          </select>
          ${qaqcBadge(i.status)}
          <button class="btn btn-ghost btn-sm" onclick="deleteRow('qaqc_checklist','${i.id}')">Sil</button>
        </div>
      `).join('') : emptyState('✅','Element yoxdur','')}
    </div>
  </div>`;
};
function qaqcBadge(s) {
  const map = { pending: ['gray','Gözləyir'], pass: ['green','Keçdi'], fail: ['red','Uğursuz'] };
  const [c,l] = map[s] || map.pending;
  return `<span class="badge ${c}">${l}</span>`;
}
function setQaqcStatus(id, status) {
  const rows = DB.get('qaqc_checklist', []);
  const it = rows.find(x => x.id === id);
  if (it) it.status = status;
  DB.set('qaqc_checklist', rows);
  renderView('qaqc');
}
function openQaqcForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni QA/QC Elementi</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="qaqcForm">
      <div class="field"><label>Yoxlama mətni</label><input required name="text"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Əlavə et</button>
      </div>
    </form>
  `);
  document.getElementById('qaqcForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rows = DB.get('qaqc_checklist', []);
    rows.push({ id: DB.uid('qc'), text: fd.get('text'), status: 'pending' });
    DB.set('qaqc_checklist', rows);
    closeModal(); showToast('Element əlavə olundu'); renderView('qaqc');
  };
}

/* ---------------------------------------------------------------- SAFETY CHECKLIST */
MODULES['safety-checklist'] = () => {
  const items = DB.get('safety_checklist', []);
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>Təhlükəsizlik Checklist</h3><p class="card-header-sub">Sahə təhlükəsizlik yoxlama siyahısı</p></div>
      <button class="btn btn-primary btn-sm" onclick="openSafetyForm()">+ Element</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:8px;">
      ${items.length ? items.map(i => `
        <label style="display:flex; align-items:center; gap:12px; padding:10px 12px; background:var(--bg-2); border-radius:10px; cursor:pointer;">
          <input type="checkbox" ${i.checked?'checked':''} onchange="toggleSafety('${i.id}')" style="width:auto;">
          <span style="flex:1; font-size:13px; ${i.checked?'text-decoration:line-through; color:var(--text-faint);':''}">${i.text}</span>
          <button type="button" class="btn btn-ghost btn-sm" onclick="event.preventDefault(); deleteRow('safety_checklist','${i.id}')">Sil</button>
        </label>
      `).join('') : emptyState('🦺','Element yoxdur','')}
    </div>
  </div>`;
};
function toggleSafety(id) {
  const rows = DB.get('safety_checklist', []);
  const it = rows.find(x => x.id === id);
  if (it) it.checked = !it.checked;
  DB.set('safety_checklist', rows);
  renderView('safety-checklist');
}
function openSafetyForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Təhlükəsizlik Elementi</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="safetyForm">
      <div class="field"><label>Yoxlama mətni</label><input required name="text"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
        <button type="submit" class="btn btn-primary">Əlavə et</button>
      </div>
    </form>
  `);
  document.getElementById('safetyForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rows = DB.get('safety_checklist', []);
    rows.push({ id: DB.uid('sc'), text: fd.get('text'), checked: false });
    DB.set('safety_checklist', rows);
    closeModal(); showToast('Element əlavə olundu'); renderView('safety-checklist');
  };
}

/* ---------------------------------------------------------------- DATA MANAGEMENT (Export/Import/Erase) */
const ALL_DB_KEYS = ['companies','projects','boq','hse_incidents','tasks','board_tasks','site_diary','daily_planner','sticky_notes','quick_notes','risks','qaqc_checklist','safety_checklist'];

MODULES.data = () => `
  <div class="grid grid-2">
    <div class="card">
      <div class="card-header"><h3>Ehtiyat Nüsxə (Export)</h3></div>
      <p style="font-size:13px; color:var(--text-dim); margin-bottom:16px;">Bütün layihə datanızı (şirkətlər, layihələr, BOQ, HSE, Kanban, Risk Reyestri və s.) tək bir JSON faylına ixrac edin.</p>
      <button class="btn btn-primary" onclick="exportWorkspaceData()">⬇ JSON faylı yüklə</button>
    </div>
    <div class="card">
      <div class="card-header"><h3>Bərpa Et (Import)</h3></div>
      <p style="font-size:13px; color:var(--text-dim); margin-bottom:16px;">Əvvəllər ixrac edilmiş IndustrCons OS / Workspace JSON faylını bu cihaza yükləyin.</p>
      <input type="file" id="importFile" accept="application/json" style="margin-bottom:12px;">
      <button class="btn btn-outline" onclick="importWorkspaceData()">⬆ Faylı yüklə</button>
    </div>
  </div>
  <div class="card" style="margin-top:18px; border-color:rgba(239,68,68,.4);">
    <div class="card-header"><h3 style="color:var(--red);">Təhlükə Zonası</h3></div>
    <p style="font-size:13px; color:var(--text-dim); margin-bottom:16px;">Bu cihazda saxlanılan bütün IndustrCons OS datasını sil. Bu əməliyyat geri qaytarıla bilməz.</p>
    <button class="btn btn-danger" onclick="eraseWorkspaceData()">🗑 Bütün Datanı Sil</button>
  </div>
`;
function exportWorkspaceData() {
  const dump = {};
  ALL_DB_KEYS.forEach(k => dump[k] = DB.get(k, []));
  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'industrcons-os-backup-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Ehtiyat nüsxə endirildi');
}
function importWorkspaceData() {
  const fileInput = document.getElementById('importFile');
  const file = fileInput.files[0];
  if (!file) { showToast('Zəhmət olmasa fayl seçin'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      ALL_DB_KEYS.forEach(k => { if (data[k]) DB.set(k, data[k]); });
      showToast('Data uğurla bərpa olundu');
      renderView('dashboard');
    } catch (err) {
      showToast('Fayl formatı yanlışdır');
    }
  };
  reader.readAsText(file);
}
function eraseWorkspaceData() {
  if (!confirm('Bütün datanı silmək istədiyinizə əminsiniz? Bu geri qaytarıla bilməz.')) return;
  ALL_DB_KEYS.forEach(k => DB.set(k, []));
  DB.set('seeded', true);
  showToast('Bütün data silindi');
  renderView('dashboard');
}

/* ---------------------------------------------------------------- CONTACTS */
MODULES.contacts = () => {
  const rows = DB.get('contacts', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Kontaktlar</h3><p class="card-header-sub">${rows.length} kontakt</p></div><button class="btn btn-primary btn-sm" onclick="openContactForm()">+ Yeni Kontakt</button></div>
    <div class="grid grid-3">
      ${rows.length ? rows.map(c => `
        <div class="card" style="background:var(--bg-2);">
          <div style="font-weight:600; margin-bottom:4px;">${c.name}</div>
          <div style="font-size:12px; color:var(--text-faint); margin-bottom:10px;">${c.role} · ${c.company}</div>
          <div style="font-size:12.5px; font-family:var(--font-mono);">${c.phone}</div>
          <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:10px;">${c.email}</div>
          <button class="btn btn-ghost btn-sm" onclick="deleteRow('contacts','${c.id}')">Sil</button>
        </div>
      `).join('') : emptyState('📇','Kontakt yoxdur','')}
    </div>
  </div>`;
};
function openContactForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Kontakt</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="contactForm">
      <div class="field"><label>Ad Soyad</label><input required name="name"></div>
      <div class="field-row"><div class="field"><label>Şirkət</label><input name="company"></div><div class="field"><label>Vəzifə</label><input name="role"></div></div>
      <div class="field-row"><div class="field"><label>Telefon</label><input name="phone"></div><div class="field"><label>E-poçt</label><input type="email" name="email"></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('contactForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('contacts', []);
    rows.push({ id: DB.uid('ct'), name: fd.get('name'), company: fd.get('company'), role: fd.get('role'), phone: fd.get('phone'), email: fd.get('email') });
    DB.set('contacts', rows); closeModal(); showToast('Kontakt əlavə olundu'); renderView('contacts');
  };
}

/* ---------------------------------------------------------------- COMPANY DOCS */
MODULES['company-docs'] = () => {
  const rows = DB.get('company_docs', []);
  const today = new Date();
  return `
  <div class="card">
    <div class="card-header"><div><h3>Şirkət Sənədləri</h3><p class="card-header-sub">Lisenziya, sertifikat, müqavilə izləmə</p></div><button class="btn btn-primary btn-sm" onclick="openCompanyDocForm()">+ Sənəd</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Şirkət</th><th>Sənəd</th><th>Bitmə Tarixi</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${rows.map(d => {
          const daysLeft = Math.ceil((new Date(d.expiry) - today) / 86400000);
          const warn = daysLeft < 60;
          return `<tr>
            <td>${d.company}</td><td>${d.title}</td>
            <td style="font-family:var(--font-mono);">${d.expiry}</td>
            <td>${warn ? `<span class="badge red">${daysLeft} gün qalıb</span>` : `<span class="badge green">aktiv</span>`}</td>
            <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('company_docs','${d.id}')">Sil</button></td>
          </tr>`;
        }).join('') || `<tr><td colspan="5">${emptyState('🗂️','Sənəd yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openCompanyDocForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Sənəd</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="companyDocForm">
      <div class="field"><label>Şirkət</label><input required name="company"></div>
      <div class="field"><label>Sənəd adı</label><input required name="title" placeholder="ISO 9001, Lisenziya..."></div>
      <div class="field"><label>Bitmə tarixi</label><input type="date" name="expiry" required></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('companyDocForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('company_docs', []);
    rows.push({ id: DB.uid('cd'), company: fd.get('company'), title: fd.get('title'), expiry: fd.get('expiry'), status: 'aktiv' });
    DB.set('company_docs', rows); closeModal(); showToast('Sənəd əlavə olundu'); renderView('company-docs');
  };
}

/* ---------------------------------------------------------------- GANTT CHART */
MODULES.gantt = () => {
  const tasks = DB.get('gantt_tasks', []);
  if (!tasks.length) return `<div class="card">${emptyState('📅','Fəaliyyət yoxdur','')}</div>`;
  const allDates = tasks.flatMap(t => [new Date(t.start), new Date(t.end)]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const totalDays = Math.max(1, (maxDate - minDate) / 86400000);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Qrafik / Gantt Chart</h3><p class="card-header-sub">${tasks[0] ? new Date(minDate).toLocaleDateString('az-AZ') : ''} → ${new Date(maxDate).toLocaleDateString('az-AZ')}</p></div><button class="btn btn-primary btn-sm" onclick="openGanttForm()">+ Fəaliyyət</button></div>
    <div style="display:flex; flex-direction:column; gap:14px;">
      ${tasks.map(t => {
        const startOffset = (new Date(t.start) - minDate) / 86400000;
        const dur = Math.max(1, (new Date(t.end) - new Date(t.start)) / 86400000);
        const leftPct = (startOffset / totalDays) * 100;
        const widthPct = (dur / totalDays) * 100;
        return `
        <div>
          <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:5px;">
            <span style="font-weight:600;">${t.title}</span>
            <span style="color:var(--text-faint); font-family:var(--font-mono);">${t.start} → ${t.end}</span>
          </div>
          <div style="position:relative; height:20px; background:var(--bg-2); border-radius:6px;">
            <div style="position:absolute; left:${leftPct}%; width:${widthPct}%; height:100%; border-radius:6px; background:linear-gradient(90deg,var(--blue),#6C4CF2);"></div>
          </div>
          <div style="font-size:11px; color:var(--text-faint); margin-top:3px;">${t.project}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
};
function openGanttForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Fəaliyyət</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="ganttForm">
      <div class="field"><label>Layihə</label><input name="project"></div>
      <div class="field"><label>Fəaliyyət adı</label><input required name="title"></div>
      <div class="field-row"><div class="field"><label>Başlanğıc</label><input type="date" name="start" required></div><div class="field"><label>Son</label><input type="date" name="end" required></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('ganttForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('gantt_tasks', []);
    rows.push({ id: DB.uid('gt'), project: fd.get('project'), title: fd.get('title'), start: fd.get('start'), end: fd.get('end') });
    DB.set('gantt_tasks', rows); closeModal(); showToast('Fəaliyyət əlavə olundu'); renderView('gantt');
  };
}

/* ---------------------------------------------------------------- MILESTONES */
MODULES.milestones = () => {
  const rows = DB.get('milestones', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Mərhələlər</h3><p class="card-header-sub">${rows.length} mərhələ</p></div><button class="btn btn-primary btn-sm" onclick="openMilestoneForm()">+ Mərhələ</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Layihə</th><th>Mərhələ</th><th>Tarix</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${rows.map(m => `<tr>
          <td>${m.project}</td><td style="font-weight:600;">${m.title}</td>
          <td style="font-family:var(--font-mono);">${m.date}</td>
          <td><span class="badge ${m.status==='gecikir'?'red':m.status==='tamamlanıb'?'green':'orange'}">${m.status}</span></td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('milestones','${m.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="5">${emptyState('🚩','Mərhələ yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openMilestoneForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Mərhələ</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="milestoneForm">
      <div class="field"><label>Layihə</label><input name="project"></div>
      <div class="field"><label>Mərhələ adı</label><input required name="title"></div>
      <div class="field-row"><div class="field"><label>Tarix</label><input type="date" name="date" required></div>
      <div class="field"><label>Status</label><select name="status"><option>gözlənilir</option><option>gecikir</option><option>tamamlanıb</option></select></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('milestoneForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('milestones', []);
    rows.push({ id: DB.uid('ms'), project: fd.get('project'), title: fd.get('title'), date: fd.get('date'), status: fd.get('status') });
    DB.set('milestones', rows); closeModal(); showToast('Mərhələ əlavə olundu'); renderView('milestones');
  };
}

/* ---------------------------------------------------------------- SITE CAMP PLANNING */
MODULES['site-camp'] = () => {
  const rows = DB.get('site_camp', []);
  const total = rows.reduce((s,r) => s + r.qty * r.unitCost, 0);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Sahə Düşərgəsi Planlaması</h3><p class="card-header-sub">Kampus quraşdırma xərc kalkulyatoru</p></div><button class="btn btn-primary btn-sm" onclick="openSiteCampForm()">+ Element</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Element</th><th>Say</th><th>Vahid Qiymət</th><th>Cəm</th><th></th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr>
          <td>${r.item}</td><td style="font-family:var(--font-mono);">${r.qty}</td>
          <td style="font-family:var(--font-mono);">${fmtMoney(r.unitCost)}</td>
          <td style="font-family:var(--font-mono); font-weight:600;">${fmtMoney(r.qty*r.unitCost)}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('site_camp','${r.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="5">${emptyState('⛺','Element yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
    <div style="display:flex; justify-content:flex-end; margin-top:14px; padding-top:14px; border-top:1px solid var(--border);">
      <div style="text-align:right;"><div style="font-size:12px; color:var(--text-faint);">ÜMUMİ KAMPUS XƏRCİ</div><div style="font-family:var(--font-mono); font-size:22px; font-weight:600; color:var(--blue);">${fmtMoney(total)}</div></div>
    </div>
  </div>`;
};
function openSiteCampForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Kampus Elementi</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="siteCampForm">
      <div class="field"><label>Element</label><input required name="item" placeholder="Konteyner, Generator, Yol (m)..."></div>
      <div class="field-row"><div class="field"><label>Say / Miqdar</label><input type="number" step="any" name="qty" required></div><div class="field"><label>Vahid Qiymət (₼)</label><input type="number" step="any" name="unitCost" required></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('siteCampForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('site_camp', []);
    rows.push({ id: DB.uid('sc2'), item: fd.get('item'), qty: Number(fd.get('qty')), unitCost: Number(fd.get('unitCost')) });
    DB.set('site_camp', rows); closeModal(); showToast('Element əlavə olundu'); renderView('site-camp');
  };
}

/* ---------------------------------------------------------------- QUANTITY TAKEOFF */
MODULES.takeoff = () => {
  const rows = DB.get('takeoff_items', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Kəmiyyət Hesablanması (Takeoff)</h3><p class="card-header-sub">Element əsaslı miqdar çıxarılması</p></div><button class="btn btn-primary btn-sm" onclick="openTakeoffForm()">+ Element</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Element</th><th>Kateqoriya</th><th>Miqdar</th><th>Vahid</th><th></th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr>
          <td>${r.element}</td><td><span class="badge blue">${r.category}</span></td>
          <td style="font-family:var(--font-mono);">${fmtNum(r.qty)}</td><td>${r.unit}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="sendTakeoffToBoq('${r.id}')">BOQ-a göndər</button>
            <button class="btn btn-ghost btn-sm" onclick="deleteRow('takeoff_items','${r.id}')">Sil</button>
          </td>
        </tr>`).join('') || `<tr><td colspan="5">${emptyState('📐','Element yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openTakeoffForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Takeoff Elementi</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="takeoffForm">
      <div class="field"><label>Element təsviri</label><input required name="element" placeholder="Sütun C1 (0.4×0.4×3.2m)"></div>
      <div class="field-row">
        <div class="field"><label>Kateqoriya</label><select name="category"><option>Beton</option><option>Armatur</option><option>Torpaq işləri</option><option>Blok/Brick</option><option>MEP</option></select></div>
        <div class="field"><label>Vahid</label><input name="unit" placeholder="m³ / m² / ton"></div>
      </div>
      <div class="field"><label>Miqdar</label><input type="number" step="any" name="qty" required></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('takeoffForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('takeoff_items', []);
    rows.push({ id: DB.uid('tf'), element: fd.get('element'), category: fd.get('category'), unit: fd.get('unit')||'-', qty: Number(fd.get('qty')) });
    DB.set('takeoff_items', rows); closeModal(); showToast('Element əlavə olundu'); renderView('takeoff');
  };
}
function sendTakeoffToBoq(id) {
  const item = DB.get('takeoff_items', []).find(x => x.id === id);
  if (!item) return;
  const boq = DB.get('boq', []);
  boq.push({ id: DB.uid('bq'), code: '—', desc: item.element, unit: item.unit, qty: item.qty, unitPrice: 0 });
  DB.set('boq', boq);
  showToast('BOQ-a göndərildi (qiymət təyin edin)');
}

/* ---------------------------------------------------------------- COST ESTIMATION */
MODULES['cost-estimation'] = () => {
  const est = DB.get('cost_estimation', { labor: 0, equipment: 0, indirect: 0, marginPct: 10, taxPct: 18 });
  const materialCost = CALC.boqTotal(DB.get('boq', []));
  const direct = materialCost + est.labor + est.equipment + est.indirect;
  const margin = direct * (est.marginPct / 100);
  const preTax = direct + margin;
  const tax = preTax * (est.taxPct / 100);
  const grandTotal = preTax + tax;
  return `
  <div class="grid" style="grid-template-columns:1fr 1fr; gap:18px;">
    <div class="card">
      <div class="card-header"><h3>Xərc Girişləri</h3></div>
      <form id="costEstForm">
        <div class="field"><label>İşçi Qüvvəsi Xərci (₼)</label><input type="number" name="labor" value="${est.labor}"></div>
        <div class="field"><label>Avadanlıq Xərci (₼)</label><input type="number" name="equipment" value="${est.equipment}"></div>
        <div class="field"><label>Dolayı Xərclər (₼)</label><input type="number" name="indirect" value="${est.indirect}"></div>
        <div class="field-row">
          <div class="field"><label>Mənfəət Marjası (%)</label><input type="number" name="marginPct" value="${est.marginPct}"></div>
          <div class="field"><label>Vergi (%)</label><input type="number" name="taxPct" value="${est.taxPct}"></div>
        </div>
        <button type="submit" class="btn btn-primary">Yenilə</button>
      </form>
    </div>
    <div class="card">
      <div class="card-header"><h3>Xülasə</h3><p class="card-header-sub">BOQ material dəyəri: ${fmtMoney(materialCost)}</p></div>
      <div class="calc-result">
        <div class="rline"><span>Material (BOQ-dan)</span><strong>${fmtMoney(materialCost)}</strong></div>
        <div class="rline"><span>İşçi Qüvvəsi</span><strong>${fmtMoney(est.labor)}</strong></div>
        <div class="rline"><span>Avadanlıq</span><strong>${fmtMoney(est.equipment)}</strong></div>
        <div class="rline"><span>Dolayı Xərclər</span><strong>${fmtMoney(est.indirect)}</strong></div>
        <div class="rline"><span>Birbaşa Cəm</span><strong>${fmtMoney(direct)}</strong></div>
        <div class="rline"><span>Mənfəət (${est.marginPct}%)</span><strong>${fmtMoney(margin)}</strong></div>
        <div class="rline"><span>Vergi (${est.taxPct}%)</span><strong>${fmtMoney(tax)}</strong></div>
      </div>
      <div style="margin-top:14px; text-align:right;"><div style="font-size:12px; color:var(--text-faint);">ÜMUMİ LAYİHƏ DƏYƏRİ</div><div style="font-family:var(--font-mono); font-size:26px; font-weight:600; color:var(--blue);">${fmtMoney(grandTotal)}</div></div>
    </div>
  </div>`;
};
document.addEventListener('submit', (e) => {
  if (e.target && e.target.id === 'costEstForm') {
    e.preventDefault();
    const fd = new FormData(e.target);
    DB.set('cost_estimation', { labor: Number(fd.get('labor'))||0, equipment: Number(fd.get('equipment'))||0, indirect: Number(fd.get('indirect'))||0, marginPct: Number(fd.get('marginPct'))||0, taxPct: Number(fd.get('taxPct'))||0 });
    showToast('Xərc qiymətləndirməsi yeniləndi'); renderView('cost-estimation');
  }
});

/* ---------------------------------------------------------------- PROCUREMENT / RFQ */
MODULES.procurement = () => {
  const rows = DB.get('procurement', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Satınalma / RFQ</h3><p class="card-header-sub">${rows.length} sifariş</p></div><button class="btn btn-primary btn-sm" onclick="openProcurementForm()">+ Sifariş</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Material</th><th>Miqdar</th><th>Təchizatçı</th><th>Status</th><th>Gözlənilən Tarix</th><th></th></tr></thead>
      <tbody>
        ${rows.map(p => `<tr>
          <td style="font-weight:600;">${p.item}</td><td style="font-family:var(--font-mono);">${fmtNum(p.qty)}</td><td>${p.vendor}</td>
          <td><span class="badge ${p.status==='çatdırılıb'?'green':p.status==='sifariş verilib'?'blue':'orange'}">${p.status}</span></td>
          <td style="font-family:var(--font-mono);">${p.eta}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('procurement','${p.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="6">${emptyState('📦','Sifariş yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openProcurementForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Satınalma Sifarişi</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="procForm">
      <div class="field"><label>Material</label><input required name="item"></div>
      <div class="field-row"><div class="field"><label>Miqdar</label><input type="number" name="qty" required></div><div class="field"><label>Təchizatçı</label><input name="vendor"></div></div>
      <div class="field-row"><div class="field"><label>Status</label><select name="status"><option>təklif mərhələsi</option><option>sifariş verilib</option><option>çatdırılıb</option></select></div><div class="field"><label>Gözlənilən tarix</label><input type="date" name="eta"></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('procForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('procurement', []);
    rows.push({ id: DB.uid('pc'), item: fd.get('item'), qty: Number(fd.get('qty')), vendor: fd.get('vendor'), status: fd.get('status'), eta: fd.get('eta') });
    DB.set('procurement', rows); closeModal(); showToast('Sifariş əlavə olundu'); renderView('procurement');
  };
}

/* ---------------------------------------------------------------- MATERIALS WAREHOUSE */
MODULES.materials = () => {
  const rows = DB.get('materials_stock', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Material İdarəetməsi</h3><p class="card-header-sub">Anbar stok səviyyəsi</p></div><button class="btn btn-primary btn-sm" onclick="openMaterialForm()">+ Material</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Material</th><th>Stok</th><th>Min. Səviyyə</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${rows.map(m => `<tr>
          <td style="font-weight:600;">${m.name}</td>
          <td style="font-family:var(--font-mono);">${fmtNum(m.qty)} ${m.unit}</td>
          <td style="font-family:var(--font-mono);">${fmtNum(m.minLevel)} ${m.unit}</td>
          <td>${m.qty <= m.minLevel ? '<span class="badge red">Stok azdır</span>' : '<span class="badge green">Kifayətdir</span>'}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('materials_stock','${m.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="5">${emptyState('🏗️','Material yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openMaterialForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Material</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="materialForm">
      <div class="field"><label>Material adı</label><input required name="name"></div>
      <div class="field-row"><div class="field"><label>Stok miqdarı</label><input type="number" name="qty" required></div><div class="field"><label>Vahid</label><input name="unit" placeholder="kisə/m³/ton"></div></div>
      <div class="field"><label>Minimum səviyyə</label><input type="number" name="minLevel" required></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('materialForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('materials_stock', []);
    rows.push({ id: DB.uid('mt'), name: fd.get('name'), qty: Number(fd.get('qty')), unit: fd.get('unit')||'-', minLevel: Number(fd.get('minLevel')) });
    DB.set('materials_stock', rows); closeModal(); showToast('Material əlavə olundu'); renderView('materials');
  };
}

/* ---------------------------------------------------------------- EQUIPMENT REGISTRY */
MODULES.equipment = () => {
  const rows = DB.get('equipment_registry', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Avadanlıq Reyestri</h3><p class="card-header-sub">${rows.length} vahid</p></div><button class="btn btn-primary btn-sm" onclick="openEquipmentForm()">+ Avadanlıq</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Ad</th><th>Növ</th><th>İş Saatı</th><th>Yanacaq</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${rows.map(e => `<tr>
          <td style="font-weight:600;">${e.name}</td><td>${e.type}</td>
          <td style="font-family:var(--font-mono);">${fmtNum(e.hours)} saat</td><td>${e.fuel}</td>
          <td><span class="badge ${e.status==='aktiv'?'green':e.status==='texniki xidmətdə'?'orange':'red'}">${e.status}</span></td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('equipment_registry','${e.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="6">${emptyState('🚜','Avadanlıq yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openEquipmentForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Avadanlıq</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="equipForm">
      <div class="field"><label>Ad</label><input required name="name"></div>
      <div class="field-row"><div class="field"><label>Növ</label><input name="type"></div><div class="field"><label>Yanacaq</label><input name="fuel" placeholder="Dizel/Benzin/Elektrik"></div></div>
      <div class="field-row"><div class="field"><label>İş saatı</label><input type="number" name="hours" value="0"></div><div class="field"><label>Status</label><select name="status"><option>aktiv</option><option>texniki xidmətdə</option><option>nasazlıq</option></select></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('equipForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('equipment_registry', []);
    rows.push({ id: DB.uid('eq'), name: fd.get('name'), type: fd.get('type'), fuel: fd.get('fuel'), hours: Number(fd.get('hours'))||0, status: fd.get('status') });
    DB.set('equipment_registry', rows); closeModal(); showToast('Avadanlıq əlavə olundu'); renderView('equipment');
  };
}

/* ---------------------------------------------------------------- WORKFORCE */
MODULES.workforce = () => {
  const rows = DB.get('workforce_registry', []);
  const today = new Date();
  return `
  <div class="card">
    <div class="card-header"><div><h3>İşçi Qüvvəsi</h3><p class="card-header-sub">${rows.length} işçi</p></div><button class="btn btn-primary btn-sm" onclick="openWorkforceForm()">+ İşçi</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Ad</th><th>Vəzifə</th><th>Layihə</th><th>Telefon</th><th>Sertifikat Bitmə</th><th></th></tr></thead>
      <tbody>
        ${rows.map(w => {
          const daysLeft = Math.ceil((new Date(w.certExpiry) - today) / 86400000);
          return `<tr>
          <td style="font-weight:600;">${w.name}</td><td>${w.role}</td><td>${w.project}</td>
          <td style="font-family:var(--font-mono); font-size:12px;">${w.phone}</td>
          <td>${daysLeft < 45 ? `<span class="badge red">${w.certExpiry}</span>` : `<span class="badge green">${w.certExpiry}</span>`}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('workforce_registry','${w.id}')">Sil</button></td>
        </tr>`;
        }).join('') || `<tr><td colspan="6">${emptyState('👷','İşçi yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openWorkforceForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni İşçi</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="workforceForm">
      <div class="field"><label>Ad Soyad</label><input required name="name"></div>
      <div class="field-row"><div class="field"><label>Vəzifə</label><input name="role"></div><div class="field"><label>Layihə</label><input name="project"></div></div>
      <div class="field-row"><div class="field"><label>Telefon</label><input name="phone"></div><div class="field"><label>Sertifikat bitmə tarixi</label><input type="date" name="certExpiry"></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('workforceForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('workforce_registry', []);
    rows.push({ id: DB.uid('wf'), name: fd.get('name'), role: fd.get('role'), project: fd.get('project'), phone: fd.get('phone'), certExpiry: fd.get('certExpiry') });
    DB.set('workforce_registry', rows); closeModal(); showToast('İşçi əlavə olundu'); renderView('workforce');
  };
}

/* ---------------------------------------------------------------- ACCESS CONTROL (QR check-in/out) */
MODULES['access-control'] = () => {
  const log = DB.get('access_log', []).slice().reverse();
  const workers = DB.get('workforce_registry', []);
  // live headcount: last action per person
  const lastAction = {};
  DB.get('access_log', []).forEach(l => { lastAction[l.name] = l.action; });
  const onSite = Object.values(lastAction).filter(a => a === 'giriş').length;
  return `
  <div class="grid grid-3" style="margin-bottom:18px;">
    ${kpiCard('Hazırda Sahədə', onSite, '🟢', '#22C55E', '', '')}
    ${kpiCard('Bugünkü Girişlər', log.filter(l=>l.action==='giriş').length, '🚪', '#2E6FF2', '', '')}
    ${kpiCard('Qeydiyyatlı İşçi', workers.length, '🎫', '#FF7A1A', '', '')}
  </div>
  <div class="card">
    <div class="card-header">
      <div><h3>Giriş-Çıxış Qeydiyyatı</h3><p class="card-header-sub">QR skan simulyasiyası — real qapıda mobil/terminal skaneri ilə əvəzlənəcək</p></div>
      <button class="btn btn-primary btn-sm" onclick="openAccessForm()">+ Qeyd (Giriş/Çıxış)</button>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>İşçi</th><th>Əməliyyat</th><th>Vaxt</th><th>Metod</th><th></th></tr></thead>
      <tbody>
        ${log.map(l => `<tr>
          <td style="font-weight:600;">${l.name}</td>
          <td><span class="badge ${l.action==='giriş'?'green':'gray'}">${l.action}</span></td>
          <td style="font-family:var(--font-mono); font-size:12px;">${new Date(l.time).toLocaleString('az-AZ')}</td>
          <td>${l.method}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('access_log','${l.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="5">${emptyState('🎫','Qeyd yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openAccessForm() {
  const workers = DB.get('workforce_registry', []);
  openModal(`
    <div class="modal-header"><h3>Giriş/Çıxış Qeydi</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="accessForm">
      <div class="field"><label>İşçi</label>
        <select name="name" required>
          ${workers.map(w => `<option>${w.name}</option>`).join('') || '<option>İşçi qeydiyyatı yoxdur</option>'}
        </select>
      </div>
      <div class="field"><label>Əməliyyat</label><select name="action"><option value="giriş">Giriş</option><option value="çıxış">Çıxış</option></select></div>
      <div class="field"><label>Metod</label><select name="method"><option>QR</option><option>Turnstil / RFID</option><option>Manual</option></select></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Qeyd et</button></div>
    </form>`);
  document.getElementById('accessForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('access_log', []);
    rows.push({ id: DB.uid('al'), name: fd.get('name'), action: fd.get('action'), method: fd.get('method'), time: new Date().toISOString() });
    DB.set('access_log', rows);
    logActivity(fd.get('name') + ' sahəyə ' + fd.get('action') + ' etdi', '🎫'); closeModal(); showToast('Qeyd əlavə olundu'); renderView('access-control');
  };
}

/* ---------------------------------------------------------------- HR & LEAVE */
MODULES.hr = () => {
  const rows = DB.get('hr_leave', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>HR & Məzuniyyət</h3><p class="card-header-sub">${rows.length} qeyd</p></div><button class="btn btn-primary btn-sm" onclick="openHrForm()">+ Məzuniyyət</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>İşçi</th><th>Növ</th><th>Tarix Aralığı</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${rows.map(h => `<tr>
          <td style="font-weight:600;">${h.name}</td><td>${h.type}</td>
          <td style="font-family:var(--font-mono); font-size:12px;">${h.from} → ${h.to}</td>
          <td><span class="badge ${h.status==='təsdiqlənib'?'green':'orange'}">${h.status}</span></td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('hr_leave','${h.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="5">${emptyState('🧑‍💼','Qeyd yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openHrForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Məzuniyyət Sorğusu</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="hrForm">
      <div class="field"><label>İşçi</label><input required name="name"></div>
      <div class="field"><label>Növ</label><select name="type"><option>İllik Məzuniyyət</option><option>Xəstəlik</option><option>Ödənişsiz</option></select></div>
      <div class="field-row"><div class="field"><label>Başlanğıc</label><input type="date" name="from" required></div><div class="field"><label>Son</label><input type="date" name="to" required></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Göndər</button></div>
    </form>`);
  document.getElementById('hrForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('hr_leave', []);
    rows.push({ id: DB.uid('hl'), name: fd.get('name'), type: fd.get('type'), from: fd.get('from'), to: fd.get('to'), status: 'gözlənilir' });
    DB.set('hr_leave', rows); closeModal(); showToast('Sorğu göndərildi'); renderView('hr');
  };
}

/* ---------------------------------------------------------------- PAYROLL */
MODULES.payroll = () => {
  const rows = DB.get('payroll', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Əmək Haqqı</h3><p class="card-header-sub">${rows.length} işçi</p></div><button class="btn btn-primary btn-sm" onclick="openPayrollForm()">+ İşçi</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>İşçi</th><th>Baza Maaş</th><th>Əlavə İş (saat×qiymət)</th><th>Kəsintilər</th><th>Yekun</th><th></th></tr></thead>
      <tbody>
        ${rows.map(p => {
          const overtime = p.overtimeHrs * p.overtimeRate;
          const total = p.base + overtime - p.deductions;
          return `<tr>
          <td style="font-weight:600;">${p.name}</td>
          <td style="font-family:var(--font-mono);">${fmtMoney(p.base)}</td>
          <td style="font-family:var(--font-mono);">${p.overtimeHrs}h × ${fmtMoney(p.overtimeRate)}</td>
          <td style="font-family:var(--font-mono); color:var(--red);">-${fmtMoney(p.deductions)}</td>
          <td style="font-family:var(--font-mono); font-weight:600; color:var(--blue);">${fmtMoney(total)}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('payroll','${p.id}')">Sil</button></td>
        </tr>`;}).join('') || `<tr><td colspan="6">${emptyState('💰','İşçi yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openPayrollForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Əmək Haqqı Qeydi</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="payrollForm">
      <div class="field"><label>İşçi</label><input required name="name"></div>
      <div class="field-row"><div class="field"><label>Baza Maaş (₼)</label><input type="number" name="base" required></div><div class="field"><label>Kəsintilər (₼)</label><input type="number" name="deductions" value="0"></div></div>
      <div class="field-row"><div class="field"><label>Əlavə iş saatı</label><input type="number" name="overtimeHrs" value="0"></div><div class="field"><label>Saatlıq əlavə iş qiyməti (₼)</label><input type="number" name="overtimeRate" value="0"></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('payrollForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('payroll', []);
    rows.push({ id: DB.uid('pr2'), name: fd.get('name'), base: Number(fd.get('base')), deductions: Number(fd.get('deductions'))||0, overtimeHrs: Number(fd.get('overtimeHrs'))||0, overtimeRate: Number(fd.get('overtimeRate'))||0 });
    DB.set('payroll', rows); closeModal(); showToast('İşçi əlavə olundu'); renderView('payroll');
  };
}

/* ---------------------------------------------------------------- DRAWINGS REGISTER */
MODULES.drawings = () => {
  const rows = DB.get('drawings_register', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Çertyoj Reyestri</h3><p class="card-header-sub">Versiya idarəetməsi</p></div><button class="btn btn-primary btn-sm" onclick="openDrawingForm()">+ Çertyoj</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Kod</th><th>Ad</th><th>Sahə</th><th>Revizyon</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${rows.map(d => `<tr>
          <td style="font-family:var(--font-mono);">${d.code}</td><td>${d.title}</td><td>${d.discipline}</td>
          <td><span class="badge blue">Rev ${d.revision}</span></td>
          <td><span class="badge ${d.status==='təsdiqlənib'?'green':'orange'}">${d.status}</span></td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('drawings_register','${d.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="6">${emptyState('📄','Çertyoj yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openDrawingForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Çertyoj</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="drawingForm">
      <div class="field-row"><div class="field"><label>Kod</label><input name="code" placeholder="ARC-A-101"></div><div class="field"><label>Revizyon</label><input name="revision" placeholder="A"></div></div>
      <div class="field"><label>Ad</label><input required name="title"></div>
      <div class="field-row"><div class="field"><label>Sahə</label><input name="discipline" placeholder="Memarlıq/Konstruksiya/MEP"></div><div class="field"><label>Status</label><select name="status"><option>qaralama</option><option>baxışda</option><option>təsdiqlənib</option></select></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('drawingForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('drawings_register', []);
    rows.push({ id: DB.uid('dr'), code: fd.get('code')||'—', title: fd.get('title'), discipline: fd.get('discipline')||'—', revision: fd.get('revision')||'A', status: fd.get('status') });
    DB.set('drawings_register', rows); closeModal(); showToast('Çertyoj əlavə olundu'); renderView('drawings');
  };
}

/* ---------------------------------------------------------------- RFI */
MODULES.rfi = () => {
  const rows = DB.get('rfis', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>RFI — Sorğular</h3><p class="card-header-sub">${rows.length} sorğu</p></div><button class="btn btn-primary btn-sm" onclick="openRfiForm()">+ RFI</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Mövzu</th><th>Layihə</th><th>Prioritet</th><th>Status</th><th>Son Tarix</th><th></th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr>
          <td style="font-weight:600;">${r.subject}</td><td>${r.project}</td>
          <td>${severityBadge(r.priority==='yüksək'?'yüksək':r.priority==='orta'?'orta':'aşağı')}</td>
          <td><span class="badge ${r.status==='bağlı'?'green':'orange'}">${r.status}</span></td>
          <td style="font-family:var(--font-mono);">${r.due}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('rfis','${r.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="6">${emptyState('❓','RFI yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openRfiForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni RFI</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="rfiForm">
      <div class="field"><label>Mövzu</label><input required name="subject"></div>
      <div class="field"><label>Layihə</label><input name="project"></div>
      <div class="field-row"><div class="field"><label>Prioritet</label><select name="priority"><option>aşağı</option><option>orta</option><option>yüksək</option></select></div><div class="field"><label>Son tarix</label><input type="date" name="due"></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Göndər</button></div>
    </form>`);
  document.getElementById('rfiForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('rfis', []);
    rows.push({ id: DB.uid('rf'), subject: fd.get('subject'), project: fd.get('project'), priority: fd.get('priority'), due: fd.get('due'), status: 'açıq' });
    DB.set('rfis', rows);
    logActivity('Yeni RFI yaradıldı: ' + fd.get('subject'), '❓'); closeModal(); showToast('RFI göndərildi'); renderView('rfi');
  };
}

/* ---------------------------------------------------------------- SUBMITTALS */
MODULES.submittals = () => {
  const rows = DB.get('submittals', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Submittals</h3><p class="card-header-sub">${rows.length} təqdimat</p></div><button class="btn btn-primary btn-sm" onclick="openSubmittalForm()">+ Submittal</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Element</th><th>Növ</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${rows.map(s => `<tr>
          <td style="font-weight:600;">${s.item}</td><td><span class="badge blue">${s.type}</span></td>
          <td><span class="badge ${s.status==='təsdiqlənib'?'green':s.status==='rədd edilib'?'red':'orange'}">${s.status}</span></td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('submittals','${s.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="4">${emptyState('📤','Submittal yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openSubmittalForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Submittal</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="submittalForm">
      <div class="field"><label>Element</label><input required name="item"></div>
      <div class="field-row"><div class="field"><label>Növ</label><select name="type"><option>Material Submittal</option><option>Shop Drawing</option><option>Technical Data Sheet</option></select></div>
      <div class="field"><label>Status</label><select name="status"><option>baxışda</option><option>təsdiqlənib</option><option>rədd edilib</option></select></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('submittalForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('submittals', []);
    rows.push({ id: DB.uid('sb'), item: fd.get('item'), type: fd.get('type'), status: fd.get('status') });
    DB.set('submittals', rows); closeModal(); showToast('Submittal əlavə olundu'); renderView('submittals');
  };
}

/* ---------------------------------------------------------------- METHOD STATEMENT (template-assisted) */
const MS_TEMPLATES = {
  'Beton İşləri': (p) => `1. MƏQSƏD\nBu metod bəyanatı "${p}" işinin təhlükəsiz və keyfiyyətli icrasını təsvir edir.\n\n2. TƏHLÜKƏSİZLİK TƏLƏBLƏRİ\n- Bütün işçilər PPE geyinməlidir\n- İş sahəsi maneə lenti ilə əhatələnməlidir\n\n3. İCRA ADDIMLARI\n- Qəlib işlərinin yoxlanması\n- Armaturun yerləşdirilməsi və yoxlanması\n- Beton tökülməsi və vibrasiya\n- Kürəmə müddəti və qorunması\n\n4. KEYFİYYƏTƏ NƏZARƏT\n- Kub nümunələrinin götürülməsi\n- Slump testi`,
  'Qazıntı İşləri': (p) => `1. MƏQSƏD\n"${p}" üzrə təhlükəsiz qazıntı işlərinin icrası.\n\n2. TƏHLÜKƏSİZLİK\n- Yamacların dayanıqlığının yoxlanması\n- Yeraltı kommunikasiyaların əvvəlcədən müəyyən edilməsi\n\n3. İCRA ADDIMLARI\n- Sahənin nişanlanması\n- Mexaniki qazıntı\n- Torpağın çıxarılması və daşınması\n\n4. KEYFİYYƏTƏ NƏZARƏT\n- Dərinlik və ölçü yoxlaması`,
  'Armatur İşləri': (p) => `1. MƏQSƏD\n"${p}" üzrə armatur bağlama işlərinin icrası.\n\n2. TƏHLÜKƏSİZLİK\n- Kəskin uclara qarşı əlcək istifadəsi\n\n3. İCRA ADDIMLARI\n- Çertyoja uyğun kəsim\n- Bağlama sxeminə uyğun düzülüş\n- Örtük qalınlığının təmin edilməsi\n\n4. KEYFİYYƏTƏ NƏZARƏT\n- Diametr və məsafə yoxlaması`,
};
MODULES['method-statement'] = () => {
  const rows = DB.get('method_statements', []);
  return `
  <div class="grid" style="grid-template-columns:1fr 1fr; gap:18px;">
    <div class="card">
      <div class="card-header"><h3>Şablon-Əsaslı Generator</h3><p class="card-header-sub">Qaralama mətni avtomatik yaradır</p></div>
      <div class="field"><label>İş növü</label><select id="msType">${Object.keys(MS_TEMPLATES).map(t=>`<option>${t}</option>`).join('')}</select></div>
      <div class="field"><label>Layihə / İş adı</label><input id="msProject" placeholder="Port Baku Residence Tower B"></div>
      <button class="btn btn-primary" onclick="generateMethodStatement()">✨ Qaralama Yarat</button>
      <textarea id="msOutput" rows="10" style="margin-top:14px; font-family:var(--font-mono); font-size:12px;" readonly placeholder="Yaradılan mətn burada görünəcək..."></textarea>
      <button class="btn btn-outline btn-sm" style="margin-top:10px;" onclick="saveMethodStatement()">Reyestrə Əlavə Et</button>
    </div>
    <div class="card">
      <div class="card-header"><h3>Metod Bəyanatları Reyestri</h3></div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${rows.map(m => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--bg-2); border-radius:10px;">
            <span style="font-size:13px;">${m.title}</span>
            <div style="display:flex; gap:8px; align-items:center;">
              <span class="badge ${m.status==='təsdiqlənib'?'green':'orange'}">${m.status}</span>
              <button class="btn btn-ghost btn-sm" onclick="deleteRow('method_statements','${m.id}')">Sil</button>
            </div>
          </div>
        `).join('') || emptyState('📋','Metod bəyanatı yoxdur','')}
      </div>
    </div>
  </div>`;
};
function generateMethodStatement() {
  const type = document.getElementById('msType').value;
  const project = document.getElementById('msProject').value || 'Layihə';
  document.getElementById('msOutput').value = MS_TEMPLATES[type](project);
}
function saveMethodStatement() {
  const type = document.getElementById('msType').value;
  const output = document.getElementById('msOutput').value;
  if (!output) { showToast('Əvvəlcə qaralama yaradın'); return; }
  const rows = DB.get('method_statements', []);
  rows.push({ id: DB.uid('mst'), title: type + ' Metod Bəyanatı', discipline: type, status: 'qaralama' });
  DB.set('method_statements', rows);
  showToast('Reyestrə əlavə olundu'); renderView('method-statement');
}

/* ---------------------------------------------------------------- INSPECTION / ITP */
MODULES.inspection = () => {
  const rows = DB.get('inspections', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>İTP & Yoxlamalar</h3><p class="card-header-sub">${rows.length} yoxlama</p></div><button class="btn btn-primary btn-sm" onclick="openInspectionForm()">+ Yoxlama</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Yoxlama</th><th>Layihə</th><th>Tarix</th><th>Nəticə</th><th></th></tr></thead>
      <tbody>
        ${rows.map(i => `<tr>
          <td style="font-weight:600;">${i.title}</td><td>${i.project}</td>
          <td style="font-family:var(--font-mono);">${i.date}</td>
          <td><span class="badge ${i.result==='keçdi'?'green':i.result==='uğursuz'?'red':'orange'}">${i.result}</span></td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('inspections','${i.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="5">${emptyState('🔍','Yoxlama yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openInspectionForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Yoxlama</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="inspectionForm">
      <div class="field"><label>Yoxlama adı</label><input required name="title"></div>
      <div class="field"><label>Layihə</label><input name="project"></div>
      <div class="field-row"><div class="field"><label>Tarix</label><input type="date" name="date" required></div><div class="field"><label>Nəticə</label><select name="result"><option>gözlənilir</option><option>keçdi</option><option>uğursuz</option></select></div></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('inspectionForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('inspections', []);
    rows.push({ id: DB.uid('in'), title: fd.get('title'), project: fd.get('project'), date: fd.get('date'), result: fd.get('result') });
    DB.set('inspections', rows);
    logActivity('Yoxlama aparıldı: ' + fd.get('title'), '🔍'); closeModal(); showToast('Yoxlama əlavə olundu'); renderView('inspection');
  };
}

/* ---------------------------------------------------------------- AI ASSISTANT (local rule-based smart search) */
MODULES['ai-assistant'] = () => `
  <div class="card">
    <div class="card-header">
      <div><h3>AI Köməkçi</h3><p class="card-header-sub">Layihə datanız üzərində sürətli axtarış (demo — real LLM inteqrasiyası backend tələb edir)</p></div>
    </div>
    <div id="aiChat" style="display:flex; flex-direction:column; gap:10px; max-height:360px; overflow-y:auto; margin-bottom:14px; padding:4px;">
      <div style="background:var(--bg-2); border-radius:12px; padding:12px 14px; font-size:13px; max-width:80%;">
        Salam 👋 Layihələr, risklər, tapşırıqlar və BOQ üzrə sual verə bilərsiniz. Məs: <em>"Gəncə layihəsinin riski nədir?"</em>
      </div>
    </div>
    <div style="display:flex; gap:8px;">
      <input type="text" id="aiInput" placeholder="Sualınızı yazın..." onkeydown="if(event.key==='Enter') askAI()">
      <button class="btn btn-primary" onclick="askAI()">Göndər</button>
    </div>
  </div>
  <div class="card" style="margin-top:16px; border-color:rgba(46,111,242,.3);">
    <p style="font-size:12.5px; color:var(--text-faint);">💡 Bu demo versiya sadəcə lokal datanız üzərində açar-söz axtarışı aparır. Tam AI Assistant (Claude API ilə) real inteqrasiya üçün backend API açarı tələb edir — hazırda static GitHub Pages tətbiqində mövcud deyil.</p>
  </div>
`;
function askAI() {
  const input = document.getElementById('aiInput');
  const q = input.value.trim();
  if (!q) return;
  const chat = document.getElementById('aiChat');
  chat.innerHTML += `<div style="align-self:flex-end; background:var(--blue); color:#fff; border-radius:12px; padding:12px 14px; font-size:13px; max-width:80%; margin-left:auto;">${q}</div>`;
  const answer = answerFromLocalData(q);
  chat.innerHTML += `<div style="background:var(--bg-2); border-radius:12px; padding:12px 14px; font-size:13px; max-width:80%;">${answer}</div>`;
  chat.scrollTop = chat.scrollHeight;
  input.value = '';
}
function answerFromLocalData(q) {
  const ql = q.toLowerCase();
  const projects = DB.get('projects', []);
  const risks = DB.get('risks', []);
  const tasks = DB.get('tasks', []);
  const proj = projects.find(p => ql.includes(p.name.toLowerCase().split(' ')[0].toLowerCase()));
  if (proj && ql.includes('risk')) return `<strong>${proj.name}</strong> layihəsinin risk statusu: <strong>${proj.risk}</strong>. İrəliləyiş: ${proj.progress}%, Büdcə: ${fmtMoney(proj.budget)}.`;
  if (proj) return `<strong>${proj.name}</strong>: ${proj.progress}% tamamlanıb, büdcə ${fmtMoney(proj.spent)}/${fmtMoney(proj.budget)}, risk: ${proj.risk}.`;
  if (ql.includes('risk')) return risks.length ? `Ən yüksək bal riski: <strong>${risks.sort((a,b)=>(b.likelihood*b.impact)-(a.likelihood*a.impact))[0].title}</strong>` : 'Risk reyestrində qeyd yoxdur.';
  if (ql.includes('tapşırıq') || ql.includes('vəzifə')) return tasks.filter(t=>!t.done).length ? `Bitirilməmiş ${tasks.filter(t=>!t.done).length} tapşırıq var, ən yaxını: "${tasks.find(t=>!t.done)?.title}"` : 'Bütün tapşırıqlar tamamlanıb.';
  if (ql.includes('büdcə')) return `Ümumi büdcə: ${fmtMoney(projects.reduce((s,p)=>s+p.budget,0))}, xərclənib: ${fmtMoney(projects.reduce((s,p)=>s+p.spent,0))}.`;
  return 'Bu sualı lokal datada tapa bilmədim. Layihə adı, "risk", "tapşırıq" və ya "büdcə" açar sözləri ilə cəhd edin.';
}

/* ---------------------------------------------------------------- DOCUMENT CENTER */
MODULES.documents = () => {
  const rows = DB.get('documents_center', []);
  return `
  <div class="card">
    <div class="card-header"><div><h3>Sənəd Mərkəzi</h3><p class="card-header-sub">${rows.length} sənəd</p></div><button class="btn btn-primary btn-sm" onclick="openDocForm()">+ Sənəd</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Ad</th><th>Kateqoriya</th><th>Layihə</th><th>Tarix</th><th></th></tr></thead>
      <tbody>
        ${rows.map(d => `<tr>
          <td style="font-weight:600;">📄 ${d.name}</td><td><span class="badge blue">${d.category}</span></td><td>${d.project}</td>
          <td style="font-family:var(--font-mono);">${d.date}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('documents_center','${d.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="5">${emptyState('📁','Sənəd yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openDocForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Sənəd Qeydi</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="docForm">
      <div class="field"><label>Sənəd adı</label><input required name="name" placeholder="Layihə Xülasəsi.pdf"></div>
      <div class="field-row"><div class="field"><label>Kateqoriya</label><input name="category" placeholder="Ümumi/Maliyyə/HSE"></div><div class="field"><label>Layihə</label><input name="project"></div></div>
      <div class="field"><label>Tarix</label><input type="date" name="date"></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('docForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('documents_center', []);
    rows.push({ id: DB.uid('doc'), name: fd.get('name'), category: fd.get('category')||'Ümumi', project: fd.get('project')||'—', date: fd.get('date')||new Date().toISOString().slice(0,10) });
    DB.set('documents_center', rows); closeModal(); showToast('Sənəd əlavə olundu'); renderView('documents');
  };
}

/* ---------------------------------------------------------------- BIM CENTER (lightweight 3D demo) */
MODULES.bim = () => `
  <div class="card">
    <div class="card-header"><div><h3>BIM Mərkəzi</h3><p class="card-header-sub">Model naviqasiya demo — tam BIM (IFC/Revit) inteqrasiyası Faza 3-də</p></div></div>
    <div style="display:flex; justify-content:center; padding:40px 0; perspective:900px;">
      <div id="bimBuilding" style="width:160px; height:160px; position:relative; transform-style:preserve-3d; transform:rotateX(-20deg) rotateY(30deg); transition:transform .1s linear;">
        ${['front','back','left','right','top'].map(face => `<div class="bim-face bim-${face}"></div>`).join('')}
      </div>
    </div>
    <div style="display:flex; justify-content:center; gap:10px; margin-bottom:18px;">
      <button class="btn btn-outline btn-sm" onclick="toggleBimSpin()">🔄 Auto-Rotasiya</button>
      <button class="btn btn-outline btn-sm" onclick="showBimInfo()">ℹ️ Element Məlumatı</button>
    </div>
    <div id="bimInfo"></div>
  </div>
  <style>
    .bim-face{ position:absolute; width:160px; height:160px; background:linear-gradient(135deg, rgba(46,111,242,.35), rgba(108,76,242,.25)); border:1px solid rgba(46,111,242,.5); }
    .bim-front{ transform:translateZ(80px); }
    .bim-back{ transform:translateZ(-80px) rotateY(180deg); }
    .bim-left{ transform:rotateY(-90deg) translateZ(80px); }
    .bim-right{ transform:rotateY(90deg) translateZ(80px); }
    .bim-top{ transform:rotateX(90deg) translateZ(80px); background:rgba(255,122,26,.25); }
  </style>
`;
let bimSpinning = false, bimAngle = 30, bimSpinTimer;
function toggleBimSpin() {
  bimSpinning = !bimSpinning;
  clearInterval(bimSpinTimer);
  if (bimSpinning) {
    bimSpinTimer = setInterval(() => {
      bimAngle = (bimAngle + 2) % 360;
      const el = document.getElementById('bimBuilding');
      if (el) el.style.transform = `rotateX(-20deg) rotateY(${bimAngle}deg)`;
    }, 30);
  }
}
function showBimInfo() {
  document.getElementById('bimInfo').innerHTML = `
    <div class="calc-result">
      <div class="rline"><span>Element</span><strong>Blok B — Karkas</strong></div>
      <div class="rline"><span>Material</span><strong>Dəmir-beton</strong></div>
      <div class="rline"><span>Status</span><strong>Quraşdırılır</strong></div>
      <div class="rline"><span>Son yenilənmə</span><strong>2026-07-25</strong></div>
    </div>`;
}

/* ---------------------------------------------------------------- REPORTS */
MODULES.reports = () => {
  const projects = DB.get('projects', []);
  const incidents = DB.get('hse_incidents', []);
  const boq = DB.get('boq', []);
  const risks = DB.get('risks', []);
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>Hesabatlar</h3><p class="card-header-sub">Cari layihə statusu üzrə avtomatik xülasə</p></div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-outline btn-sm" onclick="window.print()">🖨 Çap Et</button>
        <button class="btn btn-primary btn-sm" onclick="exportWorkspaceData()">⬇ JSON İxrac</button>
      </div>
    </div>
    <div class="grid grid-2">
      <div>
        <h4 style="font-family:var(--font-display); font-size:14px; margin-bottom:10px;">Layihə Xülasəsi</h4>
        ${projects.map(p => `<div class="rline" style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border); font-size:13px;"><span>${p.name}</span><strong>${p.progress}%</strong></div>`).join('')}
      </div>
      <div>
        <h4 style="font-family:var(--font-display); font-size:14px; margin-bottom:10px;">Keyfiyyət & Təhlükəsizlik</h4>
        <div class="rline" style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border); font-size:13px;"><span>HSE qeydləri</span><strong>${incidents.length}</strong></div>
        <div class="rline" style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border); font-size:13px;"><span>Açıq risklər</span><strong>${risks.filter(r=>r.status!=='bağlı').length}</strong></div>
        <div class="rline" style="display:flex; justify-content:space-between; padding:6px 0; font-size:13px;"><span>BOQ ümumi dəyəri</span><strong>${fmtMoney(CALC.boqTotal(boq))}</strong></div>
      </div>
    </div>
  </div>`;
};

/* ---------------------------------------------------------------- ANALYTICS */
MODULES.analytics = () => {
  const projects = DB.get('projects', []);
  const maxBudget = Math.max(...projects.map(p=>p.budget), 1);
  return `
  <div class="card">
    <div class="card-header"><h3>Analitika — Layihələr üzrə Büdcə Müqayisəsi</h3></div>
    <div style="display:flex; align-items:flex-end; gap:18px; height:220px; padding:10px 6px;">
      ${projects.map(p => `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:8px;">
          <div style="width:100%; display:flex; flex-direction:column; justify-content:flex-end; height:170px;">
            <div style="width:100%; border-radius:8px 8px 0 0; background:linear-gradient(180deg,var(--blue),#6C4CF2); height:${(p.budget/maxBudget*100)}%;" title="${fmtMoney(p.budget)}"></div>
          </div>
          <div style="font-size:10.5px; color:var(--text-faint); text-align:center;">${p.name.split(' ').slice(0,2).join(' ')}</div>
        </div>
      `).join('')}
    </div>
  </div>
  <div class="card" style="margin-top:16px;">
    <div class="card-header"><h3>İrəliləyiş Trendi</h3></div>
    <div style="display:flex; align-items:flex-end; gap:14px; height:160px; padding:10px 6px;">
      ${projects.map(p => `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:6px;">
          <div style="width:100%; display:flex; flex-direction:column; justify-content:flex-end; height:120px;">
            <div style="width:100%; border-radius:8px 8px 0 0; background:${p.progress>=90?'var(--green)':p.progress>=50?'var(--blue)':'var(--orange)'}; height:${p.progress}%;"></div>
          </div>
          <div style="font-size:11px; font-family:var(--font-mono); color:var(--text-dim);">${p.progress}%</div>
        </div>
      `).join('')}
    </div>
  </div>`;
};

/* ---------------------------------------------------------------- FINANCE — BUDGET & PAYMENTS */
MODULES.finance = () => {
  const rows = DB.get('finance_payments', []);
  const income = rows.filter(r=>r.type==='gəlir').reduce((s,r)=>s+r.amount,0);
  const expense = rows.filter(r=>r.type==='xərc').reduce((s,r)=>s+r.amount,0);
  const net = income - expense;
  return `
  <div class="grid grid-3" style="margin-bottom:18px;">
    ${kpiCard('Ümumi Gəlir', fmtMoney(income), '💵', '#22C55E', '', '')}
    ${kpiCard('Ümumi Xərc', fmtMoney(expense), '📉', '#EF4444', '', '')}
    ${kpiCard('Xalis Vəziyyət', fmtMoney(net), '⚖️', net>=0?'#2E6FF2':'#EF4444', '', '')}
  </div>
  <div class="card">
    <div class="card-header"><div><h3>Büdcə & Ödənişlər</h3><p class="card-header-sub">${rows.length} əməliyyat</p></div><button class="btn btn-primary btn-sm" onclick="openFinanceForm()">+ Əməliyyat</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Layihə</th><th>Növ</th><th>Təsvir</th><th>Məbləğ</th><th>Tarix</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr>
          <td>${r.project}</td>
          <td><span class="badge ${r.type==='gəlir'?'green':'red'}">${r.type}</span></td>
          <td>${r.desc}</td>
          <td style="font-family:var(--font-mono); font-weight:600; color:${r.type==='gəlir'?'var(--green)':'var(--red)'};">${r.type==='gəlir'?'+':'-'}${fmtMoney(r.amount)}</td>
          <td style="font-family:var(--font-mono);">${r.date}</td>
          <td><span class="badge ${r.status==='ödənilib'?'green':'orange'}">${r.status}</span></td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteRow('finance_payments','${r.id}')">Sil</button></td>
        </tr>`).join('') || `<tr><td colspan="7">${emptyState('💰','Əməliyyat yoxdur','')}</td></tr>`}
      </tbody>
    </table></div>
  </div>`;
};
function openFinanceForm() {
  openModal(`
    <div class="modal-header"><h3>Yeni Maliyyə Əməliyyatı</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="financeForm">
      <div class="field"><label>Layihə</label><input name="project"></div>
      <div class="field"><label>Təsvir</label><input required name="desc"></div>
      <div class="field-row">
        <div class="field"><label>Növ</label><select name="type"><option value="gəlir">Gəlir</option><option value="xərc">Xərc</option></select></div>
        <div class="field"><label>Məbləğ (₼)</label><input type="number" name="amount" required></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Tarix</label><input type="date" name="date" required></div>
        <div class="field"><label>Status</label><select name="status"><option>ödənilib</option><option>gözlənilir</option></select></div>
      </div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Əlavə et</button></div>
    </form>`);
  document.getElementById('financeForm').onsubmit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const rows = DB.get('finance_payments', []);
    rows.push({ id: DB.uid('fp'), project: fd.get('project')||'—', desc: fd.get('desc'), type: fd.get('type'), amount: Number(fd.get('amount')), date: fd.get('date'), status: fd.get('status') });
    DB.set('finance_payments', rows);
    logActivity((fd.get('type')==='gəlir'?'Gəlir':'Xərc') + ' qeydə alındı: ' + fd.get('desc'), '💰'); closeModal(); showToast('Əməliyyat əlavə olundu'); renderView('finance');
  };
}

/* ---------------------------------------------------------------- CASH FLOW */
MODULES.cashflow = () => {
  const rows = DB.get('finance_payments', []);
  const byMonth = {};
  rows.forEach(r => {
    const m = r.date.slice(0,7);
    if (!byMonth[m]) byMonth[m] = { income:0, expense:0 };
    byMonth[m][r.type==='gəlir'?'income':'expense'] += r.amount;
  });
  const months = Object.keys(byMonth).sort();
  const maxVal = Math.max(...months.flatMap(m => [byMonth[m].income, byMonth[m].expense]), 1);
  let running = 0;
  return `
  <div class="card">
    <div class="card-header"><h3>Cash Flow — Aylıq Gəlir/Xərc</h3></div>
    ${months.length ? `
    <div style="display:flex; align-items:flex-end; gap:22px; height:220px; padding:10px 6px;">
      ${months.map(m => `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:8px;">
          <div style="width:100%; display:flex; gap:4px; justify-content:center; height:170px; align-items:flex-end;">
            <div style="width:40%; border-radius:6px 6px 0 0; background:var(--green); height:${(byMonth[m].income/maxVal*100)}%;" title="Gəlir: ${fmtMoney(byMonth[m].income)}"></div>
            <div style="width:40%; border-radius:6px 6px 0 0; background:var(--red); height:${(byMonth[m].expense/maxVal*100)}%;" title="Xərc: ${fmtMoney(byMonth[m].expense)}"></div>
          </div>
          <div style="font-size:10.5px; color:var(--text-faint); font-family:var(--font-mono);">${m}</div>
        </div>
      `).join('')}
    </div>
    <div style="display:flex; gap:20px; margin-top:6px; font-size:12px; color:var(--text-dim);">
      <span><span style="display:inline-block; width:8px; height:8px; background:var(--green); border-radius:2px; margin-right:6px;"></span>Gəlir</span>
      <span><span style="display:inline-block; width:8px; height:8px; background:var(--red); border-radius:2px; margin-right:6px;"></span>Xərc</span>
    </div>
    <div class="table-wrap" style="margin-top:20px;"><table>
      <thead><tr><th>Ay</th><th>Gəlir</th><th>Xərc</th><th>Xalis</th><th>Yığılmış Balans</th></tr></thead>
      <tbody>
        ${months.map(m => {
          const net = byMonth[m].income - byMonth[m].expense;
          running += net;
          return `<tr>
            <td style="font-family:var(--font-mono);">${m}</td>
            <td style="font-family:var(--font-mono); color:var(--green);">${fmtMoney(byMonth[m].income)}</td>
            <td style="font-family:var(--font-mono); color:var(--red);">${fmtMoney(byMonth[m].expense)}</td>
            <td style="font-family:var(--font-mono); font-weight:600;">${fmtMoney(net)}</td>
            <td style="font-family:var(--font-mono); font-weight:600; color:var(--blue);">${fmtMoney(running)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
    ` : emptyState('📊','Maliyyə əməliyyatı yoxdur','Əvvəlcə Büdcə & Ödənişlər bölməsinə əməliyyat əlavə edin')}
  </div>`;
};

/* ---------------------------------------------------------------- DIGITAL TIMELINE */
MODULES.timeline = () => {
  const log = DB.get('activity_log', []).slice().sort((a,b) => new Date(b.ts) - new Date(a.ts));
  return `
  <div class="card">
    <div class="card-header">
      <div><h3>Rəqəmsal Zaman Xətti</h3><p class="card-header-sub">Layihədə baş verən hər əməliyyatın avtomatik qeydiyyatı</p></div>
    </div>
    <div class="field" style="max-width:360px; margin-bottom:16px;">
      <input type="text" id="timelineSearch" placeholder="Axtar (məs: HSE, BOQ, layihə adı...)" oninput="filterTimeline()">
    </div>
    <div id="timelineList" style="display:flex; flex-direction:column; gap:0;">
      ${renderTimelineItems(log)}
    </div>
  </div>`;
};
function renderTimelineItems(log) {
  if (!log.length) return emptyState('🕓','Hələ heç bir əməliyyat qeydə alınmayıb','');
  return log.map((a, idx) => `
    <div style="display:flex; gap:14px; padding:12px 0; ${idx < log.length-1 ? 'border-bottom:1px solid var(--border);' : ''}">
      <div style="width:32px; height:32px; border-radius:9px; background:var(--bg-2); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:14px;">${a.icon}</div>
      <div style="flex:1;">
        <div style="font-size:13px;">${a.text}</div>
        <div style="font-size:11px; color:var(--text-faint); font-family:var(--font-mono); margin-top:2px;">${new Date(a.ts).toLocaleString('az-AZ')}</div>
      </div>
    </div>
  `).join('');
}
function filterTimeline() {
  const q = document.getElementById('timelineSearch').value.toLowerCase();
  const log = DB.get('activity_log', []).slice().sort((a,b) => new Date(b.ts) - new Date(a.ts)).filter(a => a.text.toLowerCase().includes(q));
  document.getElementById('timelineList').innerHTML = renderTimelineItems(log);
}

/* ---------------------------------------------------------------- DEPARTMENT FEED */
const DEPARTMENTS = ['HSE','QA/QC','Texniki Ofis','Satınalma','Maliyyə','Anbar','Planlama','HR','Avadanlıq','Mexaniki','Elektrik','Mülki','Layihə İdarəetməsi'];
let activeDept = 'HSE';
MODULES['dept-feed'] = () => {
  const posts = DB.get('dept_feed', []).filter(p => p.dept === activeDept).slice().reverse();
  return `
  <div class="card">
    <div class="calc-tabs">
      ${DEPARTMENTS.map(d => `<div class="calc-tab ${activeDept===d?'active':''}" onclick="setDeptTab('${d}')">${d}</div>`).join('')}
    </div>
    <div class="field-row" style="align-items:flex-end; margin-bottom:16px;">
      <div class="field" style="margin-bottom:0;"><label>Yeni Elan (${activeDept})</label><input type="text" id="deptPostInput" placeholder="Elan mətni yazın..." onkeydown="if(event.key==='Enter') postDeptFeed()"></div>
      <button class="btn btn-primary" style="height:38px;" onclick="postDeptFeed()">Paylaş</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:10px;">
      ${posts.length ? posts.map(p => `
        <div style="background:var(--bg-2); border-radius:12px; padding:14px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <strong style="font-size:12.5px;">${p.author}</strong>
            <span style="font-size:11px; color:var(--text-faint); font-family:var(--font-mono);">${new Date(p.date).toLocaleString('az-AZ')}</span>
          </div>
          <div style="font-size:13px;">${p.text}</div>
        </div>
      `).join('') : emptyState('💬','Bu departamentdə elan yoxdur','')}
    </div>
  </div>`;
};
function setDeptTab(d) { activeDept = d; renderView('dept-feed'); }
function postDeptFeed() {
  const input = document.getElementById('deptPostInput');
  const text = input.value.trim();
  if (!text) return;
  const rows = DB.get('dept_feed', []);
  rows.push({ id: DB.uid('df'), dept: activeDept, author: 'Siz', text, date: new Date().toISOString() });
  DB.set('dept_feed', rows);
  logActivity(activeDept + ' departamentinə elan yazıldı', '💬');
  renderView('dept-feed');
}

/* ---------------------------------------------------------------- WORKFLOW ENGINE */
let wfTab = 'templates';
let wfDraftSteps = [];
MODULES['workflow-engine'] = () => `
  <div class="card">
    <div class="calc-tabs">
      <div class="calc-tab ${wfTab==='templates'?'active':''}" onclick="setWfTab('templates')">📐 Şablonlar</div>
      <div class="calc-tab ${wfTab==='instances'?'active':''}" onclick="setWfTab('instances')">▶️ Aktiv Proseslər</div>
    </div>
    ${wfTab === 'templates' ? renderWfTemplates() : renderWfInstances()}
  </div>
`;
function setWfTab(t) { wfTab = t; renderView('workflow-engine'); }

function renderWfTemplates() {
  const templates = DB.get('workflow_templates', []);
  return `
  <div class="card-header"><div><h3 style="font-size:14px;">Workflow Şablonları</h3><p class="card-header-sub">Hər şirkət öz addım ardıcıllığını qura bilər</p></div><button class="btn btn-primary btn-sm" onclick="openWfTemplateForm()">+ Yeni Şablon</button></div>
  <div style="display:flex; flex-direction:column; gap:14px;">
    ${templates.map(t => `
      <div class="card" style="background:var(--bg-2);">
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <strong style="font-family:var(--font-display);">${t.name}</strong>
          <div style="display:flex; gap:8px; align-items:center;">
            <span class="badge blue">${t.company}</span>
            <button class="btn btn-ghost btn-sm" onclick="deleteRow('workflow_templates','${t.id}')">Sil</button>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          ${t.steps.map((s, i) => `
            <span class="badge gray" style="font-family:var(--font-mono);">${i+1}. ${s.name} <span style="opacity:.6;">(${s.role})</span></span>
            ${i < t.steps.length-1 ? '<span style="color:var(--text-faint);">→</span>' : ''}
          `).join('')}
        </div>
      </div>
    `).join('') || emptyState('📐','Şablon yoxdur','')}
  </div>`;
}

function openWfTemplateForm() {
  wfDraftSteps = [];
  openModal(`
    <div class="modal-header"><h3>Yeni Workflow Şablonu</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <div class="field"><label>Şablon adı</label><input id="wtName" placeholder="Məs: İşçi Qəbulu"></div>
    <div class="field"><label>Şirkət</label><input id="wtCompany" placeholder="Bu şablonun sahibi olan şirkət"></div>
    <div class="field">
      <label>Addımlar (sürüklə-burax ilə sıralayın)</label>
      <div id="wtStepsContainer" style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;"></div>
      <div class="field-row">
        <input id="wtStepName" placeholder="Addım adı (məs: HSE Təlimi)">
        <input id="wtStepRole" placeholder="Məsul rol (məs: HSE)">
      </div>
      <button type="button" class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="addWfDraftStep()">+ Addım Əlavə Et</button>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button>
      <button type="button" class="btn btn-primary" onclick="saveWfTemplate()">Şablonu Yadda Saxla</button>
    </div>
  `);
  renderWfDraftSteps();
}
function addWfDraftStep() {
  const name = document.getElementById('wtStepName').value.trim();
  const role = document.getElementById('wtStepRole').value.trim();
  if (!name) { showToast('Addım adı daxil edin'); return; }
  wfDraftSteps.push({ id: DB.uid('st'), name, role: role || '—' });
  document.getElementById('wtStepName').value = '';
  document.getElementById('wtStepRole').value = '';
  renderWfDraftSteps();
}
function removeWfDraftStep(idx) { wfDraftSteps.splice(idx, 1); renderWfDraftSteps(); }
function renderWfDraftSteps() {
  const c = document.getElementById('wtStepsContainer');
  if (!c) return;
  c.innerHTML = wfDraftSteps.map((s, i) => `
    <div class="wf-step-row" draggable="true" data-idx="${i}"
         ondragstart="wfDragStart(event)" ondragover="wfDragOver(event)" ondrop="wfDrop(event)" ondragend="wfDragEnd(event)"
         style="display:flex; align-items:center; gap:10px; background:var(--bg-2); border:1px solid var(--border); border-radius:9px; padding:8px 12px; cursor:grab;">
      <span style="color:var(--text-faint); font-family:var(--font-mono); font-size:11px;">⠿ ${i+1}</span>
      <span style="flex:1; font-size:13px;">${s.name} <span style="color:var(--text-faint); font-size:11.5px;">(${s.role})</span></span>
      <button type="button" class="btn btn-ghost btn-sm" onclick="removeWfDraftStep(${i})">✕</button>
    </div>
  `).join('') || `<div style="font-size:12px; color:var(--text-faint);">Hələ addım yoxdur</div>`;
}
let wfDragIdx = null;
function wfDragStart(e) { wfDragIdx = Number(e.currentTarget.dataset.idx); e.currentTarget.style.opacity = '.4'; }
function wfDragOver(e) { e.preventDefault(); }
function wfDragEnd(e) { e.currentTarget.style.opacity = '1'; }
function wfDrop(e) {
  e.preventDefault();
  const targetIdx = Number(e.currentTarget.dataset.idx);
  if (wfDragIdx === null || wfDragIdx === targetIdx) return;
  const moved = wfDraftSteps.splice(wfDragIdx, 1)[0];
  wfDraftSteps.splice(targetIdx, 0, moved);
  wfDragIdx = null;
  renderWfDraftSteps();
}
function saveWfTemplate() {
  const name = document.getElementById('wtName').value.trim();
  const company = document.getElementById('wtCompany').value.trim();
  if (!name || !wfDraftSteps.length) { showToast('Ad və ən azı bir addım tələb olunur'); return; }
  const templates = DB.get('workflow_templates', []);
  templates.push({ id: DB.uid('wt'), name, company: company || 'Ümumi', steps: wfDraftSteps });
  DB.set('workflow_templates', templates);
  logActivity('Yeni workflow şablonu yaradıldı: ' + name, '📐');
  closeModal(); showToast('Şablon yadda saxlanıldı'); renderView('workflow-engine');
}

function renderWfInstances() {
  const instances = DB.get('workflow_instances', []);
  return `
  <div class="card-header"><div><h3 style="font-size:14px;">Aktiv Proseslər</h3><p class="card-header-sub">${instances.length} proses</p></div><button class="btn btn-primary btn-sm" onclick="openWfInstanceForm()">+ Yeni Proses Başlat</button></div>
  <div style="display:flex; flex-direction:column; gap:16px;">
    ${instances.map(inst => `
      <div class="card" style="background:var(--bg-2);">
        <div style="display:flex; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div>
            <strong>${inst.title}</strong>
            <div style="font-size:11.5px; color:var(--text-faint);">${inst.templateName} · ${inst.project || '—'}</div>
          </div>
          <span class="badge ${inst.status==='tamamlandı'?'green':inst.status==='dayandırılıb'?'red':'orange'}">${inst.status}</span>
        </div>
        <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; margin-bottom:12px;">
          ${inst.steps.map((s, i) => `
            <span class="badge ${i < inst.currentStep ? 'green' : i === inst.currentStep ? 'blue' : 'gray'}">${i+1}. ${s}</span>
            ${i < inst.steps.length-1 ? '<span style="color:var(--text-faint); font-size:11px;">→</span>' : ''}
          `).join('')}
        </div>
        ${inst.status === 'davam edir' ? `
          <div style="display:flex; gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="advanceWfInstance('${inst.id}')">✓ "${inst.steps[inst.currentStep]}" Tamamla</button>
            <button class="btn btn-outline btn-sm" onclick="stopWfInstance('${inst.id}')">Dayandır</button>
          </div>` : ''}
        <details style="margin-top:10px;">
          <summary style="font-size:11.5px; color:var(--text-faint); cursor:pointer;">Tarixçəni göstər (${inst.history.length})</summary>
          <div style="margin-top:8px; display:flex; flex-direction:column; gap:6px;">
            ${inst.history.map(h => `<div style="font-size:12px; color:var(--text-dim);">✓ <strong>${h.step}</strong> — ${h.action} (${h.by}, ${new Date(h.date).toLocaleDateString('az-AZ')})</div>`).join('')}
          </div>
        </details>
      </div>
    `).join('') || emptyState('▶️','Aktiv proses yoxdur','')}
  </div>`;
}
function openWfInstanceForm() {
  const templates = DB.get('workflow_templates', []);
  openModal(`
    <div class="modal-header"><h3>Yeni Proses Başlat</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button></div>
    <form id="wfInstanceForm">
      <div class="field"><label>Şablon</label>
        <select name="templateId" required>${templates.map(t => `<option value="${t.id}">${t.name} (${t.company})</option>`).join('')}</select>
      </div>
      <div class="field"><label>Başlıq</label><input required name="title" placeholder="Məs: Ad Soyad — Vəzifə"></div>
      <div class="field"><label>Layihə</label><input name="project"></div>
      <div class="modal-actions"><button type="button" class="btn btn-outline" onclick="closeModal()">Ləğv et</button><button type="submit" class="btn btn-primary">Başlat</button></div>
    </form>`);
  document.getElementById('wfInstanceForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const templates = DB.get('workflow_templates', []);
    const tmpl = templates.find(t => t.id === fd.get('templateId'));
    if (!tmpl) return;
    const instances = DB.get('workflow_instances', []);
    instances.push({
      id: DB.uid('wi'), templateId: tmpl.id, templateName: tmpl.name, title: fd.get('title'), project: fd.get('project'),
      steps: tmpl.steps.map(s => s.name), currentStep: 0, status: 'davam edir', history: [],
    });
    DB.set('workflow_instances', instances);
    logActivity('Yeni proses başladıldı: ' + fd.get('title') + ' (' + tmpl.name + ')', '▶️');
    closeModal(); showToast('Proses başladıldı'); renderView('workflow-engine');
  };
}
function advanceWfInstance(id) {
  const instances = DB.get('workflow_instances', []);
  const inst = instances.find(x => x.id === id);
  if (!inst) return;
  inst.history.push({ step: inst.steps[inst.currentStep], action: 'tamamlandı', by: 'Siz', date: new Date().toISOString() });
  inst.currentStep++;
  if (inst.currentStep >= inst.steps.length) { inst.status = 'tamamlandı'; }
  DB.set('workflow_instances', instances);
  logActivity(inst.title + ' → sonrakı addıma keçdi', '▶️');
  renderView('workflow-engine');
}
function stopWfInstance(id) {
  const instances = DB.get('workflow_instances', []);
  const inst = instances.find(x => x.id === id);
  if (inst) inst.status = 'dayandırılıb';
  DB.set('workflow_instances', instances);
  renderView('workflow-engine');
}

/* ---------------------------------------------------------------- SOON / PLACEHOLDER */
MODULES.soon = (key) => {
  const item = (typeof FLAT_NAV !== 'undefined' ? FLAT_NAV : []).find(i => i.key === key);
  const info = (typeof SOON_INFO !== 'undefined' ? SOON_INFO[key] : null) || {};
  const title = item ? item.label : 'Modul';
  return `
  <div class="card">
    <div style="display:flex; gap:18px; align-items:flex-start; flex-wrap:wrap;">
      <div class="kpi-icon" style="width:52px; height:52px; font-size:24px; background:rgba(255,122,26,.14); color:var(--orange); flex-shrink:0;">${info.icon || '🚧'}</div>
      <div style="flex:1; min-width:220px;">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:6px;">
          <h2 style="font-family:var(--font-display); font-size:19px;">${title}</h2>
          <span class="badge orange">Tezliklə</span>
          ${info.phase ? `<span class="badge gray">${info.phase}</span>` : ''}
        </div>
        <p style="color:var(--text-dim); font-size:13.5px; max-width:640px;">${info.desc || 'Bu modul IndustrCons OS-un növbəti fazasında hazırlanacaq. Struktur artıq planlaşdırılıb.'}</p>
      </div>
    </div>
    ${info.features ? `
    <div style="margin-top:22px; padding-top:18px; border-top:1px solid var(--border);">
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--text-faint); margin-bottom:12px;">Planlaşdırılan funksiyalar</div>
      <div class="grid grid-2">
        ${info.features.map(f => `
          <div style="display:flex; gap:10px; align-items:flex-start; font-size:13px; color:var(--text);">
            <span style="color:var(--blue); flex-shrink:0;">▸</span><span>${f}</span>
          </div>
        `).join('')}
      </div>
    </div>` : ''}
  </div>
`;
};

/* ---------------------------------------------------------------- SHARED ACTIONS */
function logActivity(text, icon) {
  const log = DB.get('activity_log', []);
  log.push({ id: DB.uid('ac'), text, icon: icon || '•', ts: new Date().toISOString() });
  DB.set('activity_log', log);
}
function deleteRow(key, id) {
  const rows = DB.get(key, []);
  DB.set(key, rows.filter(r => r.id !== id));
  showToast('Silindi');
  renderView(currentView);
}
function toggleTask(id) {
  const tasks = DB.get('tasks', []);
  const t = tasks.find(x => x.id === id);
  if (t) t.done = !t.done;
  DB.set('tasks', tasks);
  renderView('dashboard');
}
