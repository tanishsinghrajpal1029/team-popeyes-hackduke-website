const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function makeHeroMesh() {
  const points = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 9; col++) {
      if (Math.abs(row - 3) + Math.abs(col - 4) <= 5) points.push([row, col]);
    }
  }
  const pointSet = new Set(points.map(([r, c]) => `${r},${c}`));
  const lines = [];
  const dots = [];
  for (const [r, c] of points) {
    const x = 23 + c * 43, y = 23 + r * 43;
    if (pointSet.has(`${r},${c + 1}`)) lines.push(`<line x1="${x}" y1="${y}" x2="${x + 43}" y2="${y}"/>`);
    if (pointSet.has(`${r + 1},${c}`)) lines.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 43}"/>`);
    dots.push(`<circle cx="${x}" cy="${y}" r="5.5"/>`);
  }
  $('#hero-mesh').innerHTML = `<svg viewBox="0 0 395 310" aria-hidden="true">${lines.join('')}${dots.join('')}</svg>`;
}

function choose(n, k) {
  let result = 1;
  for (let i = 1; i <= k; i++) result = result * (n - i + 1) / i;
  return Math.round(result);
}

let validStrings = [];
function renderState() {
  const N = +$('#n-qubits').value;
  const nSlider = $('#n-excitations');
  nSlider.max = N;
  if (+nSlider.value > N) nSlider.value = N;
  const n = +nSlider.value;
  const K = choose(N, n);
  validStrings = [];
  for (let value = 0; value < 1 << N; value++) {
    const bits = value.toString(2).padStart(N, '0');
    if ([...bits].filter(bit => bit === '1').length === n) validStrings.push(bits);
  }
  $('#n-value').textContent = N;
  $('#k-value').textContent = n;
  $('#valid-count').textContent = K;
  $('#each-prob').textContent = `${(100 / K).toFixed(K > 20 ? 1 : 1)}%`;
  $('#amplitude').textContent = K === 1 ? '1' : `1/√${K}`;
  $('#bitstring-count-label').textContent = `${K} state${K === 1 ? '' : 's'}`;
  const preview = validStrings.slice(0, 2).map(s => `|${s}⟩`).join(' + ');
  $('#state-equation').textContent = `|D${toSuper(N)}${toSub(n)}⟩ = ${K === 1 ? preview : `(${preview}${K > 2 ? ' + ···' : ''}) / √${K}`}`;
  $('#bitstring-grid').innerHTML = validStrings.map(bits => `<div class="bitstring" data-bits="${bits}" aria-label="${bits}, probability ${(100 / K).toFixed(1)} percent">${[...bits].map(bit => `<i class="${bit === '1' ? 'on' : ''}" aria-hidden="true"></i>`).join('')}</div>`).join('');
  $('#bitstring-note').textContent = `Lit dots are 1s. Each valid row has exactly ${n}.`;
  $('.sample-result').textContent = 'Press measure to draw one valid bitstring.';
}
const superDigits = '⁰¹²³⁴⁵⁶⁷⁸⁹', subDigits = '₀₁₂₃₄₅₆₇₈₉';
const toSuper = value => `${value}`.split('').map(d => superDigits[+d]).join('');
const toSub = value => `${value}`.split('').map(d => subDigits[+d]).join('');
$('#n-qubits').addEventListener('input', renderState);
$('#n-excitations').addEventListener('input', renderState);
$('#measure-button').addEventListener('click', () => {
  const bits = validStrings[Math.floor(Math.random() * validStrings.length)];
  $$('.bitstring').forEach(el => el.classList.toggle('measure-hit', el.dataset.bits === bits));
  $('.sample-result').textContent = `Measured |${bits}⟩ · one of ${validStrings.length} equally likely outcomes`;
});

let phase = 'plus';
$$('.phase-option').forEach(button => button.addEventListener('click', () => {
  phase = button.dataset.phase;
  $$('.phase-option').forEach(el => el.classList.toggle('active', el === button));
  $('#xx-value').textContent = phase === 'plus' ? '+1' : '−1';
  $('#x-observation').textContent = phase === 'plus' ? 'The + state has the target correlation.' : 'The − state has the opposite correlation, despite identical Z outcomes.';
  $('#interference-indicator').style.right = phase === 'plus' ? '0' : 'calc(100% - 30px)';
}));

