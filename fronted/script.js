/* ============================================================
   AXIOM — AI Math Solver · script.js  v3
   Mobile-responsive: drawer nav, right-panel sheet, FAB
   Clean DOM cache, reusable helpers
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
    tip: 'When D > 0, try factoring first — it\'s faster than the quadratic formula for simple integer roots.',
    followups: [
      { label: 'Why conjugate pairs?',  prompt: 'Why do complex roots always come in conjugate pairs?' },
      { label: 'Try complex roots',     prompt: 'Solve x² + 4x + 13 = 0 which gives complex roots' },
      { label: 'Discriminant geometry', prompt: 'What is the geometric meaning of the discriminant?' },
    ],
    steps: [
      { label: 'Identify coefficients',   desc: 'Match with standard form ax² + bx + c = 0', eq: 'a = 1 · b = −5 · c = 6', note: null, state: 'done' },
      { label: 'Calculate discriminant',  desc: 'D = b² − 4ac determines the nature of roots', eq: 'D = 25 − 24 = <span style="color:var(--green);font-weight:500">1</span>', note: 'D > 0 → two distinct real roots', state: 'done' },
      { label: 'Apply quadratic formula', desc: null, eq: 'x = (5 ± √1) / 2 = (5 ± 1) / 2', note: null, state: 'done' },
      { label: 'Compute both roots',      desc: 'Evaluate the plus and minus cases separately', eq: 'x₁ = (5+1)/2 = 3 · x₂ = (5−1)/2 = 2', note: null, state: 'active' },
    ],
    answer: { verified: true, values: [{ eq: 'x = 2', sub: '4 − 10 + 6 = 0 ✓' }, { eq: 'x = 3', sub: '9 − 15 + 6 = 0 ✓' }] },
    graph: {
      label: 'Parabola', eq: 'y = x²−5x+6',
      svg: `<svg viewBox="0 0 214 128" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;padding:4px 0">
<line x1="12" y1="90" x2="202" y2="90" stroke="#1a1c2e" stroke-width="1"/>
<line x1="107" y1="8" x2="107" y2="108" stroke="#1a1c2e" stroke-width="1"/>
<text x="196" y="99" fill="#343b60" font-size="7.5" font-family="JetBrains Mono,monospace">x</text>
<text x="110" y="14" fill="#343b60" font-size="7.5" font-family="JetBrains Mono,monospace">y</text>
<text x="67"  y="102" fill="#343b60" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">1</text>
<text x="87"  y="102" fill="#343b60" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">2</text>
<text x="107" y="102" fill="#343b60" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">3</text>
<text x="127" y="102" fill="#343b60" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">4</text>
<text x="147" y="102" fill="#343b60" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">5</text>
<path d="M28,84 C44,98 62,108 87,90 C97,84 101,87 107,90 C113,93 117,88 127,90 C152,82 168,64 190,38" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round"/>
<circle cx="87" cy="90" r="4" fill="#6366f1" stroke="#0b0c16" stroke-width="1.5"/>
<circle cx="127" cy="90" r="4" fill="#818cf8" stroke="#0b0c16" stroke-width="1.5"/>
<circle cx="107" cy="83.5" r="3" fill="#34d399" stroke="#0b0c16" stroke-width="1.2"/>
<text x="87"  y="116" fill="#6366f1" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono,monospace">x=2</text>
<text x="127" y="116" fill="#818cf8" font-size="7.5" text-anchor="middle" font-family="JetBrains Mono,monospace">x=3</text>
<text x="119" y="81"  fill="#34d399" font-size="7" font-family="JetBrains Mono,monospace">vertex</text>
</svg>`,
    },
  },

  complex: {
    type: 'equation', topic: 'Algebra', status: 'Solved',
    confidence: 88, method: 'SymPy', difficulty: 'Hard',
    roots: '2 complex', time: '3.12s',
    tip: 'When D < 0, the parabola never touches the x-axis. Roots are always complex conjugate pairs.',
    followups: [
      { label: 'What is i?',             prompt: 'Explain what the imaginary unit i means geometrically' },
      { label: 'Plot on Argand diagram', prompt: 'Show me how to plot complex roots on an Argand diagram' },
      { label: 'Back to real roots',     prompt: 'Solve x² - 5x + 6 = 0 step by step' },
    ],
    steps: [
      { label: 'Identify coefficients',  desc: 'Match with standard form ax² + bx + c = 0', eq: 'a = 1 · b = 4 · c = 13', note: null, state: 'done' },
      { label: 'Calculate discriminant', desc: 'D = b² − 4ac', eq: 'D = 16 − 52 = <span style="color:var(--red);font-weight:500">−36</span>', note: 'D < 0 → no real roots → complex roots', state: 'done' },
      { label: 'Apply quadratic formula',desc: null, eq: 'x = (−4 ± √(−36)) / 2', note: null, state: 'done' },
      { label: 'Simplify the radical',   desc: '√(−36) = 6i  (since i = √−1)', eq: 'x = (−4 ± 6i) / 2 = −2 ± 3i', note: null, state: 'active' },
    ],
    answer: { verified: true, values: [{ eq: 'x = −2 + 3i', sub: 'conjugate root' }, { eq: 'x = −2 − 3i', sub: 'conjugate root' }] },
    graph: {
      label: 'Parabola · no x-intercepts', eq: 'y = x²+4x+13',
      svg: `<svg viewBox="0 0 214 128" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;padding:4px 0">
<line x1="12" y1="100" x2="202" y2="100" stroke="#1a1c2e" stroke-width="1"/>
<line x1="107" y1="8" x2="107" y2="112" stroke="#1a1c2e" stroke-width="1"/>
<text x="196" y="109" fill="#343b60" font-size="7.5" font-family="JetBrains Mono,monospace">x</text>
<text x="110" y="14"  fill="#343b60" font-size="7.5" font-family="JetBrains Mono,monospace">y</text>
<path d="M30,100 C50,100 70,96 87,78 C97,65 102,52 107,46 C112,52 117,65 127,78 C144,96 164,100 184,100" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round"/>
<circle cx="107" cy="46" r="3.5" fill="#6366f1" stroke="#0b0c16" stroke-width="1.5"/>
<text x="118" y="46" fill="#6366f1" font-size="7.5" font-family="JetBrains Mono,monospace">vertex (−2, 9)</text>
<line x1="20" y1="100" x2="194" y2="100" stroke="#f87171" stroke-width="1" stroke-dasharray="3,3" opacity=".4"/>
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
      { label: 'Harder word problem',  prompt: 'Give me a harder word problem involving quadratics' },
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
<text x="196" y="99" fill="#343b60" font-size="7.5" font-family="JetBrains Mono,monospace">x</text>
<text x="50"  y="14" fill="#343b60" font-size="7.5" font-family="JetBrains Mono,monospace">y</text>
<text x="77"  y="102" fill="#343b60" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">3</text>
<text x="107" y="102" fill="#343b60" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">5</text>
<text x="137" y="102" fill="#343b60" font-size="7" text-anchor="middle" font-family="JetBrains Mono,monospace">7</text>
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
      { label: 'What is 75% of 240?', prompt: 'What is 75% of 240?' },
      { label: 'Percentage increase',  prompt: 'How do I calculate a percentage increase?' },
    ],
    steps: [
      { label: 'Convert percentage', desc: '150% = 150 / 100 = 1.5', eq: '150% → 1.5', note: null, state: 'done' },
      { label: 'Multiply',           desc: 'Apply to the base number', eq: '1.5 × 100 = 150', note: null, state: 'active' },
    ],
    answer: { verified: true, values: [{ eq: '150', sub: '150% of 100 = 150' }] },
    graph: null,
  },
};

const HISTORY = [
  { eq: 'x² − 5x + 6 = 0',                         tag: 'equation', meta: '2 real roots', key: 'default' },
  { eq: 'x² + 4x + 13 = 0',                         tag: 'equation', meta: '2 complex',    key: 'complex' },
  { eq: 'find two numbers sum=10 product=21',        tag: 'word',     meta: '3 and 7',      key: 'word'    },
  { eq: '150% of 100',                               tag: 'direct',   meta: '= 150',        key: 'direct'  },
];

const EXAMPLES = [
  { val: 'x² − 5x + 6 = 0',                                  key: 'default' },
  { val: 'x² + 4x + 13 = 0',                                  key: 'complex' },
  { val: 'find two numbers whose sum is 10 and product is 21', key: 'word'    },
  { val: '150% of 100',                                        key: 'direct'  },
];

const LOADING_STEPS_TEXT = [
  'Classifying problem type...',
  'Running SymPy solver...',
  'Generating explanation...',
  'Formatting solution...',
];

/* ══════════════════════════════════════════
   DOM CACHE
══════════════════════════════════════════ */
const D = {
  // inputs
  problemInput:   document.getElementById('problemInput'),
  charCount:      document.getElementById('charCount'),
  solveBtn:       document.getElementById('solveBtn'),
  // panels
  emptyState:     document.getElementById('emptyState'),
  loadingState:   document.getElementById('loadingState'),
  stepsArea:      document.getElementById('stepsArea'),
  actionBar:      document.getElementById('actionBar'),
  probDisplay:    document.getElementById('probDisplay'),
  // meta
  solMeta:        document.getElementById('solMeta'),
  pdEq:           document.getElementById('pdEq'),
  tagTopic:       document.getElementById('tagTopic'),
  tagStatus:      document.getElementById('tagStatus'),
  confFill:       document.getElementById('confFill'),
  confVal:        document.getElementById('confVal'),
  // loader
  loaderSub:      document.getElementById('loaderSub'),
  lsItems:        document.querySelectorAll('.ls-item'),
  // history
  histList:       document.getElementById('histList'),
  // right panel
  rightPanel:     document.getElementById('rightPanel'),
  rpClose:        document.getElementById('rpClose'),
  graphLabel:     document.getElementById('graphLabel'),
  graphEq:        document.getElementById('graphEq'),
  graphBody:      document.getElementById('graphBody'),
  infoCard:       document.getElementById('infoCard'),
  tipCard:        document.getElementById('tipCard'),
  askCard:        document.getElementById('askCard'),
  infoType:       document.getElementById('infoType'),
  infoMethod:     document.getElementById('infoMethod'),
  infoDiff:       document.getElementById('infoDiff'),
  infoRoots:      document.getElementById('infoRoots'),
  infoSolver:     document.getElementById('infoSolver'),
  infoTime:       document.getElementById('infoTime'),
  tipText:        document.getElementById('tipText'),
  followupBtns:   document.getElementById('followupBtns'),
  // mobile
  mobileMenuBtn:  document.getElementById('mobileMenuBtn'),
  mobileInfoBtn:  document.getElementById('mobileInfoBtn'),
  sidebar:        document.getElementById('sidebar'),
  sidebarClose:   document.getElementById('sidebarClose'),
  sidebarOverlay: document.getElementById('sidebarOverlay'),
  leftPanel:      document.querySelector('.left-panel'),
  mobInfoTrigger: document.getElementById('mobInfoTrigger'),
  fab:            document.getElementById('fab'),
  newSessionBtn:  document.getElementById('newSessionBtn'),
  copyInputBtn:   document.getElementById('copyInputBtn'),
};

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let currentSolution = null;
let currentQuestion = '';
let exampleIdx      = 0;
let loadingTimer    = null;

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
function init() {
  buildHistory();
  bindEvents();
  // Load first example on start
  renderSolution('default', 'x² − 5x + 6 = 0');
}

