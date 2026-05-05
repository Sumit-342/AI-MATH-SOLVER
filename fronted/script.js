/* ============================================================
   AXIOM — AI Math Solver · script.js  v2
   Refactored: cached DOM, reusable functions, cleaner structure
============================================================ */
'use strict';

/* ══════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════ */
const MOCK_SOLUTIONS = {
  default: {
    type: 'equation', topic: 'Algebra', status: 'Solved',
    confidence: 94, method: 'SymPy', difficulty: 'Medium',
    roots: '2 real', time: '2.34s',
    tip: 'When D > 0, try factoring first — it\'s faster than the full quadratic formula for simple integer roots.',
    followups: [
      { label: 'Why conjugate pairs?',   prompt: 'Why do complex roots always come in conjugate pairs?' },
      { label: 'Try complex roots',      prompt: 'Solve x² + 4x + 13 = 0 which gives complex roots' },
      { label: 'Discriminant geometry',  prompt: 'What is the geometric meaning of the discriminant?' },
    ],
    steps: [
      { label: 'Identify coefficients',    desc: 'Match with standard form ax² + bx + c = 0', eq: 'a = 1 · b = −5 · c = 6', note: null, state: 'done' },
      { label: 'Calculate discriminant',   desc: 'D = b² − 4ac determines the nature of roots', eq: 'D = 25 − 24 = <span style="color:var(--green);font-weight:500">1</span>', note: 'D > 0 → two distinct real roots', state: 'done' },
      { label: 'Apply quadratic formula',  desc: null, eq: 'x = (5 ± √1) / 2 = (5 ± 1) / 2', note: null, state: 'done' },
      { label: 'Compute both roots',       desc: 'Evaluate the plus and minus cases separately', eq: 'x₁ = (5+1)/2 = 3 · x₂ = (5−1)/2 = 2', note: null, state: 'active' },
    ],
    answer: { verified: true, values: [{ eq: 'x = 2', sub: '4 − 10 + 6 = 0 ✓' }, { eq: 'x = 3', sub: '9 − 15 + 6 = 0 ✓' }] },
    graph: {
      label: 'Parabola', eq: 'y = x²−5x+6',
      svg: `<svg viewBox="0 0 214 128" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;padding:4px 0">
        <line x1="12" y1="90" x2="202" y2="90" stroke="#1a1c2e" stroke-width="1"/>
        <line x1="107" y1="8" x2="107" y2="108" stroke="#1a1c2e" stroke-width="1"/>
        <text x="196" y="99" fill="#22263a" font-size="7.5" font-family="JetBrains Mono,monospace">x</text>
        <text x="110" y="14" fill="#22263a" font-size="7.5" font-family="JetBrains Mono,monospace">y</text>
        <text x="67"  y="102" fill="#22263a" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">1</text>
        <text x="87"  y="102" fill="#22263a" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">2</text>
        <text x="107" y="102" fill="#22263a" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">3</text>
        <text x="127" y="102" fill="#22263a" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">4</text>
        <text x="147" y="102" fill="#22263a" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">5</text>
        <path d="M28,84 C44,98 62,108 87,90 C97,84 101,87 107,90 C113,93 117,88 127,90 C152,82 168,64 190,38" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round"/>
        <circle cx="87"  cy="90"   r="4" fill="#6366f1" stroke="#0b0c16" stroke-width="1.5"/>
        <circle cx="127" cy="90"   r="4" fill="#818cf8" stroke="#0b0c16" stroke-width="1.5"/>
        <circle cx="107" cy="83.5" r="3" fill="#34d399" stroke="#0b0c16" stroke-width="1.2"/>
        <text x="87"  y="116" fill="#6366f1" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono,monospace">x=2</text>
        <text x="127" y="116" fill="#818cf8" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono,monospace">x=3</text>
        <text x="119" y="81"  fill="#34d399" font-size="7"   font-family="JetBrains Mono,monospace">vertex</text>
      </svg>`,
    },
  },
  complex: {
    type: 'equation', topic: 'Algebra', status: 'Solved',
    confidence: 88, method: 'SymPy', difficulty: 'Hard',
    roots: '2 complex', time: '3.12s',
    tip: 'When D < 0, the parabola never touches the x-axis. The roots are always complex conjugate pairs.',
    followups: [
      { label: 'What is i?',            prompt: 'Explain what the imaginary unit i means geometrically' },
      { label: 'Plot on Argand diagram',prompt: 'Show me how to plot complex roots on an Argand diagram' },
      { label: 'Back to real roots',    prompt: 'Solve x² - 5x + 6 = 0 step by step' },
    ],
    steps: [
      { label: 'Identify coefficients',  desc: 'Match with standard form ax² + bx + c = 0', eq: 'a = 1 · b = 4 · c = 13', note: null, state: 'done' },
      { label: 'Calculate discriminant', desc: 'D = b² − 4ac', eq: 'D = 16 − 52 = <span style="color:var(--red);font-weight:500">−36</span>', note: 'D < 0 → no real roots → complex roots', state: 'done' },
      { label: 'Apply quadratic formula',desc: null, eq: 'x = (−4 ± √(−36)) / 2', note: null, state: 'done' },
      { label: 'Simplify the radical',   desc: '√(−36) = 6i (since i = √−1)', eq: 'x = (−4 ± 6i) / 2 = −2 ± 3i', note: null, state: 'active' },
    ],
    answer: { verified: true, values: [{ eq: 'x = −2 + 3i', sub: 'conjugate root' }, { eq: 'x = −2 − 3i', sub: 'conjugate root' }] },
    graph: {
      label: 'Parabola · no x-intercepts', eq: 'y = x²+4x+13',
      svg: `<svg viewBox="0 0 214 128" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;padding:4px 0">
        <line x1="12" y1="100" x2="202" y2="100" stroke="#1a1c2e" stroke-width="1"/>
        <line x1="107" y1="8" x2="107" y2="112" stroke="#1a1c2e" stroke-width="1"/>
        <text x="196" y="109" fill="#22263a" font-size="7.5" font-family="JetBrains Mono,monospace">x</text>
        <text x="110" y="14"  fill="#22263a" font-size="7.5" font-family="JetBrains Mono,monospace">y</text>
        <path d="M30,100 C50,100 70,96 87,78 C97,65 102,52 107,46 C112,52 117,65 127,78 C144,96 164,100 184,100" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round"/>
        <circle cx="107" cy="46" r="3.5" fill="#6366f1" stroke="#0b0c16" stroke-width="1.5"/>
        <text x="118" y="46" fill="#6366f1" font-size="7.5" font-family="JetBrains Mono,monospace">vertex (−2, 9)</text>
        <line x1="20" y1="100" x2="194" y2="100" stroke="#f87171" stroke-width="1" stroke-dasharray="3,3" opacity=".35"/>
        <text x="107" y="120" fill="#f87171" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono,monospace">no x-intercepts</text>
      </svg>`,
    },
  },
  word: {
    type: 'word', topic: 'Word Problem', status: 'Solved',
    confidence: 82, method: 'Gemini → SymPy', difficulty: 'Easy',
    roots: '2 real', time: '5.21s',
    tip: 'For sum/product word problems, substitution always reduces them to a single quadratic.',
    followups: [
      { label: 'Harder word problem', prompt: 'Give me a harder word problem involving quadratics' },
      { label: 'What is substitution?',prompt: 'Explain the substitution method in simple terms' },
    ],
    steps: [
      { label: 'Extract equations', desc: 'Gemini converted the word problem to math', eq: 'x + y = 10 and x·y = 21', note: null, state: 'done' },
      { label: 'Substitute',        desc: 'Express y in terms of x: y = 10 − x', eq: 'x(10 − x) = 21 → x² − 10x + 21 = 0', note: null, state: 'done' },
      { label: 'Factor',            desc: null, eq: '(x − 3)(x − 7) = 0', note: null, state: 'active' },
    ],
    answer: { verified: true, values: [{ eq: '3 and 7', sub: '3+7=10 ✓  3×7=21 ✓' }] },
    graph: {
      label: 'Parabola', eq: 'y = x²−10x+21',
      svg: `<svg viewBox="0 0 214 128" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;padding:4px 0">
        <line x1="12" y1="90" x2="202" y2="90" stroke="#1a1c2e" stroke-width="1"/>
        <line x1="47" y1="8"  x2="47"  y2="108" stroke="#1a1c2e" stroke-width="1"/>
        <text x="196" y="99" fill="#22263a" font-size="7.5" font-family="JetBrains Mono,monospace">x</text>
        <text x="50"  y="14" fill="#22263a" font-size="7.5" font-family="JetBrains Mono,monospace">y</text>
        <text x="77"  y="102" fill="#22263a" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">3</text>
        <text x="107" y="102" fill="#22263a" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">5</text>
        <text x="137" y="102" fill="#22263a" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">7</text>
        <path d="M20,64 C40,82 58,92 77,90 C87,89 97,88 107,84 C117,88 127,89 137,90 C156,92 174,82 194,64" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round"/>
        <circle cx="77"  cy="90" r="4" fill="#6366f1" stroke="#0b0c16" stroke-width="1.5"/>
        <circle cx="137" cy="90" r="4" fill="#818cf8" stroke="#0b0c16" stroke-width="1.5"/>
        <circle cx="107" cy="84" r="3" fill="#34d399" stroke="#0b0c16" stroke-width="1.2"/>
        <text x="77"  y="112" fill="#6366f1" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono,monospace">x=3</text>
        <text x="137" y="112" fill="#818cf8" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono,monospace">x=7</text>
      </svg>`,
    },
  },
  direct: {
    type: 'direct', topic: 'Arithmetic', status: 'Solved',
    confidence: 99, method: 'Gemini', difficulty: 'Easy',
    roots: 'N/A', time: '1.80s',
    tip: 'Percentages: multiply the base by (percent / 100). So 150% of 100 = 1.5 × 100 = 150.',
    followups: [
      { label: 'What is 75% of 240?',    prompt: 'What is 75% of 240?' },
      { label: 'Percentage increase',    prompt: 'How do I calculate a percentage increase?' },
    ],
    steps: [
      { label: 'Convert percentage', desc: '150% = 150 / 100 = 1.5', eq: '150% → 1.5', note: null, state: 'done' },
      { label: 'Multiply',           desc: 'Apply to the base number',  eq: '1.5 × 100 = 150', note: null, state: 'active' },
    ],
    answer: { verified: true, values: [{ eq: '150', sub: '150% of 100 = 150' }] },
    graph: null,
  },
};