let bonusDepths = new Map();
function renderDecision() {
  const N = +$('#decision-n').value;
  const slider = $('#decision-k');
  slider.max = N;
  if (+slider.value > N) slider.value = N;
  const n = +slider.value, k = Math.min(n, N - n);
  const crossover = (N === 7 && n === 3) || (N === 9 && n === 4);
  $('#decision-n-label').textContent = N;
  $('#decision-k-label').textContent = n;
  $('#decision-case').textContent = `D${toSuper(N)}${toSub(n)}`;
  let name, description, icon, reason;
  if (crossover) {
    [name, description, icon, reason] = ['Measured crossover', 'This pair tries the alternative team construction first because it scored better in the local comparison.', '✦', 'The portfolio default is the validity fallback'];
  } else if (k === 0) {
    [name, description, icon, reason] = ['Product state', 'The portfolio prepares an all-zero or all-one state without entangling gates.', '○', 'The alternative team construction remains a validity fallback'];
  } else {
    [name, description, icon, reason] = ['Portfolio default', 'The default team construction chooses a circuit and placement using the supplied calibration.', '✳', 'The alternative team construction remains a validity fallback'];
  }
  $('#strategy-name').textContent = name;
  $('#strategy-description').textContent = description;
  $('#strategy-symbol').textContent = icon;
  $('#strategy-detail').textContent = `N = ${N} · n = ${n} · k = min(n, N−n) = ${k}`;
  $('#strategy-reason').textContent = reason;
  $$('#strategy-menu > div').forEach(el => el.classList.toggle('active', el.dataset.strategy === (crossover ? 'crossover' : 'default')));
  renderBonusDepth(N, n);
}
function renderBonusDepth(N, n) {
  const row = bonusDepths.get(`${N},${n}`);
  if (!row) {
    $('#bonus-eligibility').textContent = N > 15 || n < 1 || n > Math.floor(N / 2)
      ? 'Bonus range: 2 ≤ N ≤ 15 and 1 ≤ n ≤ ⌊N/2⌋. Choose a pair in that range.'
      : 'Loading checked bonus depths…';
    for (const id of ['bonus-a-depth', 'bonus-b-depth', 'bonus-selected-depth']) $(`#${id}`).textContent = '—';
    for (const id of ['bonus-a-bar', 'bonus-b-bar']) $(`#${id}`).style.width = '0%';
    renderUnoMatrix();
    return;
  }
  $('#bonus-eligibility').textContent = `D${toSuper(N)}${toSub(n)}: both circuits passed the exact-state check.`;
  const max = Math.max(row.candidate_a, row.candidate_b);
  $('#bonus-a-depth').textContent = row.candidate_a;
  $('#bonus-b-depth').textContent = row.candidate_b;
  $('#bonus-selected-depth').textContent = row.selected;
  $('#bonus-a-bar').style.width = `${100 * row.candidate_a / max}%`;
  $('#bonus-b-bar').style.width = `${100 * row.candidate_b / max}%`;
  $('#bonus-a-bar').classList.toggle('chosen', row.candidate_a === row.selected);
  $('#bonus-b-bar').classList.toggle('chosen', row.candidate_b === row.selected);
  renderUnoMatrix();
}
fetch('./bonus-depths.json').then(response => {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}).then(data => {
  bonusDepths = new Map(data.cases.map(row => [`${row.N},${row.n}`, row]));
  renderDecision();
}).catch(() => {
  $('#bonus-eligibility').textContent = 'Depth data could not load. Refresh the page to try again.';
});
$('#decision-n').addEventListener('input', renderDecision);
$('#decision-k').addEventListener('input', renderDecision);