/* ══════════════════════════════════════════
   HISTORY
══════════════════════════════════════════ */
function buildHistory() {
  D.histList.innerHTML = '';
  HISTORY.forEach((item, i) => {
    D.histList.appendChild(makeHistItem(item, i === 0));
  });
}

function makeHistItem(item, active = false) {
  const el = document.createElement('div');
  el.className = 'hist-item' + (active ? ' active' : '');
  el.innerHTML = `
    <div class="hi-eq">${item.eq}</div>
    <div class="hi-meta">
      <span class="hi-tag">${item.tag}</span>
      <span>${item.meta}</span>
    </div>`;
  el.addEventListener('click', () => {
    activateHistItem(el);
    D.problemInput.value = item.eq;
    updateCharCount();
    detectType(item.tag);
    renderSolution(item.key, item.eq);
    closeLeftPanel(); // auto-close on mobile
  });
  return el;
}

function activateHistItem(el) {
  document.querySelectorAll('.hist-item').forEach(h => h.classList.remove('active'));
  el.classList.add('active');
}

function prependHistory(q, key) {
  const data  = MOCK_SOLUTIONS[key] || MOCK_SOLUTIONS.default;
  const short = q.length > 34 ? q.slice(0, 34) + '…' : q;
  const el    = makeHistItem({ eq: short, tag: data.type, meta: data.roots, key }, true);
  document.querySelectorAll('.hist-item').forEach(h => h.classList.remove('active'));
  D.histList.prepend(el);
}

