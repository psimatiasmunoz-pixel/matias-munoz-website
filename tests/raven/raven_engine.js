// Raven Escala General Engine — Scoring, Display, Persistence
let currentIndex = 0;
let answers = {};
let startedAt = null;
let timerInterval = null;
let elapsedSeconds = 0;
const cloudSessionId = window.PsychPersistence ? window.PsychPersistence.getSessionId('raven') : null;

function init() {
  document.getElementById('pDate').valueAsDate = new Date();
  answers = {};
  ITEMS.forEach(item => answers[item.key] = null);
}

function startTest() {
  const name = document.getElementById('pName').value.trim();
  const age = document.getElementById('pAge').value;
  if (!name || !age) {
    alert('Por favor complete el nombre y la edad del evaluado.');
    return;
  }
  document.getElementById('stepPatient').classList.add('hidden');
  document.getElementById('stepApplication').classList.remove('hidden');
  startedAt = Date.now();
  startTimer();
  renderItem();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    document.getElementById('timerText').textContent = formatTime(elapsedSeconds);
  }, 1000);
}

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':');
}

function renderItem() {
  const item = ITEMS[currentIndex];
  document.getElementById('itemKey').textContent = item.key;
  document.getElementById('seriesInfo').textContent = `Serie ${item.series} · Ítem ${item.itemNumber} de 12`;
  document.getElementById('reactivoInfo').textContent = `Reactivo ${currentIndex + 1} de ${ITEMS.length}`;
  
  const img = document.getElementById('itemImage');
  img.src = item.imagePath;
  img.alt = item.imageAlt;
  
  const optionsGrid = document.getElementById('optionsGrid');
  optionsGrid.innerHTML = '';
  item.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'q-opt' + (answers[item.key] === opt ? ' sel' : '');
    btn.textContent = opt;
    btn.onclick = () => selectOption(item.key, opt);
    optionsGrid.appendChild(btn);
  });

  updateProgress();
  document.getElementById('btnPrev').disabled = currentIndex === 0;
  document.getElementById('btnNext').textContent = currentIndex === ITEMS.length - 1 ? '✓ Finalizar' : 'Siguiente →';
  
  // Quick jump panel update
  renderQuickPanel();
}

function selectOption(key, val) {
  answers[key] = val;
  const itemAtClick = currentIndex;
  
  // Visual feedback
  const btns = document.querySelectorAll('#optionsGrid .q-opt');
  btns.forEach(b => {
    if (parseInt(b.textContent) === val) b.classList.add('sel');
    else b.classList.remove('sel');
  });

  // Auto-advance
  if (currentIndex < ITEMS.length - 1) {
    setTimeout(() => {
      if (currentIndex === itemAtClick) nextPage();
    }, 250);
  }
}

function nextPage() {
  if (currentIndex < ITEMS.length - 1) {
    currentIndex++;
    renderItem();
  } else {
    finishTest();
  }
}

function prevPage() {
  if (currentIndex > 0) {
    currentIndex--;
    renderItem();
  }
}

function updateProgress() {
  const answered = Object.values(answers).filter(a => a !== null).length;
  const pct = Math.round((answered / ITEMS.length) * 100);
  document.getElementById('progText').textContent = `Respondidas: ${answered} de ${ITEMS.length}`;
  document.getElementById('progPct').textContent = `${pct}%`;
  document.getElementById('progBar').style.width = `${pct}%`;
}

function renderQuickPanel() {
  const panel = document.getElementById('quickPanel');
  if (!panel) return;
  panel.innerHTML = '';
  ITEMS.forEach((item, idx) => {
    const btn = document.createElement('button');
    const isCurrent = idx === currentIndex;
    const isAnswered = answers[item.key] !== null;
    
    btn.className = 'btn-tiny';
    if (isCurrent) btn.classList.add('current');
    else if (isAnswered) btn.classList.add('answered');
    
    btn.textContent = item.key;
    btn.onclick = () => { currentIndex = idx; renderItem(); };
    panel.appendChild(btn);
  });
}