const HISTORY = [
  { eq: 'x² − 5x + 6 = 0',                          tag: 'equation', meta: '2 real roots', key: 'default' },
  { eq: 'x² + 4x + 13 = 0',                          tag: 'equation', meta: '2 complex',    key: 'complex' },
  { eq: 'find two numbers sum=10 product=21',         tag: 'word',     meta: '3 and 7',      key: 'word'    },
  { eq: '150% of 100',                                tag: 'direct',   meta: '= 150',        key: 'direct'  },
];

const EXAMPLES = [
  { val: 'x² − 5x + 6 = 0',                                  key: 'default' },
  { val: 'x² + 4x + 13 = 0',                                  key: 'complex' },
  { val: 'find two numbers whose sum is 10 and product is 21', key: 'word'    },
  { val: '150% of 100',                                        key: 'direct'  },
];

const LOADING_STEPS = [
  'Classifying problem type...',
  'Running SymPy solver...',
  'Generating explanation...',
  'Formatting solution...',
];

/* ══════════════════════════════════════════
   DOM CACHE — query once, reuse everywhere
══════════════════════════════════════════ */
const DOM = {
  problemInput:  document.getElementById('problemInput'),
  charCount:     document.getElementById('charCount'),
  solveBtn:      document.getElementById('solveBtn'),
  emptyState:    document.getElementById('emptyState'),
  loadingState:  document.getElementById('loadingState'),
  stepsArea:     document.getElementById('stepsArea'),
  actionBar:     document.getElementById('actionBar'),
  probDisplay:   document.getElementById('probDisplay'),
  solMeta:       document.getElementById('solMeta'),
  loaderSub:     document.getElementById('loaderSub'),
  histList:      document.getElementById('histList'),
  graphBody:     document.getElementById('graphBody'),
  graphLabel:    document.getElementById('graphLabel'),
  graphEq:       document.getElementById('graphEq'),
  infoCard:      document.getElementById('infoCard'),
  tipCard:       document.getElementById('tipCard'),
  askCard:       document.getElementById('askCard'),
  pdEq:          document.getElementById('pdEq'),
  tagTopic:      document.getElementById('tagTopic'),
  tagStatus:     document.getElementById('tagStatus'),
  confFill:      document.getElementById('confFill'),
  confVal:       document.getElementById('confVal'),
  infoType:      document.getElementById('infoType'),
  infoMethod:    document.getElementById('infoMethod'),
  infoDiff:      document.getElementById('infoDiff'),
  infoRoots:     document.getElementById('infoRoots'),
  infoSolver:    document.getElementById('infoSolver'),
  infoTime:      document.getElementById('infoTime'),
  tipText:       document.getElementById('tipText'),
  followupBtns:  document.getElementById('followupBtns'),
  loaderSteps:   document.querySelectorAll('.ls-item'),
};

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let currentSolution  = null;
let currentQuestion  = '';
let exampleIdx       = 0;
let loadingTimer     = null;

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
function init() {
  buildHistory();
  bindEvents();
  renderSolution('default', 'x² − 5x + 6 = 0');
}