/* ══════════════════════════════════════════
   MOBILE PANEL CONTROLS
══════════════════════════════════════════ */
function openLeftPanel() {
  D.leftPanel.classList.add('lp-open');
  D.sidebarOverlay.style.display = 'block';
  requestAnimationFrame(() => D.sidebarOverlay.classList.add('visible'));
  document.body.style.overflow = 'hidden';
}

function closeLeftPanel() {
  D.leftPanel.classList.remove('lp-open');
  closeOverlay();
}

function openRightPanel() {
  D.rightPanel.classList.add('rp-open');
  D.sidebarOverlay.style.display = 'block';
  requestAnimationFrame(() => D.sidebarOverlay.classList.add('visible'));
  document.body.style.overflow = 'hidden';
}

function closeRightPanel() {
  D.rightPanel.classList.remove('rp-open');
  closeOverlay();
}

function closeOverlay() {
  D.sidebarOverlay.classList.remove('visible');
  setTimeout(() => { D.sidebarOverlay.style.display = 'none'; }, 250);
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════
   EVENT BINDING
══════════════════════════════════════════ */
function bindEvents() {

  // ── Input ──
  D.problemInput.addEventListener('input', updateCharCount);
  D.solveBtn.addEventListener('click', handleSolve);
  D.problemInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSolve();
  });

  // ── Toolbar ──
  document.getElementById('exampleBtn').addEventListener('click', loadNextExample);
  document.getElementById('clearBtn').addEventListener('click', clearInput);
  D.newSessionBtn.addEventListener('click', clearInput);
  D.copyInputBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentQuestion)
      .then(() => showToast('Copied to clipboard'));
  });

  // ── Type chips ──
  document.querySelectorAll('.type-chip').forEach(btn =>
    btn.addEventListener('click', () => setActiveClass('.type-chip', btn))
  );

  // ── Filter pills ──
  document.querySelectorAll('.tpill').forEach(btn =>
    btn.addEventListener('click', () => setActiveClass('.tpill', btn, 'active-pill'))
  );

  // ── Empty state chips ──
  document.querySelectorAll('.empty-chip').forEach(chip =>
    chip.addEventListener('click', () => {
      D.problemInput.value = chip.dataset.val;
      updateCharCount();
      handleSolve();
    })
  );

  // ── Action bar ──
  document.getElementById('explainBtn').addEventListener('click', () =>
    showToast('Connect your backend to get deeper explanations ↗')
  );
  document.getElementById('harderBtn').addEventListener('click', () =>
    showToast('Connect your backend for harder problems ↗')
  );
  document.getElementById('exportBtn').addEventListener('click', exportSolution);
  document.getElementById('saveBtn').addEventListener('click', () =>
    showToast('Saved to your library ✓')
  );

  // ── Mobile: sidebar drawer ──
  D.mobileMenuBtn.addEventListener('click', openLeftPanel);
  D.sidebarClose && D.sidebarClose.addEventListener('click', closeLeftPanel);

  // ── Mobile: right panel sheet ──
  D.mobileInfoBtn.addEventListener('click', openRightPanel);
  D.mobInfoTrigger && D.mobInfoTrigger.addEventListener('click', openRightPanel);
  D.rpClose.addEventListener('click', closeRightPanel);

  // ── Overlay tap to close both ──
  D.sidebarOverlay.addEventListener('click', () => {
    closeLeftPanel();
    closeRightPanel();
    closeOverlay();
  });

  // ── FAB: open left panel on mobile ──
  D.fab.addEventListener('click', () => {
    openLeftPanel();
    setTimeout(() => D.problemInput.focus(), 320);
  });

  // ── Swipe to close left panel on mobile ──
  bindSwipeClose(D.leftPanel, 'left', closeLeftPanel);
  bindSwipeClose(D.rightPanel, 'right', closeRightPanel);

  // ── Sidebar nav items (highlight) ──
  document.querySelectorAll('.ni[data-page]').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
      btn.classList.add('active');
    })
  );
}

