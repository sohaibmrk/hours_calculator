// ---------- helpers ----------
function parseTimeOrMinutes(raw) {
  if (raw === null || raw === undefined) return 0;
  let s = String(raw).trim();
  if (s === '') return 0;
  let sign = 1;
  if (s[0] === '-') { sign = -1; s = s.slice(1).trim(); }
  if (s.includes(':')) {
    const parts = s.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const hh = isNaN(h) ? 0 : h;
    const mm = isNaN(m) ? 0 : m;
    return sign * (hh * 60 + mm);
  } else {
    const m = parseInt(s, 10);
    return sign * (isNaN(m) ? 0 : m);
  }
}

function formatMinutesAsTime(totalMinutes) {
  const sign = totalMinutes < 0 ? '-' : '';
  const abs = Math.abs(Math.round(totalMinutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return sign + h + ':' + String(m).padStart(2, '0');
}

function parseIntSafe(raw) {
  const s = String(raw ?? '').trim();
  if (s === '') return 0;
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

// ---------- Module 1: sumadora ----------
let calcTotalMinutes = 0;
let calcEntries = [];

function renderCalc() {
  document.getElementById('calc-total-display').textContent = formatMinutesAsTime(calcTotalMinutes);
  document.getElementById('calc-total-minutes').textContent = '= ' + calcTotalMinutes + ' minutos en total';
  document.getElementById('calc-display-box').classList.toggle('negative', calcTotalMinutes < 0);

  const list = document.getElementById('calc-entries');
  list.innerHTML = '';
  calcEntries.forEach((e, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    const label = e.raw.includes(':') ? e.raw : (e.raw + ' min');
    chip.innerHTML = label + ' <span class="chip-x">&times;</span>';
    chip.title = 'Quitar esta entrada';
    chip.addEventListener('click', () => removeEntry(i));
    list.appendChild(chip);
  });
}

function addEntry() {
  const input = document.getElementById('calc-input');
  const raw = input.value;
  if (raw.trim() === '') return;
  const minutes = parseTimeOrMinutes(raw);
  calcEntries.push({ raw: raw.trim(), minutes });
  calcTotalMinutes += minutes;
  input.value = '';
  input.focus();
  renderCalc();
}

function removeEntry(index) {
  calcTotalMinutes -= calcEntries[index].minutes;
  calcEntries.splice(index, 1);
  renderCalc();
}

function resetCalc() {
  calcTotalMinutes = 0;
  calcEntries = [];
  renderCalc();
}

document.getElementById('calc-add-btn').addEventListener('click', addEntry);
document.getElementById('calc-reset-btn').addEventListener('click', resetCalc);
document.getElementById('calc-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); addEntry(); }
});

// ---------- Module 2: diferencia ----------
let diffMode = 'time';
let lastDiffMinutes = null;

function renderDiff() {
  const resultEl = document.getElementById('diff-result');
  const subEl    = document.getElementById('diff-sub');
  const formatLabel = document.getElementById('diff-format-label');
  const box      = document.getElementById('diff-display-box');

  if (lastDiffMinutes === null) {
    resultEl.textContent = '—';
    subEl.textContent = 'Introduce ambas horas y pulsa Calcular';
    formatLabel.textContent = '';
    box.classList.remove('negative');
    return;
  }

  const isNeg = lastDiffMinutes < 0;
  box.classList.toggle('negative', isNeg);

  if (diffMode === 'time') {
    resultEl.textContent = formatMinutesAsTime(lastDiffMinutes);
    subEl.textContent = '= ' + lastDiffMinutes + ' minutos';
    formatLabel.textContent = 'Formato actual: horas : minutos';
  } else {
    resultEl.textContent = lastDiffMinutes + ' min';
    subEl.textContent = '= ' + formatMinutesAsTime(lastDiffMinutes);
    formatLabel.textContent = 'Formato actual: minutos totales';
  }
}

function calcDiff() {
  const a = parseTimeOrMinutes(document.getElementById('diff-start').value);
  const b = parseTimeOrMinutes(document.getElementById('diff-end').value);
  lastDiffMinutes = b - a;
  renderDiff();
}

function resetDiff() {
  document.getElementById('diff-start').value = '';
  document.getElementById('diff-end').value = '';
  diffMode = 'time';
  lastDiffMinutes = null;
  renderDiff();
}

document.getElementById('diff-calc-btn').addEventListener('click', calcDiff);
document.getElementById('diff-reset-btn').addEventListener('click', resetDiff);
document.getElementById('diff-format-btn').addEventListener('click', () => {
  diffMode = diffMode === 'time' ? 'minutes' : 'time';
  renderDiff();
});
['diff-start', 'diff-end'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); calcDiff(); }
  });
});