const nodeId = ([r, c]) => `${r},${c}`;
const label = id => `(${id.replace(',', ', ')})`;
const specialWeak = '6,7';
let topology, neighbors, blocked = new Set(), start = '6,2', end = '6,12', mapMode = 'start';
let unoMode = 'aware', latestRoutes = {direct: [], aware: []};
const baseError = (a, b) => {
  const token = [a, b].sort().join('|');
  let hash = 13;
  for (const char of token) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  return .0022 + (hash % 29) * .00011;
};
const edgeError = (a, b) => a === specialWeak || b === specialWeak ? +$('#weak-error').value / 100 : baseError(a, b);
const edgeKey = (a, b) => [a, b].sort().join('|');
function shortestPath(weighted) {
  const ids = topology.qubits.map(nodeId);
  const dist = Object.fromEntries(ids.map(id => [id, Infinity]));
  const previous = {};
  const remaining = new Set(ids.filter(id => !blocked.has(id)));
  dist[start] = 0;
  while (remaining.size) {
    let current = null;
    for (const id of remaining) if (current === null || dist[id] < dist[current]) current = id;
    if (current === null || !Number.isFinite(dist[current])) break;
    if (current === end) break;
    remaining.delete(current);
    const nexts = [...neighbors[current]].sort((a, b) => {
      const [ar, ac] = a.split(',').map(Number), [br, bc] = b.split(',').map(Number), [er, ec] = end.split(',').map(Number);
      return (Math.abs(ar - er) + Math.abs(ac - ec)) - (Math.abs(br - er) + Math.abs(bc - ec));
    });
    for (const next of nexts) {
      if (!remaining.has(next)) continue;
      const cost = weighted ? -(next === end ? 1 : 3) * Math.log1p(-edgeError(current, next)) : 1;
      const candidate = dist[current] + cost;
      if (candidate < dist[next] - 1e-10) { dist[next] = candidate; previous[next] = current; }
    }
  }
  if (!Number.isFinite(dist[end])) return [];
  const path = [end];
  while (path[0] !== start) {
    const prev = previous[path[0]];
    if (!prev) return [];
    path.unshift(prev);
  }
  return path;
}
function routeSuccess(path) {
  if (path.length < 2) return 1;
  let survival = 1;
  for (let i = 0; i < path.length - 1; i++) {
    survival *= (1 - edgeError(path[i], path[i + 1])) ** (i === path.length - 2 ? 1 : 3);
  }
  return survival;
}
function xy(id) {
  const [r, c] = id.split(',').map(Number);
  return [33 + c * 52, 34 + r * 51];
}
function renderUnoMatrix() {
  if (!topology) return;
  const row = bonusDepths.get(`${+$('#decision-n').value},${+$('#decision-k').value}`);
  const route = latestRoutes[unoMode] || [];
  const routeNodes = new Set(route);
  const available = new Set(topology.qubits.map(nodeId));
  const maxDepth = row ? Math.max(row.candidate_a, row.candidate_b) : 1;
  const lengths = row ? [Math.ceil(13 * row.candidate_a / maxDepth), Math.ceil(13 * row.candidate_b / maxDepth)] : [0, 0];
  const lights = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 13; x++) {
      const id = `${y + 3},${x + 1}`;
      const classes = ['uno-led'];
      if (unoMode === 'bonus') {
        if (row && ((y === 1 || y === 2) && x < lengths[0] || (y === 5 || y === 6) && x < lengths[1])) {
          classes.push(y <= 2 ? 'bar-a' : 'bar-b');
          if (y <= 2 && row.candidate_a === row.selected || y >= 5 && row.candidate_b === row.selected) classes.push('selected');
        }
      } else if (available.has(id)) {
        classes.push('node');
        if (blocked.has(id)) classes.push('blocked');
        else if (routeNodes.has(id)) classes.push('on-route');
        if (id === specialWeak && !blocked.has(id)) classes.push('weak');
        if (id === start || id === end) classes.push('marker');
      }
      lights.push(`<span class="${classes.join(' ')}" aria-hidden="true"></span>`);
    }
  }
  $('#uno-matrix').innerHTML = lights.join('');
  const displayLabel = unoMode === 'bonus' ? 'BONUS DEPTH DUEL' : unoMode === 'direct' ? 'FEWEST-HOP ROUTE' : 'NOISE-AWARE ROUTE';
  $('#uno-display-label').textContent = displayLabel;
  $('#uno-indicator').className = `uno-indicator ${unoMode}`;
  if (unoMode === 'bonus') {
    $('#uno-caption').textContent = row
      ? `D${toSuper(row.N)}${toSub(row.n)} · upper bars: candidate A, ${row.candidate_a} moments; lower bars: candidate B, ${row.candidate_b} moments. ${row.candidate_a === row.candidate_b ? 'The depths tie, so both bars glow equally.' : 'The brighter, shorter bar is selected.'}`
      : 'Choose a graded bonus pair below: 2 ≤ N ≤ 15 and 1 ≤ n ≤ ⌊N/2⌋.';
  } else {
    const visible = route.filter(id => { const [r, c] = id.split(',').map(Number); return r >= 3 && r <= 10 && c >= 1 && c <= 13; }).length;
    $('#uno-caption').textContent = route.length
      ? `${displayLabel.toLowerCase()} · ${route.length - 1} hops · ${visible} of ${route.length} route qubits visible in the central matrix window.${visible < route.length ? ' The full path is on the map above.' : ''}`
      : 'No connected route at this setting. Unblock a qubit or choose new endpoints.';
  }
}
$$('.uno-mode').forEach(button => button.addEventListener('click', () => {
  unoMode = button.dataset.unoMode;
  $$('.uno-mode').forEach(el => el.classList.toggle('active', el === button));
  renderUnoMatrix();
}));
function renderRoute() {
  if (!topology) return;
  const fewest = shortestPath(false), aware = shortestPath(true);
  latestRoutes = {direct: fewest, aware};
  const svg = $('#topology-map');
  const edgeMarkup = topology.couplers.map(([q1, q2]) => {
    const [x1, y1] = xy(nodeId(q1)), [x2, y2] = xy(nodeId(q2));
    return `<line class="topology-edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }).join('');
  const poly = (path, className) => path.length ? `<polyline class="route-line ${className}" points="${path.map(id => xy(id).join(',')).join(' ')}"/>` : '';
  const same = fewest.join('|') === aware.join('|');
  const nodeMarkup = topology.qubits.map(q => {
    const id = nodeId(q), [x, y] = xy(id);
    const classes = ['node', id === specialWeak ? 'weak' : '', blocked.has(id) ? 'blocked' : '', id === start ? 'start' : '', id === end ? 'end' : ''].join(' ');
    const text = id === start ? 'S' : id === end ? 'T' : '';
    return `<g class="${classes}" data-id="${id}" tabindex="0" role="button" aria-label="Qubit ${label(id)}${blocked.has(id) ? ', unavailable' : ''}"><title>Qubit ${label(id)}${id === specialWeak ? ' · illustrative weak qubit' : ''}</title><circle cx="${x}" cy="${y}" r="7"/><text x="${x + 11}" y="${y - 9}">${text}</text></g>`;
  }).join('');
  svg.innerHTML = edgeMarkup + poly(fewest, 'hops') + poly(aware, `weighted${same ? ' same-path' : ''}`) + nodeMarkup;
  $$('#topology-map .node').forEach(el => {
    el.addEventListener('click', () => handleNode(el.dataset.id));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNode(el.dataset.id); } });
  });
  const writeResult = (path, count, risk) => {
    $(count).textContent = path.length ? `${path.length - 1} hops` : 'No route';
    $(risk).textContent = path.length ? `${Math.max(0, path.length - 2)} SWAPs · ${(100 * routeSuccess(path)).toFixed(1)}% gate survival` : 'Check blocked qubits';
  };
  writeResult(fewest, '#hops-count', '#hops-risk');
  writeResult(aware, '#weighted-count', '#weighted-risk');
  $('#hops-path').textContent = fewest.length ? fewest.map(label).join(' → ') : 'No route';
  $('#weighted-path').textContent = aware.length ? aware.map(label).join(' → ') : 'No route';
  let message;
  if (!fewest.length || !aware.length) message = 'No connected path remains. Unblock a qubit or choose new endpoints.';
  else if (same) message = 'Both rules choose the same route at this setting. Try raising the weak-link error or moving an endpoint.';
  else if (aware.length > fewest.length) message = `The noise-aware route uses ${aware.length - fewest.length} extra hop${aware.length - fewest.length === 1 ? '' : 's'} to avoid higher-risk links.`;
  else message = 'Both routes use the same number of hops, but the noise-aware route chooses lower-risk links.';
  $('#route-explanation').textContent = message;
  renderUnoMatrix();
}
function handleNode(id) {
  if (mapMode === 'block') {
    if (id === start || id === end) return;
    blocked.has(id) ? blocked.delete(id) : blocked.add(id);
    $('#block-weak').checked = blocked.has(specialWeak);
  } else if (mapMode === 'start' && id !== end) {
    start = id; blocked.delete(id); $('#start-select').value = id;
    setMapMode('end');
  } else if (mapMode === 'end' && id !== start) {
    end = id; blocked.delete(id); $('#end-select').value = id;
    setMapMode('start');
  }
  renderRoute();
}
function setMapMode(value) {
  mapMode = value;
  $$('.map-mode').forEach(el => el.classList.toggle('active', el.dataset.mode === value));
}
$$('.map-mode').forEach(el => el.addEventListener('click', () => setMapMode(el.dataset.mode)));
$('#weak-error').addEventListener('input', () => { $('#weak-error-label').textContent = `${(+$('#weak-error').value).toFixed(1)}%`; renderRoute(); });
$('#block-weak').addEventListener('change', e => {
  if (e.target.checked && specialWeak !== start && specialWeak !== end) blocked.add(specialWeak); else blocked.delete(specialWeak);
  renderRoute();
});
$('#start-select').addEventListener('change', e => { if (e.target.value !== end) { start = e.target.value; blocked.delete(start); renderRoute(); } });
$('#end-select').addEventListener('change', e => { if (e.target.value !== start) { end = e.target.value; blocked.delete(end); renderRoute(); } });

async function loadTopology() {
  try {
    const response = await fetch('./topology.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    topology = await response.json();
    neighbors = Object.fromEntries(topology.qubits.map(q => [nodeId(q), []]));
    for (const [a, b] of topology.couplers) {
      neighbors[nodeId(a)].push(nodeId(b));
      neighbors[nodeId(b)].push(nodeId(a));
    }
    const options = topology.qubits.map(q => `<option value="${nodeId(q)}">${label(nodeId(q))}</option>`).join('');
    $('#start-select').innerHTML = options;
    $('#end-select').innerHTML = options;
    $('#start-select').value = start;
    $('#end-select').value = end;
    $('#map-loading').remove();
    renderRoute();
  } catch (error) {
    $('#map-loading').textContent = 'Could not load topology. Reload the page to try again.';
    console.error(error);
  }
}

makeHeroMesh();
renderState();
renderDecision();
loadTopology();