/* ── Swipe-to-close helper ── */
function bindSwipeClose(el, direction, closeFn) {
  let startX = null;
  el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (direction === 'left'  && dx < -60) closeFn();
    if (direction === 'right' && dx >  60) closeFn();
    startX = null;
  }, { passive: true });
}

/* ══════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════ */
function updateCharCount() {
  const len = D.problemInput.value.length;
  D.charCount.textContent = `${len} / 1000`;
  D.charCount.classList.toggle('warn',   len >= 800 && len < 950);
  D.charCount.classList.toggle('danger', len >= 950);
}

function setActiveClass(selector, activeEl, cls = 'active-chip') {
  document.querySelectorAll(selector).forEach(b => b.classList.remove(cls));
  activeEl.classList.add(cls);
}

function detectType(type) {
  const chip = document.querySelector(`.type-chip[data-type="${type}"]`);
  if (chip) setActiveClass('.type-chip', chip);
}

function loadNextExample() {
  const ex = EXAMPLES[exampleIdx % EXAMPLES.length];
  exampleIdx++;
  D.problemInput.value = ex.val;
  updateCharCount();
  detectType(MOCK_SOLUTIONS[ex.key].type);
}

function clearInput() {
  D.problemInput.value = '';
  updateCharCount();
  showEmpty();
  document.querySelectorAll('.hist-item').forEach(h => h.classList.remove('active'));
}

