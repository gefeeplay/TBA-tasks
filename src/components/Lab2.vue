<script setup>
import { ref, computed } from "vue";

// ---------------- Комплексные числа ----------------
class Complex {
  constructor(re, im) {
    this.re = re;
    this.im = im;
  }
  add(o) { return new Complex(this.re + o.re, this.im + o.im); }
  sub(o) { return new Complex(this.re - o.re, this.im - o.im); }
  mul(o) { return new Complex(this.re * o.re - this.im * o.im, this.re * o.im + this.im * o.re); }
}

function twiddle(k, N) {
  const angle = (-2 * Math.PI * k) / N;
  return new Complex(Math.cos(angle), Math.sin(angle));
}

function DFT(seq) {
  const N = seq.length;
  let res = [];
  for (let k = 0; k < N; k++) {
    let sum = new Complex(0, 0);
    for (let n = 0; n < N; n++) sum = sum.add(seq[n].mul(twiddle(k * n, N)));
    res.push(sum);
  }
  return res;
}

function isPrime(x) {
  if (x < 2) return false;
  for (let i = 2; i * i <= x; i++) if (x % i === 0) return false;
  return true;
}

// универсальный Cooley–Tukey FFT
function FFT(seq) {
  const N = seq.length;
  if (N <= 1) return seq;
  if (isPrime(N)) return DFT(seq);

  // находим разложение N = N1 * N2
  let N1 = -1, N2 = -1;
  for (let i = 2; i <= Math.sqrt(N); i++) {
    if (N % i === 0) { N1 = i; N2 = N / i; break; }
  }

  // шаг 1: таблица
  let table = Array.from({ length: N1 }, () => new Array(N2));
  for (let n = 0; n < N; n++) {
    let n1 = Math.floor(n / N2), n2 = n % N2;
    table[n1][n2] = seq[n];
  }

  // шаг 2: FFT по строкам
  for (let n1 = 0; n1 < N1; n1++) table[n1] = FFT(table[n1]);

  // шаг 3: поворотные множители
  for (let n1 = 0; n1 < N1; n1++) {
    for (let k2 = 0; k2 < N2; k2++) {
      table[n1][k2] = table[n1][k2].mul(twiddle(n1 * k2, N));
    }
  }

  // шаг 4: FFT по столбцам
  let resultTable = Array.from({ length: N2 }, () => new Array(N1));
  for (let k2 = 0; k2 < N2; k2++) {
    let col = [];
    for (let n1 = 0; n1 < N1; n1++) col.push(table[n1][k2]);
    let colFFT = FFT(col);
    for (let k1 = 0; k1 < N1; k1++) resultTable[k2][k1] = colFFT[k1];
  }

  // шаг 5: обратно в 1D
  let output = [];
  for (let k1 = 0; k1 < N1; k1++) {
    for (let k2 = 0; k2 < N2; k2++) output.push(resultTable[k2][k1]);
  }
  return output;
}

// ---------------- Vue часть ----------------
const inputText = ref("1,2,3,4,5,6,7,8"); // строка ввода
const parsedInput = computed(() =>
  inputText.value.split(",").map(x => new Complex(parseFloat(x.trim()) || 0, 0))
);

const N = computed(() => parsedInput.value.length);

const output = computed(() => FFT(parsedInput.value));
</script>

<template>
  <div class="panel">
    <h2>Алгоритм Кули–Тьюки БПФ</h2>

    <div class="params">
      <h3>Параметры:</h3>

      <!-- Ввод массива -->
      <div class="param">
        <div class="param-row small">
          <div class="param-label">Входной массив</div>
          <div class="param-range">через запятую</div>
        </div>
        <div class="param-row big">
          <input v-model="inputText" class="param-input"></input>
        </div>
      </div>

      <!-- N -->
      <div class="param">
        <div class="param-row small">
          <div class="param-label">Размер N</div>
          <div class="param-range">число отсчетов</div>
        </div>
        <div class="big">
          <div class="param-ans">{{ N }}</div>
        </div>
      </div>

      <!-- Ответ -->
      <h3>Результат FFT:</h3>
      <table border="1" cellpadding="4" class="answ-table">
        <thead>
          <tr>
            <th>k</th>
            <th>Re</th>
            <th>Im</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c,i) in output" :key="i">
            <td>{{ i }}</td>
            <td>{{ c.re.toFixed(3) }}</td>
            <td>{{ c.im.toFixed(3) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>



<style scoped>
/* Первая строка */
.param-row.small {
  font-size: 0.8rem;
  color: #aaa;
}

/* Вторая строка */
.big {
  display: flex;
  justify-content: end;
  font-size: 1rem;
  font-weight: 500;
}

.param-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 6px 10px;
  border: 1px solid rgba(97, 97, 97, 0.3);
  border-radius: 8px;
  max-width: 15rem;
}

.param-title {
  font-weight: 600;
}
.param-label {
  padding: 6px 10px;
}
.param-range {
  width: 12rem;
  text-align: end;
  padding: 6px 4px;
}

.answ-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  background: rgba(40, 40, 40, 0.5);
  border: 1px solid rgba(97, 97, 97, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.answ-table thead {
  background: rgba(60, 60, 60, 0.7);
}

.answ-table th,
.answ-table td {
  border: 1px solid rgba(97, 97, 97, 0.3);
  padding: 6px 10px;
  text-align: center;
  color: rgb(200, 200, 200);
}

.answ-table th {
  font-weight: bold;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  color: rgb(220, 220, 220);
}

</style>