// ---------- Module 3: tabla ----------

// Recalcula la fila TOTAL
function recalcTable() {
  for (let col = 1; col <= 6; col++) {
    const v1 = document.getElementById('r1c' + col).value;
    const v2 = document.getElementById('r2c' + col).value;
    const isTimeCol = (col % 2 === 1); // col 1,3,5 → tiempo
    const out = document.getElementById('r3c' + col);
    if (isTimeCol) {
      const total = parseTimeOrMinutes(v1) + parseTimeOrMinutes(v2);
      out.textContent = formatMinutesAsTime(total);
    } else {
      const total = parseIntSafe(v1) + parseIntSafe(v2);
      out.textContent = String(total);
    }
  }
}

// Autorelleno fila DAY
// - r2c1 (tiempo) → copia a r2c3 y r2c5
// - r2c4 (entero) → copia a r2c6
// El usuario puede cambiar cualquier campo copiado libremente.

function markAutofilled(el, yes) {
  el.classList.toggle('autofilled', yes);
}

const r2c1 = document.getElementById('r2c1');
const r2c3 = document.getElementById('r2c3');
const r2c5 = document.getElementById('r2c5');
const r2c4 = document.getElementById('r2c4');
const r2c6 = document.getElementById('r2c6');

// Seguimiento: si el usuario tocó manualmente los campos destino
let r2c3_manual = false;
let r2c5_manual = false;
let r2c6_manual = false;

// Cuando el usuario escribe en r2c3 o r2c5 manualmente, desactiva el autorrelleno para ese campo
r2c3.addEventListener('input', () => { r2c3_manual = true;  markAutofilled(r2c3, false); recalcTable(); });
r2c5.addEventListener('input', () => { r2c5_manual = true;  markAutofilled(r2c5, false); recalcTable(); });
r2c6.addEventListener('input', () => { r2c6_manual = true;  markAutofilled(r2c6, false); recalcTable(); });

// Cuando se cambia r2c1 (tiempo DAY): propaga a r2c3 y r2c5 si no han sido tocados manualmente
r2c1.addEventListener('input', () => {
  const val = r2c1.value;
  if (!r2c3_manual) { r2c3.value = val; markAutofilled(r2c3, val !== ''); }
  if (!r2c5_manual) { r2c5.value = val; markAutofilled(r2c5, val !== ''); }
  recalcTable();
});

// Cuando se cambia r2c4 (entero DAY): propaga a r2c6 si no ha sido tocado manualmente
r2c4.addEventListener('input', () => {
  const val = r2c4.value;
  if (!r2c6_manual) { r2c6.value = val; markAutofilled(r2c6, val !== ''); }
  recalcTable();
});

// El resto de inputs de la tabla (fila BROUGHT FWD + r2c2) solo recalculan
['r1c1','r1c2','r1c3','r1c4','r1c5','r1c6','r2c2'].forEach(id => {
  document.getElementById(id).addEventListener('input', recalcTable);
});

// Limpiar tabla: resetea también los flags de manual
document.getElementById('table-clear-btn').addEventListener('click', () => {
  for (let row = 1; row <= 2; row++) {
    for (let col = 1; col <= 6; col++) {
      document.getElementById('r' + row + 'c' + col).value = '';
    }
  }
  r2c3_manual = false;
  r2c5_manual = false;
  r2c6_manual = false;
  markAutofilled(r2c3, false);
  markAutofilled(r2c5, false);
  markAutofilled(r2c6, false);
  recalcTable();
});

// initial render
renderCalc();
recalcTable();