function pickKey(q) {
  const l = q.toLowerCase();
  if (l.includes('+4x+13') || l.includes('+ 4x + 13') || l.includes('complex')) return 'complex';
  if (l.includes('sum')    || l.includes('number')   || l.includes('word'))      return 'word';
  if (l.includes('%')      || l.includes('percent'))                             return 'direct';
  if (l.includes('4x')     && l.includes('13'))                                  return 'complex';
  return 'default';
}


function parseGeminiResponse(text) {
  const steps = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  let currentStep = null;
  let finalAnswer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // detect step header
    if (/^Step \d+:/i.test(line)) {
      if (currentStep) steps.push(currentStep);
      currentStep = {
        label: line.replace(/^Step \d+:\s*/i, ''),
        desc: '',
        eq: '',
        state: 'done'
      };
    }
    // detect explanation
    else if (/^Explanation:/i.test(line) && currentStep) {
      currentStep.desc = line.replace(/^Explanation:\s*/i, '');
    }
    // detect final answer
    else if (/^Final Answer:/i.test(line)) {
      finalAnswer = line.replace(/^Final Answer:\s*/i, '').trim();
      if (!finalAnswer && lines[i + 1]) {
        finalAnswer = lines[i + 1].trim();
      }
    }
    // equations / calculations (lines with =, numbers, math)
    else if (currentStep && /[=+\-*/^]/.test(line) && line.length < 120) {
      currentStep.eq = currentStep.eq
        ? currentStep.eq + '\n' + line
        : line;
    }
    // extra explanation lines
    else if (currentStep && line && !/^(Question|FORMAT)/i.test(line)) {
      if (!currentStep.desc) currentStep.desc = line;
    }
  }

  if (currentStep) steps.push(currentStep);

  // mark last step active
  if (steps.length > 0) {
    steps[steps.length - 1].state = 'active';
  }

  return { steps, finalAnswer };
}
/* ══════════════════════════════════════════
   SOLVE FLOW
══════════════════════════════════════════ */
function handleSolve() {
  const q = D.problemInput.value.trim();
  if (!q) { D.problemInput.focus(); showToast('Please enter a math problem first'); return; }
  currentQuestion = q;
  closeLeftPanel();   // auto-close drawer on mobile after hitting solve
  solveProblem(q);
}

