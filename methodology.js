const nRange = document.querySelector('#story-n-qubits');
const kRange = document.querySelector('#story-n-excitations');
const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const subscripts = '₀₁₂₃₄₅₆₇₈₉';

function digits(value, alphabet) {
  return String(value).split('').map(digit => alphabet[Number(digit)]).join('');
}

function choose(n, k) {
  let result = 1;
  for (let i = 1; i <= k; i++) result = result * (n - i + 1) / i;
  return Math.round(result);
}

function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function renderMath() {
  const N = Number(nRange.value);
  kRange.max = String(N);
  if (Number(kRange.value) > N) kRange.value = String(N);
  const n = Number(kRange.value);
  const K = choose(N, n);
  const numerator = 2 * n * (N - n);
  const denominator = N * (N - 1);
  const factor = gcd(numerator, denominator);

  document.querySelector('#story-n-value').textContent = N;
  document.querySelector('#story-k-value').textContent = n;
  document.querySelector('#story-state').textContent = `D${digits(N, superscripts)}${digits(n, subscripts)}`;
  document.querySelector('#story-combinations').textContent = K;
  document.querySelector('#story-probability').textContent = K === 1 ? '1' : `1/${K}`;
  document.querySelector('#story-correlation').textContent = numerator === 0 ? '0' : denominator === numerator ? '1' : `${numerator / factor}/${denominator / factor}`;
}

nRange.addEventListener('input', renderMath);
kRange.addEventListener('input', renderMath);
renderMath();