/* ══════════════════════════════════════════
   HISTORY
══════════════════════════════════════════ */
function buildHistory() {
  DOM.histList.innerHTML = '';
  HISTORY.forEach((item, i) => {
    DOM.histList.appendChild(createHistItem(item, i === 0));
  });
}

function createHistItem(item, isActive = false) {
  const div = document.createElement('div');
  div.className = 'hist-item' + (isActive ? ' active' : '');
  div.innerHTML = `
    <div class="hi-eq">${item.eq}</div>
    <div class="hi-meta">
      <span class="hi-tag">${item.tag}</span>
      <span>${item.meta}</span>
    </div>`;
  div.addEventListener('click', () => {
    setActiveHistItem(div);
    DOM.problemInput.value = item.eq;
    updateCharCount();
    detectType(item.tag);
    renderSolution(item.key, item.eq);
  });
  return div;
}

function setActiveHistItem(el) {
  document.querySelectorAll('.hist-item').forEach(h => h.classList.remove('active'));
  el.classList.add('active');
}

function addToHistory(q, key) {
  const data  = MOCK_SOLUTIONS[key] || MOCK_SOLUTIONS.default;
  const short = q.length > 30 ? q.slice(0, 30) + '…' : q;
  const item  = { eq: short, tag: data.type, meta: data.roots, key };
  const div   = createHistItem(item, true);
  document.querySelectorAll('.hist-item').forEach(h => h.classList.remove('active'));
  DOM.histList.prepend(div);
}