async function solveProblem(q) {

  showLoading();
  D.solveBtn.disabled = true;

  let si = 0;

  D.lsItems.forEach(el =>
    el.classList.remove('ls-done', 'ls-active')
  );

  if (D.lsItems[0]) {
    D.lsItems[0].classList.add('ls-active');
  }

  loadingTimer = setInterval(() => {

    if (si < D.lsItems.length) {

      D.lsItems[si].classList.remove('ls-active');
      D.lsItems[si].classList.add('ls-done');

      si++;

      if (si < D.lsItems.length) {
        D.lsItems[si].classList.add('ls-active');
      }

      D.loaderSub.textContent =
        LOADING_STEPS_TEXT[si] || 'Finishing up...';
    }

  }, 500);

  try {

    const response = await fetch("http://127.0.0.1:8000/solve", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        question: q
      })

    });

    const data = await response.json();

    clearInterval(loadingTimer);

    D.solveBtn.disabled = false;

    renderRealSolution(data, q);

  } catch (error) {

    clearInterval(loadingTimer);

    D.solveBtn.disabled = false;

    console.error(error);

    showToast("Backend connection failed");

  }
}


function plotEquation(eqString) {

  D.graphBody.innerHTML =
    '<div id="plotDiv" style="width:100%;height:240px;"></div>';

  try {

    const xVals = [];
    const yVals = [];

    

 eqString = eqString
  .replace(/²/g, '^2')
  .replace(/³/g, '^3');

if ((eqString.match(/y/g) || []).length > 1) {
  console.log("Skipping unsupported graph");
  return;
}

  console.log("Equation:", eqString);

  // compile equation using math.js
    const expr = math.compile(eqString);

    // generate points
    for (let x = -6; x <= 6; x += 0.05) {

      xVals.push(x);

      try {

        const y = expr.evaluate({ x });

        yVals.push(
          isFinite(y) && Math.abs(y) < 1000
            ? y
            : null
        );

      } catch {

        yVals.push(null);

      }
    }
    

    // graph layout
    const layout = {

      autosize: true,

      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',

      margin: {
        t: 10,
        b: 35,
        l: 40,
        r: 10
      },

      xaxis: {
        color: '#5b638f',
        gridcolor: '#1a1c2e',
        zerolinecolor: '#5b4fff',

        tickfont: {
          size: 10,
          family: 'JetBrains Mono'
        }
      },

      yaxis: {
        color: '#5b638f',
        gridcolor: '#1a1c2e',
        zerolinecolor: '#5b4fff',

        tickfont: {
          size: 10,
          family: 'JetBrains Mono'
        },

      },

      showlegend: false
    };

    const config = {
      displayModeBar: false,
      responsive: true,
      staticPlot: false
    };

    // create empty graph
    Plotly.newPlot(
      'plotDiv',
      [{
        x: [],
        y: [],
        type: 'scatter',
        mode: 'lines',

        line: {
          color: '#7c5cff',
          width: 4,
          shape: 'spline',
          smoothing: 1.2
        },

        hoverinfo: 'none',
        connectgaps: false
      }],
      layout,
      config
    );

    // animate graph slowly
    let i = 0;

    const interval = setInterval(() => {

      Plotly.extendTraces(
        'plotDiv',
        {
          x: [[xVals[i]]],
          y: [[yVals[i]]]
        },
        [0]
      );

      i++;

      if (i >= xVals.length) {

        clearInterval(interval);

        // glow effect
        Plotly.restyle('plotDiv', {
          line: [{
            color: '#9d8cff',
            width: 5
          }]
        });
      }

    }, 10);

    // labels
    D.graphLabel.textContent = 'y = f(x)';
    D.graphEq.textContent = `y = ${eqString}`;

  } catch (err) {

    console.error(err);

    D.graphBody.innerHTML = `
      <div class="graph-placeholder">
        Could not plot this equation
      </div>
    `;
  }
}


/* ══════════════════════════════════════════
   RENDER
══════════════════════════════════════════ */
function renderSolution(key, question) {
  const data = MOCK_SOLUTIONS[key] || MOCK_SOLUTIONS.default;
  currentSolution = data;

  applyMeta(data, question);
  applyInfoPanel(data);
  applyGraph(data.graph);
  buildSteps(data);
  detectType(data.type);
  showSolution();
}