function finishTest() {
  const answered = Object.values(answers).filter(a => a !== null).length;
  if (answered < ITEMS.length) {
    if (!confirm(`Quedan ${ITEMS.length - answered} preguntas sin responder. ¿Desea finalizar de todos modos?`)) return;
  }
  
  clearInterval(timerInterval);
  document.getElementById('stepApplication').classList.add('hidden');
  document.getElementById('stepResults').classList.remove('hidden');
  
  const results = calculateResults();
  renderResults(results);
  persistRavenResults(results);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function calculateResults() {
  const seriesScores = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  ITEMS.forEach(item => {
    if (answers[item.key] === CORRECT_ANSWERS[item.key]) {
      seriesScores[item.series]++;
    }
  });

  const directScore = seriesScores.A + seriesScores.B + seriesScores.C + seriesScores.D + seriesScores.E;
  const age = parseInt(document.getElementById('pAge').value);
  const percentile = PERCENTILE_BY_AGE[age]?.[directScore] || null;
  
  const diagnosis = DIAGNOSTIC_BANDS.find(b => percentile !== null && percentile >= b.minPercentile && percentile <= b.maxPercentile) || null;
  
  const expected = EXPECTED_DISTRIBUTION.find(r => r.total === directScore) || null;
  const discrepancies = expected ? {
    A: seriesScores.A - expected.A,
    B: seriesScores.B - expected.B,
    C: seriesScores.C - expected.C,
    D: seriesScores.D - expected.D,
    E: seriesScores.E - expected.E
  } : null;
  
  let sumAbs = null;
  if (discrepancies) {
    sumAbs = Math.abs(discrepancies.A) + Math.abs(discrepancies.B) + Math.abs(discrepancies.C) + Math.abs(discrepancies.D) + Math.abs(discrepancies.E);
  }

  return {
    seriesScores,
    directScore,
    percentile,
    diagnosis,
    expected,
    discrepancies,
    sumAbs,
    isValid: sumAbs !== null ? sumAbs <= 3 : null,
    time: formatTime(elapsedSeconds)
  };
}

function renderResults(r) {
  // Patient info
  const fields = [
    ['Nombre', document.getElementById('pName').value],
    ['Edad', document.getElementById('pAge').value + ' años'],
    ['Cargo', document.getElementById('pCargo').value || '—'],
    ['Fecha', document.getElementById('pDate').value],
    ['Tiempo', r.time]
  ];
  document.getElementById('patientReport').innerHTML = `
    <div class="info-grid">
      ${fields.map(f => `<div><span class="label">${f[0]}:</span> <strong>${f[1]}</strong></div>`).join('')}
    </div>`;

  // Stats
  document.getElementById('statDirect').textContent = r.directScore;
  document.getElementById('statPercentile').textContent = r.percentile || '—';
  
  // Table
  const tbody = document.getElementById('seriesTableBody');
  tbody.innerHTML = '';
  SERIES.forEach(s => {
    const delta = r.discrepancies ? r.discrepancies[s] : null;
    const deltaClass = delta === 0 ? '' : (delta > 0 ? 'pos' : 'neg');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s}</td>
      <td>${r.seriesScores[s]}</td>
      <td>${r.expected ? r.expected[s] : '—'}</td>
      <td class="${deltaClass}">${delta === null ? '—' : (delta > 0 ? '+' + delta : delta)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Diagnosis
  document.getElementById('diagLabel').textContent = r.diagnosis ? `${r.diagnosis.code} · ${r.diagnosis.label}` : 'No disponible';
  document.getElementById('diagDetail').textContent = r.percentile !== null ? `Percentil ${r.percentile} para edad ${document.getElementById('pAge').value}` : 'Datos insuficientes';
  
  // Discrepancy Note
  const discWrap = document.getElementById('discrepancyNote');
  if (r.sumAbs !== null) {
    discWrap.className = 'note-box ' + (r.isValid ? 'ok' : 'warn');
    discWrap.innerHTML = `<strong>Discrepancia Total: ${r.sumAbs}</strong><br>${r.isValid ? 'Distribución consistente.' : 'La distribución presenta discrepancias relevantes (>3).'}`;
  } else {
    discWrap.className = 'note-box';
    discWrap.textContent = 'No hay pauta esperada para este puntaje.';
  }
}

function persistRavenResults(results) {
  if (!window.PsychPersistence) return;

  const patient = {
    name: document.getElementById('pName').value.trim(),
    age: document.getElementById('pAge').value,
    cargo: document.getElementById('pCargo').value.trim(),
    date: document.getElementById('pDate').value,
    observations: document.getElementById('pObs').value.trim()
  };

  const summary = [
    `Puntaje: ${results.directScore}`,
    `Percentil: ${results.percentile || '—'}`,
    `Rango: ${results.diagnosis ? results.diagnosis.code : '—'}`,
    `Validez: ${results.isValid ? 'Consonante' : 'Discrepante'}`
  ].join(' | ');

  window.PsychPersistence.saveRecord({
    sessionId: cloudSessionId,
    testCode: 'raven',
    patient: patient,
    summary: summary,
    rawData: {
      answers: answers,
      elapsedSeconds: elapsedSeconds
    },
    resultData: results
  }).catch(err => {
    console.error('Raven persistence error:', err);
    window.PsychPersistence.toast('Error al guardar en Supabase.', 'error');
  });
}

// Global initialization
document.addEventListener('DOMContentLoaded', init);