/* ══════════════════════════════════════════
   EVENT BINDING
══════════════════════════════════════════ */
function bindEvents() {
  // Input
  DOM.problemInput.addEventListener('input', updateCharCount);

  // Solve — button + Ctrl+Enter
  DOM.solveBtn.addEventListener('click', handleSolve);
  DOM.problemInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSolve();
  });

  // Example / Clear / New session
  document.getElementById('exampleBtn').addEventListener('click', loadNextExample);
  document.getElementById('clearBtn').addEventListener('click', clearInput);
  document.getElementById('newSessionBtn').addEventListener('click', newSession);

  // Copy input
  document.getElementById('copyInputBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(currentQuestion)
      .then(() => showToast('Copied to clipboard'));
  });

  // Type chips
  document.querySelectorAll('.type-chip').forEach(btn => {
    btn.addEventListener('click', () => setActiveChip('.type-chip', btn));
  });

  // Filter pills
  document.querySelectorAll('.tpill').forEach(btn => {
    btn.addEventListener('click', () => setActiveChip('.tpill', btn, 'active-pill'));
  });

  // Empty state chips — click to auto-solve
  document.querySelectorAll('.empty-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      DOM.problemInput.value = chip.dataset.val;
      updateCharCount();
      handleSolve();
    });
  });

  // Action bar
  document.getElementById('explainBtn').addEventListener('click', () => showToast('Connect your backend to get deeper explanations ↗'));
  document.getElementById('harderBtn').addEventListener('click',  () => showToast('Connect your backend for harder problems ↗'));
  document.getElementById('exportBtn').addEventListener('click',  exportSolution);
  document.getElementById('saveBtn').addEventListener('click',    () => showToast('Saved to your library ✓'));
}