function renderRealSolution(data, question) {
  currentQuestion = question;
  D.pdEq.textContent = question;

  // update meta
  D.tagTopic.textContent      = data.problem_type || 'Math';
  D.tagStatus.textContent     = 'Solved';
  D.confFill.style.width      = '90%';
  D.confVal.textContent       = '90%';
  D.confVal.style.color       = 'var(--green)';
  D.confFill.style.background = 'var(--green)';

  // update info panel
  D.infoType.textContent   = data.problem_type || '—';
  D.infoMethod.textContent = data.method       || '—';
  D.infoDiff.textContent   = data.difficulty   || '—';
  D.infoRoots.textContent  = data.roots        || 'N/A';
  D.infoSolver.textContent = data.solver       || '—';
  D.infoTime.textContent   = data.time_taken   + 's';
  D.tipText.textContent    = data.tip          || '—';

  // parse Gemini response into steps
  const { steps, finalAnswer } = parseGeminiResponse(data.answer);

  // render using existing buildSteps structure
  D.stepsArea.innerHTML = '';

  if (steps.length === 0) {
    // fallback if parsing fails
    D.stepsArea.innerHTML = `
      <div class="step-wrap">
        <div class="step-line"><div class="snum done">1</div></div>
        <div class="step-card">
          <div class="slabel">Solution</div>
          <div class="sdesc" style="white-space:pre-wrap">${data.answer}</div>
        </div>
      </div>`;
  } else {
    steps.forEach((step, i) => {
      const isLast = i === steps.length - 1;
      const wrap = document.createElement('div');
      wrap.className = 'step-wrap';
      wrap.style.animationDelay = (i * 65) + 'ms';
      wrap.innerHTML = `
        <div class="step-line">
          <div class="snum ${step.state}">${i + 1}</div>
          ${!isLast ? '<div class="vl"></div>' : ''}
        </div>
        <div class="step-card">
          <div class="slabel">${step.label}</div>
          ${step.desc ? `<div class="sdesc">${step.desc}</div>` : ''}
          ${step.eq   ? `<div class="eq-box">${step.eq.replace(/\n/g, '<br>')}</div>` : ''}
        </div>`;
      D.stepsArea.appendChild(wrap);
    });
  }

  // final answer card
  if (finalAnswer) {
    const ansWrap = document.createElement('div');
    ansWrap.className = 'step-wrap';
    ansWrap.style.animationDelay = (steps.length * 65) + 'ms';
    ansWrap.innerHTML = `
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
        <div class="ans-vals one">
          <div class="av">
            <div class="av-eq">${finalAnswer}</div>
          </div>
        </div>
      </div>`;
    D.stepsArea.appendChild(ansWrap);
  }

 // graph

if (data.plot_equation) {

  console.log("PLOT EQ:", data.plot_equation);

  plotEquation(data.plot_equation);

} else {

  D.graphLabel.textContent = '—';
  D.graphEq.textContent    = 'N/A';

  D.graphBody.innerHTML = `
    <div class="graph-placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M2 20l5-8 4 4 4-7 5 5"
          stroke-linecap="round"
          stroke-linejoin="round"/>
      </svg>
      <span>No graph for this type</span>
    </div>`;
}

showSolution();
}

function applyMeta(data, question) {
  D.pdEq.textContent      = question || currentQuestion;
  D.tagTopic.textContent  = data.topic;
  D.tagStatus.textContent = data.status;
  D.confFill.style.width  = data.confidence + '%';
  D.confVal.textContent   = data.confidence + '%';
  const color = data.confidence >= 90 ? 'var(--green)' : data.confidence >= 75 ? 'var(--amber)' : 'var(--red)';
  D.confVal.style.color       = color;
  D.confFill.style.background = color;
  // show info trigger on mobile once solved
  if (D.mobInfoTrigger) D.mobInfoTrigger.style.display = 'flex';
}

function applyInfoPanel(data) {
  D.infoType.textContent   = data.topic;
  D.infoMethod.textContent = data.method;
  D.infoDiff.textContent   = data.difficulty;
  D.infoRoots.textContent  = data.roots;
  D.infoSolver.textContent = data.method;
  D.infoTime.textContent   = data.time;
  D.tipText.textContent    = data.tip;

  D.followupBtns.innerHTML = '';
  data.followups.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'ask-btn';
    btn.innerHTML = `${f.label} <span class="ask-arr">↗</span>`;
    btn.addEventListener('click', () => showToast(`Connect backend: "${f.prompt}"`));
    D.followupBtns.appendChild(btn);
  });
}

