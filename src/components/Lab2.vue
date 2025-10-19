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

let usedMethod = "";

// табличный метод
function FFT(seq) {
  const N = seq.length;

  if (N <= 1) return seq;
  if (isPrime(N)) return DFT(seq);

  // ---------- найти разложение N = N1 * N2 ----------
  let N1 = -1, N2 = -1;
  for (let i = 2; i <= Math.sqrt(N); i++) {
    if (N % i === 0) { N1 = i; N2 = N / i; break; }
  }
  if (N1 === -1) return DFT(seq); // на всякий случай

  // ---------- шаг 1: заполнение таблицы ----------
  // n = N1 * n2 + n1
  // => n1 in [0..N1-1], n2 in [0..N2-1]
  let table = Array.from({ length: N1 }, () => Array.from({ length: N2 }, () => null));
  for (let n = 0; n < N; n++) {
    const n1 = n % N1;                // обратимо из n = N1*n2 + n1
    const n2 = Math.floor(n / N1);
    // эквивалентно: n = N1*n2 + n1
    table[n1][n2] = seq[n];
  }

  // ---------- шаг 2: FFT по строкам (длина N2) ----------
  // каждая строка table[n1] имеет длину N2
  for (let n1 = 0; n1 < N1; n1++) {
    // рекурсивный вызов на длине N2
    table[n1] = FFT(table[n1]);
  }

  // ---------- шаг 3: домножение на поворачивающие множители ----------
  // twiddle: W_N^(n1 * k2)
  for (let n1 = 0; n1 < N1; n1++) {
    for (let k2 = 0; k2 < N2; k2++) {
      table[n1][k2] = table[n1][k2].mul(twiddle(n1 * k2, N));
    }
  }

  // ---------- шаг 4: FFT по столбцам (длина N1) ----------
  // построим таблицу результатов размерности N2 x N1 (строка — k2, столбец — k1)
  let resultTable = Array.from({ length: N2 }, () => Array.from({ length: N1 }, () => null));
  for (let k2 = 0; k2 < N2; k2++) {
    // собираем столбец: элементы table[n1][k2] для n1=0..N1-1
    const col = [];
    for (let n1 = 0; n1 < N1; n1++) col.push(table[n1][k2]);
    const colFFT = FFT(col); // длина N1
    for (let k1 = 0; k1 < N1; k1++) resultTable[k2][k1] = colFFT[k1];
  }

  // ---------- шаг 5: развёртка результата в 1D ----------
  // k: k = N2 * k1 + k2
  const output = new Array(N);
  for (let k1 = 0; k1 < N1; k1++) {
    for (let k2 = 0; k2 < N2; k2++) {
      const k = N2 * k1 + k2;
      output[k] = resultTable[k2][k1]; // resultTable indexed [k2][k1]
    }
  }

  return output;
}


// ---------------- Обёртка с методом ----------------
function runFFT(seq) {
  const N = seq.length;
  if (N <= 1) {
    usedMethod = "N = 1 → Тривиальный случай";
    return seq;
  }
  if (isPrime(N)) {
    usedMethod = `N = ${N} (простое) → прямой ДПФ`;
    return DFT(seq);
  }
  // если составное
  let N1 = -1, N2 = -1;
  for (let i = 2; i <= Math.sqrt(N); i++) {
    if (N % i === 0) { N1 = i; N2 = N / i; break; }
  }
  usedMethod = `N = ${N} (составное) → Кули–Тьюки (${N1} × ${N2})`;
  return FFT(seq);
}

// ---------------- Vue часть ----------------
const inputText = ref("1,2,3,4,5,6,7,8"); // строка ввода
const parsedInput = computed(() =>
  inputText.value.split(",").map(x => new Complex(parseFloat(x.trim()) || 0, 0))
);

const N = computed(() => parsedInput.value.length);

const output = computed(() => {
  const res = runFFT(parsedInput.value);
  method.value = usedMethod;
  return res;
});

const method = ref('');
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

      <!-- Метод -->
      <div class="param">
        <div class="param-row small">
          <div class="param-label">Использованный метод</div>
          <div class="param-range">определяется автоматически</div>
        </div>
        <div class="big">
          <div class="param-ans method">{{ method }}</div>
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
          <tr v-for="(c, i) in output" :key="i">
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

.method {
  width: 18rem;
  font-size: 0.8rem;
  text-align: end;
}
</style>