/* ══════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════ */
function updateCharCount() {
  const len = DOM.problemInput.value.length;
  DOM.charCount.textContent = `${len}/1000`;
  DOM.charCount.classList.toggle('warn',   len >= 800 && len < 950);
  DOM.charCount.classList.toggle('danger', len >= 950);
}

function setActiveChip(selector, activeEl, activeClass = 'active-chip') {
  document.querySelectorAll(selector).forEach(b => b.classList.remove(activeClass));
  activeEl.classList.add(activeClass);
}

function detectType(type) {
  const chip = document.querySelector(`.type-chip[data-type="${type}"]`);
  if (chip) setActiveChip('.type-chip', chip);
}

function loadNextExample() {
  const ex = EXAMPLES[exampleIdx % EXAMPLES.length];
  exampleIdx++;
  DOM.problemInput.value = ex.val;
  updateCharCount();
  detectType(MOCK_SOLUTIONS[ex.key].type);
}

function clearInput() {
  DOM.problemInput.value = '';
  updateCharCount();
  showEmpty();
}

function newSession() {
  clearInput();
  document.querySelectorAll('.hist-item').forEach(h => h.classList.remove('active'));
}

function pickMockKey(q) {
  const ql = q.toLowerCase();
  if (ql.includes('+4x+13') || ql.includes('+ 4x + 13') || ql.includes('complex')) return 'complex';
  if (ql.includes('sum') || ql.includes('number') || ql.includes('word'))           return 'word';
  if (ql.includes('%') || ql.includes('percent'))                                   return 'direct';
  if (ql.includes('4x') && ql.includes('13'))                                       return 'complex';
  return 'default';
}

/* ══════════════════════════════════════════
   SOLVE FLOW
══════════════════════════════════════════ */
function handleSolve() {
  const q = DOM.problemInput.value.trim();
  if (!q) { DOM.problemInput.focus(); showToast('Please enter a math problem first'); return; }
  currentQuestion = q;
  solveProblem(q);
}

