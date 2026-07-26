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
    closeModal(); showToast('HSE qeydi əlavə olundu'); renderView('hse');
  };
}

/* ---------------------------------------------------------------- SOON / PLACEHOLDER */
MODULES.soon = (title, desc) => `
  <div class="card soon-card">
    <div class="glyph">🚧</div>
    <h2>${title}</h2>
    <p>${desc || 'Bu modul IndustrCons OS-un növbəti fazasında hazırlanacaq. Struktur artıq planlaşdırılıb.'}</p>
    <span class="badge orange" style="margin-top:6px;">Tezliklə</span>
  </div>
`;

/* ---------------------------------------------------------------- SHARED ACTIONS */
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