function applyGraph(graph) {
  const ph = `<div class="graph-placeholder">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M2 20l5-8 4 4 4-7 5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span>No graph for this type</span>
  </div>`;

  if (graph) {
    D.graphLabel.textContent = graph.label;
    D.graphEq.textContent    = graph.eq;
    D.graphBody.innerHTML    = graph.svg;
  } else {
    D.graphLabel.textContent = '—';
    D.graphEq.textContent    = 'N/A';
    D.graphBody.innerHTML    = ph;
  }
}

function buildSteps(data) {
  D.stepsArea.innerHTML = '';

  data.steps.forEach((step, i) => {
    const isLast = i === data.steps.length - 1;
    const wrap   = document.createElement('div');
    wrap.className = 'step-wrap';
    wrap.style.animationDelay = (i * 65) + 'ms';
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
    D.stepsArea.appendChild(wrap);
  });

  D.stepsArea.appendChild(buildAnswerCard(data.answer, data.steps.length));
}

function buildAnswerCard(answer, totalSteps) {
  const wrap = document.createElement('div');
  wrap.className = 'step-wrap';
  wrap.style.animationDelay = (totalSteps * 65) + 'ms';
  const cols = answer.values.length === 1 ? 'one' : 'two';
  const vals = answer.values.map(v =>
    `<div class="av"><div class="av-eq">${v.eq}</div><div class="av-sub">${v.sub}</div></div>`
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
      <div class="ans-vals ${cols}">${vals}</div>
    </div>`;
  return wrap;
}

/* ══════════════════════════════════════════
   STATE TRANSITIONS
══════════════════════════════════════════ */
function vis(el, show) { if (el) el.style.display = show ? '' : 'none'; }

function showEmpty() {
  vis(D.emptyState,   true);
  vis(D.loadingState, false);
  vis(D.stepsArea,    false);
  vis(D.actionBar,    false);
  vis(D.probDisplay,  false);
  vis(D.solMeta,      false);
  vis(D.infoCard,     false);
  vis(D.tipCard,      false);
  vis(D.askCard,      false);
  if (D.mobInfoTrigger) D.mobInfoTrigger.style.display = 'none';
  resetGraph();
}

function showLoading() {
  vis(D.emptyState,   false);
  vis(D.loadingState, true);
  vis(D.stepsArea,    false);
  vis(D.actionBar,    false);
  vis(D.probDisplay,  false);
  vis(D.solMeta,      false);
  D.loaderSub.textContent = LOADING_STEPS_TEXT[0];
}

function showSolution() {
  vis(D.emptyState,   false);
  vis(D.loadingState, false);
  vis(D.stepsArea,    true);
  vis(D.actionBar,    true);
  vis(D.probDisplay,  true);
  vis(D.solMeta,      true);
  vis(D.infoCard,     true);
  vis(D.tipCard,      true);
  vis(D.askCard,      true);
}

function resetGraph() {
  D.graphLabel.textContent = '—';
  D.graphEq.textContent    = '—';
  D.graphBody.innerHTML    = `<div class="graph-placeholder">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M2 20l5-8 4 4 4-7 5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span>Graph appears after solving</span>
  </div>`;
}

/* ══════════════════════════════════════════
   EXPORT
══════════════════════════════════════════ */
function exportSolution() {
  if (!currentSolution) return;
  const d = currentSolution;
  let text = `AXIOM — Math Solution\n${'='.repeat(40)}\nProblem: ${currentQuestion}\n\nSteps:\n`;
  d.steps.forEach((s, i) => {
    text += `\nStep ${i + 1}: ${s.label}\n`;
    if (s.desc) text += `  ${s.desc}\n`;
    if (s.eq)   text += `  ${s.eq.replace(/<[^>]+>/g, '')}\n`;
    if (s.note) text += `  → ${s.note}\n`;
  });
  text += `\nAnswer:\n`;
  d.answer.values.forEach(v => { text += `  ${v.eq}  (${v.sub})\n`; });
  text += `\nSolved by Axiom AI\n`;

  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  Object.assign(document.createElement('a'), { href: url, download: 'axiom-solution.txt' }).click();
  URL.revokeObjectURL(url);
  showToast('Solution exported ✓');
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function showToast(msg) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

/* ══════════════════════════════════════════
   BOOT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);