function solveProblem(q) {
  showLoading();
  DOM.solveBtn.disabled = true;

  // Animate loader step list
  let stepIdx = 0;
  DOM.loaderSteps.forEach(el => el.classList.remove('ls-done', 'ls-active'));
  DOM.loaderSteps[0] && DOM.loaderSteps[0].classList.add('ls-active');

  loadingTimer = setInterval(() => {
    if (stepIdx < DOM.loaderSteps.length) {
      DOM.loaderSteps[stepIdx].classList.remove('ls-active');
      DOM.loaderSteps[stepIdx].classList.add('ls-done');
      stepIdx++;
      if (stepIdx < DOM.loaderSteps.length) {
        DOM.loaderSteps[stepIdx].classList.add('ls-active');
      }
      DOM.loaderSub.textContent = LOADING_STEPS[stepIdx] || 'Finishing up...';
    }
  }, 520);

  const delay = 1600 + Math.random() * 1200;
  setTimeout(() => {
    clearInterval(loadingTimer);
    DOM.solveBtn.disabled = false;
    const key = pickMockKey(q);
    renderSolution(key, q);
    addToHistory(q, key);
  }, delay);
}

/* ══════════════════════════════════════════
   RENDER SOLUTION
══════════════════════════════════════════ */
function renderSolution(key, question) {
  const data = MOCK_SOLUTIONS[key] || MOCK_SOLUTIONS.default;
  currentSolution = data;

  updateMeta(data, question);
  updateInfoPanel(data);
  updateGraph(data.graph);
  buildSteps(data);
  detectType(data.type);
  showSolution();
}

/* — meta row — */
function updateMeta(data, question) {
  DOM.pdEq.textContent      = question || currentQuestion;
  DOM.tagTopic.textContent  = data.topic;
  DOM.tagStatus.textContent = data.status;

  DOM.confFill.style.width  = data.confidence + '%';
  DOM.confVal.textContent   = data.confidence + '%';

  const color =
    data.confidence >= 90 ? 'var(--green)' :
    data.confidence >= 75 ? 'var(--amber)' : 'var(--red)';
  DOM.confVal.style.color       = color;
  DOM.confFill.style.background = color;
}

/* — right panel info — */
function updateInfoPanel(data) {
  DOM.infoType.textContent   = data.topic;
  DOM.infoMethod.textContent = data.method;
  DOM.infoDiff.textContent   = data.difficulty;
  DOM.infoRoots.textContent  = data.roots;
  DOM.infoSolver.textContent = data.method;
  DOM.infoTime.textContent   = data.time;
  DOM.tipText.textContent    = data.tip;

  // Follow-up buttons
  DOM.followupBtns.innerHTML = '';
  data.followups.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'ask-btn';
    btn.innerHTML = `${f.label} <span class="ask-arr">↗</span>`;
    btn.addEventListener('click', () => showToast(`Connect backend to handle: "${f.prompt}"`));
    DOM.followupBtns.appendChild(btn);
  });
}

/* — graph — */
function updateGraph(graph) {
  const placeholder = `
    <div class="graph-placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M2 20l5-8 4 4 4-7 5 5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>No graph for this type</span>
    </div>`;

  if (graph) {
    DOM.graphLabel.textContent = graph.label;
    DOM.graphEq.textContent    = graph.eq;
    DOM.graphBody.innerHTML    = graph.svg;
  } else {
    DOM.graphLabel.textContent = '—';
    DOM.graphEq.textContent    = 'N/A';
    DOM.graphBody.innerHTML    = placeholder;
  }
}

/* — step cards — */
function buildSteps(data) {
  DOM.stepsArea.innerHTML = '';

  data.steps.forEach((step, i) => {
    const isLast = i === data.steps.length - 1;
    const wrap   = document.createElement('div');
    wrap.className = 'step-wrap';
    wrap.style.animationDelay = (i * 70) + 'ms';
    wrap.innerHTML = `
      <div class="step-line">
        <div class="snum ${step.state}">${i + 1}</div>
        ${!isLast ? '<div class="vl"></div>' : ''}
      </div>
      <div class="step-card">
        <div class="slabel">${step.label}</div>
        ${step.desc ? `<div class="sdesc">${step.desc}</div>` : ''}
        ${step.eq   ? `<div class="eq-box">${step.eq}</div>` : ''}
        ${step.note ? `<div class="eq-note">${step.note}</div>` : ''}
      </div>`;
    DOM.stepsArea.appendChild(wrap);
  });

  // Answer card
  DOM.stepsArea.appendChild(buildAnswerCard(data.answer, data.steps.length));
}

