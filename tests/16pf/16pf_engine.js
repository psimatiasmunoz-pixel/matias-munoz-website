// 16PF-5 Engine — Scoring, Display, Charts
const PER_PAGE = 20;
let currentPage = 0;
let answers = new Array(ITEMS.length).fill(null);
let shuffledIndices = [];
const cloudSessionId = window.PsychPersistence ? window.PsychPersistence.getSessionId('16pf') : null;

function init() {
  document.getElementById('pDate').valueAsDate = new Date();
  // Create shuffled presentation order (keep items mixed across factors)
  shuffledIndices = ITEMS.map((_, i) => i);
  // Pseudo-shuffle: interleave factors
  const byFactor = {};
  ITEMS.forEach((item, i) => {
    if (!byFactor[item[1]]) byFactor[item[1]] = [];
    byFactor[item[1]].push(i);
  });
  const factorArrays = Object.values(byFactor);
  const maxLen = Math.max(...factorArrays.map(a => a.length));
  shuffledIndices = [];
  for (let i = 0; i < maxLen; i++) {
    for (const arr of factorArrays) {
      if (i < arr.length) shuffledIndices.push(arr[i]);
    }
  }
}

function startTest() {
  const name = document.getElementById('pName').value.trim();
  if (!name) { alert('Ingrese el nombre del evaluado.'); return; }
  document.getElementById('stepPatient').classList.add('hidden');
  document.getElementById('stepQuestions').classList.remove('hidden');
  currentPage = 0;
  renderPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPage() {
  const list = document.getElementById('questionsList');
  const start = currentPage * PER_PAGE;
  const end = Math.min(start + PER_PAGE, shuffledIndices.length);
  const totalPages = Math.ceil(shuffledIndices.length / PER_PAGE);

  list.innerHTML = '';
  for (let p = start; p < end; p++) {
    const idx = shuffledIndices[p];
    const item = ITEMS[idx];
    const answered = answers[idx] !== null;
    const isB = item[1] === 'B';

    const div = document.createElement('div');
    div.className = 'q-card' + (answered ? ' answered' : '');
    div.innerHTML = `
      <div class="q-num">Pregunta ${p + 1} de ${shuffledIndices.length}</div>
      <div class="q-text">${item[0]}</div>
      <div class="q-options">
        <button class="q-opt${answers[idx]===2?' sel':''}" onclick="answer(${idx},2,this)">${isB ? 'a) ' : ''}${item[3]}</button>
        ${isB ? '' : `<button class="q-opt${answers[idx]===1?' sel':''}" onclick="answer(${idx},1,this)">?</button>`}
        <button class="q-opt${answers[idx]===0?' sel':''}" onclick="answer(${idx},0,this)">${isB ? 'b) ' : ''}${item[4]}</button>
      </div>
    `;
    list.appendChild(div);
  }

  // Update navigation
  document.getElementById('btnPrev').disabled = currentPage === 0;
  document.getElementById('btnNext').textContent = currentPage === totalPages - 1 ? '✓ Finalizar' : 'Siguiente →';
  document.getElementById('pageInfo').textContent = `Página ${currentPage + 1} de ${totalPages}`;
  updateProgress();
}

function answer(idx, value, btn) {
  const item = ITEMS[idx];
  // For B factor items, value is already correct (2=correct, 0=incorrect)
  // For other items with dir=-1, we reverse at scoring time
  answers[idx] = value;
  const card = btn.closest('.q-card');
  card.classList.add('answered');
  card.querySelectorAll('.q-opt').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  updateProgress();
}

function updateProgress() {
  const answered = answers.filter(a => a !== null).length;
  const pct = Math.round((answered / ITEMS.length) * 100);
  document.getElementById('progText').textContent = `Respondidas: ${answered} de ${ITEMS.length}`;
  document.getElementById('progPct').textContent = `${pct}%`;
  document.getElementById('progBar').style.width = `${pct}%`;
}

function nextPage() {
  const totalPages = Math.ceil(shuffledIndices.length / PER_PAGE);
  if (currentPage === totalPages - 1) {
    const answered = answers.filter(a => a !== null).length;
    if (answered < ITEMS.length) {
      const skip = ITEMS.length - answered;
      if (!confirm(`Quedan ${skip} preguntas sin responder. Los ítems no respondidos se puntuarán como "?" (1 punto). ¿Desea finalizar?`)) return;
    }
    finishTest();
  } else {
    currentPage++;
    renderPage();
    window.scrollTo({ top: document.getElementById('stepQuestions').offsetTop, behavior: 'smooth' });
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    renderPage();
    window.scrollTo({ top: document.getElementById('stepQuestions').offsetTop, behavior: 'smooth' });
  }
}

// ==================== SCORING ====================
function finishTest() {
  document.getElementById('stepQuestions').classList.add('hidden');
  document.getElementById('stepResults').classList.remove('hidden');

  const scores = calculateScores();
  const decatipos = calculateDecatipos(scores);
  const globalDims = calculateGlobalDimensions(decatipos);
  const validity = calculateValidity(scores);

  renderPatientReport();
  renderValidity(validity);
  renderProfile(decatipos);
  drawRadarChart(decatipos);
  renderGlobalDimensions(globalDims);
  renderInterpretation(decatipos);

  // Capturar HTML del informe ANTES de ocultarlo al evaluado
  let reportHtml = '';
  if (window.TestFinishGuard) {
    reportHtml = window.TestFinishGuard.seal('stepResults');
  }

  persist16PFResults(scores, decatipos, globalDims, validity, reportHtml);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function persist16PFResults(scores, decatipos, globalDims, validity, reportHtml) {
  if (!window.PsychPersistence) return;

  const patient = {
    name: document.getElementById('pName').value.trim(),
    age: document.getElementById('pAge').value,
    sex: document.getElementById('pSex').value,
    date: document.getElementById('pDate').value,
    education: document.getElementById('pEdu').value.trim(),
    evaluator: document.getElementById('pEval').value.trim(),
    motive: document.getElementById('pMot').value.trim()
  };

  const validitySummary = validity.MI.valid && validity.IN.valid && validity.AQ.valid ? 'perfil valido' : 'revisar validez';
  const summary = [
    `Validez general: ${validitySummary}`,
    `Dimension dominante: ${globalDims.slice().sort((a, b) => b.score - a.score)[0].name}`
  ].join(' | ');

  window.PsychPersistence.saveRecord({
    sessionId: cloudSessionId,
    testCode: '16pf',
    patient: patient,
    summary: summary,
    reportHtml: reportHtml || '',
    rawData: {
      answers: answers,
      shuffledIndices: shuffledIndices
    },
    resultData: {
      scores: scores,
      decatipos: decatipos,
      globalDimensions: globalDims,
      validity: validity
    }
  }).catch(function (error) {
    console.error('16PF persistence error:', error);
    window.PsychPersistence.toast('No se pudo guardar el 16PF en Supabase.', 'error');
  });
}

function calculateScores() {
  const scores = {};
  Object.keys(FACTORS).forEach(f => scores[f] = 0);
  scores['MI'] = 0;

  ITEMS.forEach((item, idx) => {
    const factor = item[1];
    const dir = item[2];
    let val = answers[idx] !== null ? answers[idx] : 1; // Unanswered = ?

    if (factor === 'B') {
      // For B: 2=correct → score 1, 0=incorrect → score 0
      scores[factor] += val === 2 ? 1 : 0;
    } else if (factor === 'MI') {
      scores[factor] += val === 2 ? 1 : 0;
    } else {
      // Apply direction
      if (dir === -1) val = 2 - val;
      scores[factor] += val;
    }
  });

  return scores;
}

function calculateDecatipos(scores) {
  const decatipos = {};
  Object.keys(FACTORS).forEach(f => {
    const pd = scores[f];
    const baremo = BAREMOS[f];
    let dec = 5; // default
    for (const [low, high, d] of baremo) {
      if (pd >= low && pd <= high) { dec = d; break; }
      if (pd < low) { dec = Math.max(1, d - 1); break; }
    }
    if (pd > baremo[baremo.length - 1][1]) dec = 10;
    decatipos[f] = Math.max(1, Math.min(10, dec));
  });
  return decatipos;
}

function calculateGlobalDimensions(dec) {
  // 5 Global dimensions derived from primary factors
  return [
    {
      name: 'Extraversión',
      score: Math.round((dec.A + dec.F + dec.H + (11 - dec.N) + (11 - dec.Q2)) / 5 * 10) / 10,
      desc: 'Tendencia a la sociabilidad, participación activa y búsqueda de estímulos sociales.',
      factors: 'A+, F+, H+, N−, Q2−'
    },
    {
      name: 'Ansiedad',
      score: Math.round(((11 - dec.C) + dec.L + dec.O + dec.Q4) / 4 * 10) / 10,
      desc: 'Nivel de tensión, aprensión, inseguridad e inquietud emocional.',
      factors: 'C−, L+, O+, Q4+'
    },
    {
      name: 'Dureza',
      score: Math.round(((11 - dec.A) + (11 - dec.I) + dec.M + (11 - dec.Q1)) / 4 * 10) / 10,
      desc: 'Tendencia a la objetividad, frialdad emocional y pensamiento concreto.',
      factors: 'A−, I−, M−, Q1−'
    },
    {
      name: 'Independencia',
      score: Math.round((dec.E + dec.H + dec.L + dec.Q1) / 4 * 10) / 10,
      desc: 'Tendencia a la autonomía, asertividad, pensamiento crítico y autosuficiencia.',
      factors: 'E+, H+, L+, Q1+'
    },
    {
      name: 'Autocontrol',
      score: Math.round((dec.G + (11 - dec.F) + dec.Q3 + (11 - dec.M)) / 4 * 10) / 10,
      desc: 'Capacidad de contención, disciplina, cumplimiento de normas y control de impulsos.',
      factors: 'G+, F−, Q3+, M−'
    }
  ];
}

function calculateValidity(scores) {
  const mi = scores['MI'] || 0;
  const miMax = ITEMS.filter(i => i[1] === 'MI').length;
  // IN: count extreme answers patterns (simplified)
  let inCount = 0;
  ITEMS.forEach((item, idx) => {
    if (item[1] !== 'MI' && item[1] !== 'B') {
      if (answers[idx] === null) inCount++;
    }
  });
  // AQ: count all 'A' responses
  let aqCount = answers.filter(a => a === 2).length;

  return {
    MI: { score: mi, max: miMax, valid: mi <= Math.ceil(miMax * 0.6) },
    IN: { score: inCount, max: 15, valid: inCount <= 5 },
    AQ: { score: aqCount, pct: Math.round((aqCount / ITEMS.length) * 100), valid: aqCount / ITEMS.length <= 0.75 }
  };
}

// ==================== RENDERING ====================
function renderPatientReport() {
  const fields = [
    ['Nombre', document.getElementById('pName').value],
    ['Edad', document.getElementById('pAge').value + ' años'],
    ['Sexo', document.getElementById('pSex').value],
    ['Fecha', document.getElementById('pDate').value],
    ['Escolaridad', document.getElementById('pEdu').value || '—'],
    ['Evaluador', document.getElementById('pEval').value || '—'],
    ['Motivo', document.getElementById('pMot').value || '—'],
  ];
  document.getElementById('patientReport').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;padding:14px;background:var(--bg4);border-radius:var(--r);margin-bottom:20px;font-size:13px">
      ${fields.map(f => `<div><span style="color:var(--tx2)">${f[0]}:</span> <strong>${f[1]||'—'}</strong></div>`).join('')}
    </div>`;
}

function renderValidity(v) {
  document.getElementById('validitySection').innerHTML = `
    <h3 style="font-size:1.05em;font-weight:700;color:var(--ac2);margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.06)">⚙️ Escalas de Validez</h3>
    <div class="validity-item">
      <div class="validity-dot" style="background:${v.MI.valid?'var(--gn)':'var(--rd)'}"></div>
      <span class="validity-text"><strong>MI (Manipulación de Imagen):</strong> Evalúa deseabilidad social.</span>
      <span class="validity-val">${v.MI.score}/${v.MI.max}</span>
      <span style="font-size:12px;color:${v.MI.valid?'var(--gn)':'var(--rd)'}">${v.MI.valid?'✓ Válido':'⚠ Alto'}</span>
    </div>
    <div class="validity-item">
      <div class="validity-dot" style="background:${v.IN.valid?'var(--gn)':'var(--rd)'}"></div>
      <span class="validity-text"><strong>IN (Infrecuencia):</strong> Respuestas omitidas o inusuales.</span>
      <span class="validity-val">${v.IN.score}</span>
      <span style="font-size:12px;color:${v.IN.valid?'var(--gn)':'var(--rd)'}">${v.IN.valid?'✓ Válido':'⚠ Alto'}</span>
    </div>
    <div class="validity-item">
      <div class="validity-dot" style="background:${v.AQ.valid?'var(--gn)':'var(--rd)'}"></div>
      <span class="validity-text"><strong>AQ (Aquiescencia):</strong> Tendencia a responder afirmativamente.</span>
      <span class="validity-val">${v.AQ.pct}%</span>
      <span style="font-size:12px;color:${v.AQ.valid?'var(--gn)':'var(--rd)'}">${v.AQ.valid?'✓ Válido':'⚠ Alto'}</span>
    </div>`;
}

function renderProfile(dec) {
  const container = document.getElementById('profileChart');
  const factors = Object.keys(FACTORS).filter(f => f !== 'B'); // Exclude B from profile chart
  const colors = ['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#6366f1','#8b5cf6','#a855f7','#ec4899',
                   '#f43f5e','#06b6d4','#10b981','#84cc16','#f59e0b','#7c3aed'];

  let html = '';
  // Add B (Razonamiento) separately
  const allFactors = Object.keys(FACTORS);
  allFactors.forEach((f, i) => {
    const d = dec[f];
    const info = FACTORS[f];
    const pct = (d / 10) * 100;
    const color = colors[i % colors.length];
    const zone = d <= 3 ? 'Bajo' : d <= 7 ? 'Medio' : 'Alto';

    html += `<div class="factor-row">
      <div class="factor-label" title="${info.name}">${info.code} — ${info.name}</div>
      <div class="factor-bar-wrap">
        <div class="factor-bar" style="width:${pct}%;background:${color}"></div>
      </div>
      <div class="factor-val" style="color:${color}">${d}</div>
      <span style="font-size:10px;color:var(--tx3);min-width:36px">${zone}</span>
    </div>
    <div class="factor-poles"><span>${info.low}</span><span>${info.high}</span></div>`;
  });

  container.innerHTML = html;
}

function drawRadarChart(dec) {
  const canvas = document.getElementById('radarCanvas');
  const ctx = canvas.getContext('2d');
  const factors = Object.keys(FACTORS);
  const n = factors.length;
  const cx = 250, cy = 250, maxR = 180;

  ctx.clearRect(0, 0, 500, 500);

  // Background circles
  for (let i = 1; i <= 5; i++) {
    const r = (i / 5) * maxR;
    ctx.beginPath();
    for (let j = 0; j <= n; j++) {
      const angle = (Math.PI * 2 * j / n) - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Labels for scale
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter';
    ctx.fillText(String(i * 2), cx + 4, cy - r + 12);
  }

  // Axes
  factors.forEach((f, i) => {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    const x = cx + maxR * Math.cos(angle);
    const y = cy + maxR * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.stroke();

    // Factor label
    const lx = cx + (maxR + 20) * Math.cos(angle);
    const ly = cy + (maxR + 20) * Math.sin(angle);
    ctx.fillStyle = '#818cf8';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(f, lx, ly);
  });

  // Data polygon
  ctx.beginPath();
  factors.forEach((f, i) => {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    const r = (dec[f] / 10) * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
  ctx.fill();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Data points
  factors.forEach((f, i) => {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    const r = (dec[f] / 10) * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#818cf8';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function renderGlobalDimensions(dims) {
  const colors = ['#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b', '#22c55e'];
  document.getElementById('globalDims').innerHTML = dims.map((d, i) => {
    const c = colors[i];
    const level = d.score <= 3.5 ? 'Bajo' : d.score <= 6.5 ? 'Medio' : 'Alto';
    return `<div class="dim-card">
      <div class="dim-score" style="background:${c}22;color:${c};border:2px solid ${c}44">${d.score.toFixed(1)}</div>
      <div class="dim-info">
        <div class="dim-name">${d.name} <span style="font-size:12px;color:var(--tx3)">(${level})</span></div>
        <div class="dim-desc">${d.desc}</div>
        <div style="font-size:11px;color:var(--tx3);margin-top:2px">Factores: ${d.factors}</div>
      </div>
    </div>`;
  }).join('');
}

function renderInterpretation(dec) {
  const container = document.getElementById('interpSection');
  let html = '';

  Object.keys(FACTORS).forEach(f => {
    const d = dec[f];
    const info = FACTORS[f];
    let level, desc, color;

    if (d <= 3) {
      level = 'Bajo';
      color = '#3b82f6';
      desc = `El/la evaluado/a se sitúa en el polo bajo del factor ${info.code} (${info.name}), con un decatipo de ${d}. Esto sugiere una tendencia hacia características como: <strong>${info.low}</strong>. `;
      desc += getInterpretationDetail(f, 'low');
    } else if (d <= 7) {
      level = 'Medio';
      color = '#22c55e';
      desc = `El/la evaluado/a obtiene un decatipo de ${d} en el factor ${info.code} (${info.name}), ubicándose en el rango medio. Presenta un equilibrio entre ambos polos del factor, pudiendo adaptarse tanto a situaciones que requieran "${info.low.toLowerCase()}" como a aquellas que demanden "${info.high.toLowerCase()}".`;
    } else {
      level = 'Alto';
      color = '#f59e0b';
      desc = `El/la evaluado/a se sitúa en el polo alto del factor ${info.code} (${info.name}), con un decatipo de ${d}. Esto sugiere una tendencia hacia características como: <strong>${info.high}</strong>. `;
      desc += getInterpretationDetail(f, 'high');
    }

    html += `<div class="interp-block" style="border-left-color:${color}">
      <h4>${info.code} — ${info.name} <span style="font-weight:400;color:${color}">(Decatipo: ${d} — ${level})</span></h4>
      <p>${desc}</p>
    </div>`;
  });

  html += `<div style="padding:14px;background:rgba(99,102,241,.08);border-radius:var(--r);margin-top:16px;font-size:13px;color:var(--tx2);line-height:1.6">
    <strong>📌 Nota profesional:</strong> Este informe es orientativo y debe integrarse con la entrevista clínica, la observación conductual y otras pruebas del protocolo de evaluación. 
    Los decatipos entre 4 y 7 se consideran dentro del rango normativo. Puntuaciones extremas (1-3 o 8-10) merecen especial atención interpretativa.
    Baremos de referencia: Adaptación hispana (España) con ajuste poblacional chileno.
  </div>`;

  container.innerHTML = html;
}

function getInterpretationDetail(factor, pole) {
  const details = {
    A: { low: 'Tiende a ser independiente en sus relaciones, prefiere el trabajo individual y puede ser percibida como distante o poco expresiva emocionalmente.',
         high: 'Se muestra sociable, expresiva y orientada hacia los demás. Disfruta del contacto humano y tiende a establecer vínculos afectivos con facilidad.' },
    B: { low: 'Puede presentar dificultades en el procesamiento de información abstracta o en la resolución de problemas complejos. Se recomienda considerar factores contextuales (motivación, fatiga, nivel educativo).',
         high: 'Demuestra buena capacidad de razonamiento abstracto, agilidad mental y facilidad para comprender conceptos complejos.' },
    C: { low: 'Puede experimentar fluctuaciones emocionales, dificultad para manejar el estrés y tendencia a sentirse abrumado/a ante las demandas del entorno.',
         high: 'Muestra estabilidad emocional, madurez y buena capacidad para enfrentar las dificultades cotidianas manteniendo el equilibrio.' },
    E: { low: 'Tiende a ser cooperativa, evita la confrontación y se adapta fácilmente a las decisiones del grupo o de figuras de autoridad.',
         high: 'Se muestra asertiva, competitiva y con tendencia a tomar el liderazgo. Puede ser percibida como dominante o autoritaria en algunos contextos.' },
    F: { low: 'Se presenta como una persona seria, prudente y reflexiva. Puede ser percibida como contenida o poco expresiva en su entusiasmo.',
         high: 'Se muestra animosa, espontánea y entusiasta. Disfruta de la interacción social dinámica y puede ser percibida como impulsiva.' },
    G: { low: 'Muestra flexibilidad con las normas, puede ser inconformista y cuestionar las reglas establecidas. Tendencia a la indulgencia consigo misma.',
         high: 'Se guía por un fuerte sentido del deber, es responsable, formal y atenta a las normas y expectativas sociales.' },
    H: { low: 'Presenta inhibición social, timidez y precaución ante situaciones nuevas o que impliquen exposición. Puede limitar su participación social.',
         high: 'Se muestra segura en situaciones sociales, emprendedora y dispuesta a asumir riesgos interpersonales.' },
    I: { low: 'Se orienta por criterios objetivos y prácticos. Puede ser percibida como poco sensible o utilitaria en sus juicios.',
         high: 'Muestra alta sensibilidad emocional, apreciación estética y tendencia a dejarse guiar por sentimientos e intuiciones.' },
    L: { low: 'Es confiada, adaptable y tiende a aceptar la buena voluntad de los demás sin cuestionarla excesivamente.',
         high: 'Mantiene una actitud vigilante y escéptica ante las intenciones ajenas. Puede ser desconfiada y dificultarse el perdón.' },
    M: { low: 'Se mantiene anclada en lo concreto y práctico, con atención a los detalles del entorno inmediato.',
         high: 'Posee una imaginación activa, tendencia al ensimismamiento y orientación hacia ideas abstractas o creativas.' },
    N: { low: 'Se muestra abierta, genuina y espontánea en su comunicación, sin calcular excesivamente el impacto de sus palabras.',
         high: 'Es reservada, discreta y calculadora en sus interacciones sociales. Prefiere mantener su mundo interno en privado.' },
    O: { low: 'Se muestra segura, despreocupada y con buena autoestima. Raramente experimenta sentimientos de culpa o inadecuación.',
         high: 'Experimenta preocupación, inseguridad y tendencia a la autoculpabilización. Puede dudar de sus capacidades con frecuencia.' },
    Q1:{ low: 'Valora la tradición, la estabilidad y los métodos conocidos. Puede resistirse a los cambios o innovaciones.',
         high: 'Busca activamente la novedad, cuestiona las convenciones y se adapta con facilidad a nuevas situaciones y perspectivas.' },
    Q2:{ low: 'Se siente más cómoda trabajando y decidiendo en grupo. Busca el apoyo y la aprobación social para sus acciones.',
         high: 'Prefiere funcionar de manera independiente, confía en su propio juicio y no necesita la aprobación del grupo.' },
    Q3:{ low: 'Es flexible con sus estándares, tolerante con el desorden y puede dejar tareas incompletas.',
         high: 'Muestra alto nivel de autoexigencia, organización y disciplina. Puede ser perfeccionista y rígida en sus estándares.' },
    Q4:{ low: 'Se presenta relajada, tranquila y con buena capacidad para manejar la frustración y la espera.',
         high: 'Experimenta tensión interna, impaciencia e inquietud. Puede acumular frustración y tener dificultad para relajarse.' }
  };
  return details[factor]?.[pole] || '';
}

// Init on load
init();
