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

function renderDecision() {
  const N = +$('#decision-n').value;
  const slider = $('#decision-k');
  slider.max = N;
  if (+slider.value > N) slider.value = N;
  const n = +slider.value, k = Math.min(n, N - n);
  $('#decision-n-label').textContent = N;
  $('#decision-k-label').textContent = n;
  $('#decision-case').textContent = `D${toSuper(N)}${toSub(n)}`;
  const catalog = {
    product: ['Product state', 'No entangling circuit is needed: all zeros or all ones already form the target.', '✧', 'Why: zero CZ gates'],
    tree: ['Broadcast tree', 'Start with one excitation, then split its amplitude across branches in parallel.', '✳', 'Why: 2N − 3 CZ gates with much less depth than a chain'],
    synth: ['Exact small-state synthesis', 'Use an exact, precomputed Ry + CZ circuit and place its shape on good physical qubits.', '◇', 'Why: dense small states can be much cheaper than a routed generic circuit'],
    portfolio: ['Optimized portfolio circuit', 'A calibrated portfolio of path, ladder, and two-arm constructions is evaluated for this region.', '⤴', 'Why: this family performed better under the team’s evaluation harness'],
    scs: ['Path-based SCS blocks', 'Use exact synthesized blocks on neighbouring qubits along a path.', '╱', 'Why: no generic SWAP routing is needed'],
    routed: ['Routed B–E fallback', 'Use the general Bärtschi–Eidenbenz construction and route it over a selected path.', '↝', 'Why: it extends coverage when specialized candidates are unavailable']
  };
  const key = k === 0 ? 'product' : k === 1 ? 'tree' : (k === 2 && N >= 6) || (k >= 3 && N >= 9) ? 'portfolio' : N <= 8 ? 'synth' : k <= 5 ? 'scs' : 'routed';
  const [name, description, icon, reason] = catalog[key];
  $('#strategy-name').textContent = name;
  $('#strategy-description').textContent = description;
  $('#strategy-symbol').textContent = icon;
  $('#strategy-detail').textContent = `k = min(${n}, ${N - n}) = ${k}${n > N / 2 ? ' · complement + flip' : ''}`;
  $('#strategy-reason').textContent = reason;
  $$('#strategy-menu > div').forEach(el => el.classList.toggle('active', el.dataset.strategy === key));
}
$('#decision-n').addEventListener('input', renderDecision);
$('#decision-k').addEventListener('input', renderDecision);

const nodeId = ([r, c]) => `${r},${c}`;
const label = id => `(${id.replace(',', ', ')})`;
const specialWeak = '6,7';
let topology, neighbors, blocked = new Set(), start = '6,2', end = '6,12', mapMode = 'start';
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
      const cost = weighted ? -3 * Math.log(1 - edgeError(current, next)) : 1;
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
function renderRoute() {
  if (!topology) return;
  const fewest = shortestPath(false), aware = shortestPath(true);
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
  let message;
  if (!fewest.length || !aware.length) message = 'No connected path remains. Unblock a qubit or choose new endpoints.';
  else if (same) message = 'Both rules choose the same route at this setting. Try raising the weak-link error or moving an endpoint.';
  else if (aware.length > fewest.length) message = `The noise-aware route uses ${aware.length - fewest.length} extra hop${aware.length - fewest.length === 1 ? '' : 's'} to avoid higher-risk links.`;
  else message = 'Both routes use the same number of hops, but the noise-aware route chooses lower-risk links.';
  $('#route-explanation').textContent = message;
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