function buildAnswerCard(answer, totalSteps) {
  const wrap     = document.createElement('div');
  wrap.className = 'step-wrap';
  wrap.style.animationDelay = (totalSteps * 70) + 'ms';

  const colClass = answer.values.length === 1 ? 'one' : 'two';
  const valsHTML = answer.values.map(v =>
    `<div class="av">
      <div class="av-eq">${v.eq}</div>
      <div class="av-sub">${v.sub}</div>
    </div>`
  ).join('');

  wrap.innerHTML = `
    <div class="step-line">
      <div class="snum success">✓</div>
    </div>
    <div class="ans-card">
      <div class="ans-top">
        <span class="ans-lbl">Final answer</span>
        <div class="ans-ok">
          <svg viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.1"/>
            <path d="M4 6l1.5 1.5L8.5 4.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          verified
        </div>
      </div>
      <div class="ans-vals ${colClass}">${valsHTML}</div>
    </div>`;
  return wrap;
}

/* ══════════════════════════════════════════
   STATE TRANSITIONS
══════════════════════════════════════════ */
function showEmpty() {
  setVisible({
    emptyState:   true,
    loadingState: false,
    stepsArea:    false,
    actionBar:    false,
    probDisplay:  false,
    solMeta:      false,
    infoCard:     false,
    tipCard:      false,
    askCard:      false,
  });
  resetGraph();
}

function showLoading() {
  setVisible({
    emptyState:   false,
    loadingState: true,
    stepsArea:    false,
    actionBar:    false,
    probDisplay:  false,
    solMeta:      false,
  });
  DOM.loaderSub.textContent = LOADING_STEPS[0];
}

function showSolution() {
  setVisible({
    emptyState:   false,
    loadingState: false,
    stepsArea:    true,
    actionBar:    true,
    probDisplay:  true,
    solMeta:      true,
    infoCard:     true,
    tipCard:      true,
    askCard:      true,
  });
}

/**
 * Toggle display for multiple elements at once.
 * @param {Object} map  { domKey: boolean }
 */
function setVisible(map) {
  for (const [key, show] of Object.entries(map)) {
    if (DOM[key]) DOM[key].style.display = show ? '' : 'none';
  }
}

function resetGraph() {
  DOM.graphLabel.textContent = '—';
  DOM.graphEq.textContent    = '—';
  DOM.graphBody.innerHTML    = `
    <div class="graph-placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M2 20l5-8 4 4 4-7 5 5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Graph appears after solving</span>
    </div>`;
}

/* ══════════════════════════════════════════
   EXPORT
══════════════════════════════════════════ */
function exportSolution() {
  if (!currentSolution) return;
  const data = currentSolution;
  let text = `AXIOM — Math Solution\n${'='.repeat(40)}\nProblem: ${currentQuestion}\n\nSteps:\n`;

  data.steps.forEach((s, i) => {
    text += `\nStep ${i + 1}: ${s.label}\n`;
    if (s.desc) text += `  ${s.desc}\n`;
    if (s.eq)   text += `  ${s.eq.replace(/<[^>]+>/g, '')}\n`;
    if (s.note) text += `  → ${s.note}\n`;
  });

  text += `\nAnswer:\n`;
  data.answer.values.forEach(v => { text += `  ${v.eq}  (${v.sub})\n`; });
  text += `\nSolved by Axiom AI Math Solver\n`;

  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const a   = Object.assign(document.createElement('a'), { href: url, download: 'axiom-solution.txt' });
  a.click();
  URL.revokeObjectURL(url);
  showToast('Solution exported ✓');
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function showToast(msg) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className   = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

/* ══════════════════════════════════════════
   BOOT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);
