<script setup>
import { ref, computed, watch, onMounted } from "vue";

const method = ref('');
const N1 = ref(null)
const N2 = ref(null)
const showNInput = ref(false)
const inputClassN = ref('param-input')
const inputModeN = ref('Автоматический расчёт')

const N = computed(() => parsedInput.value.length);
const inputText = ref("1,2,3,4,5,6,7,8"); // строка ввода
const parsedInput = computed(() =>
  inputText.value.split(",").map(x => new Complex(parseFloat(x.trim()) || 0, 0))
);

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

/** Переключение между ручным вводом и авто */
function toggleNInput() {
  showNInput.value = !showNInput.value
  inputModeN.value = showNInput.value ? 'Ручной ввод' : 'Автоматический расчёт'

  if (!showNInput.value && number.value > 0) {
    // автоматическое разложение (например, на 2 и N/2)
    const factors = autoDecompose(number.value)
    N1.value = factors[0]
    N2.value = factors[1]
  } else {
    N1.value = null
    N2.value = null
  }
}

/** Простейшее авторазложение */
function autoDecompose(n) {
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      return [i, n / i]
    }
  }
  return [1, n] 
}

// табличный метод
function FFT(seq) {
  const N = seq.length;
  if (N <= 1) return seq;
  if (isPrime(N)) return DFT(seq);

  // Используем Vue-переменные, если они заданы
  let n1 = N1.value, n2 = N2.value;

  // Если ручные не заданы или некорректны — авторазложение
  if (!n1 || !n2 || n1 * n2 !== N) {
    [n1, n2] = autoDecompose(N);
  }

  // ---------- шаг 1: построение таблицы ----------
  let table = Array.from({ length: n1 }, () => Array.from({ length: n2 }, () => null));
  for (let n = 0; n < N; n++) {
    const n1_idx = n % n1;
    const n2_idx = Math.floor(n / n1);
    table[n1_idx][n2_idx] = seq[n];
  }

  // ---------- шаг 2: FFT по строкам ----------
  for (let i = 0; i < n1; i++) table[i] = FFT(table[i]);

  // ---------- шаг 3: домножение ----------
  for (let i = 0; i < n1; i++) {
    for (let j = 0; j < n2; j++) {
      table[i][j] = table[i][j].mul(twiddle(i * j, N));
    }
  }

  // ---------- шаг 4: FFT по столбцам ----------
  let resultTable = Array.from({ length: n2 }, () => Array.from({ length: n1 }, () => null));
  for (let j = 0; j < n2; j++) {
    const col = [];
    for (let i = 0; i < n1; i++) col.push(table[i][j]);
    const colFFT = FFT(col);
    for (let k = 0; k < n1; k++) resultTable[j][k] = colFFT[k];
  }

  // ---------- шаг 5: развёртка ----------
  const output = new Array(N);
  for (let k1 = 0; k1 < n1; k1++) {
    for (let k2 = 0; k2 < n2; k2++) {
      const k = n2 * k1 + k2;
      output[k] = resultTable[k2][k1];
    }
  }
  return output;
}

// ---------------- Обёртка с методом ----------------
let usedMethod = "";
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

// обновляем N1, N2 при изменении входных данных
watch(N, (newVal) => {
  if (!showNInput.value && newVal > 1) {
    const [a, b] = autoDecompose(newVal);
    N1.value = a;
    N2.value = b;
  }
});

// при ручном вводе проверяем корректность и пересчитываем метод
watch([N1, N2], ([newN1, newN2]) => {
  if (showNInput.value && N.value > 1) {
    if (newN1 && newN2 && newN1 * newN2 === N.value) {
      method.value = `Ручной ввод корректен → (${newN1} × ${newN2})`;
    } else {
      method.value = `Ошибка: ${newN1} × ${newN2} ≠ ${N.value}`;
    }
  }
});

// Инициализация при загрузке
onMounted(() => {
  const [a, b] = autoDecompose(N.value);
  N1.value = a;
  N2.value = b;
});

// Вывод результата
const output = computed(() => {
  const res = runFFT(parsedInput.value);
  method.value = usedMethod;
  return res;
});

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

      <!-- Разложение N = N1 * N2 -->
      <div class="param">
        <div class="param-row small">
          <div class="param-label">Разложение числа N</div>
          <div class="param-range">{{ inputModeN }}</div>
        </div>

        <div class="param-row big">
          <div class="ans-btn">
            <span class="material-symbols-outlined btn" @click="toggleNInput">draw</span>

            <!-- Ручной ввод -->
            <div v-if="showNInput">
              <input class="input-nums" v-model.number="N1" :class="inputClassN" type="number" placeholder="N₁" />
              <span style="margin: 0 0.5rem;">×</span>
              <input class="input-nums" v-model.number="N2" :class="inputClassN" type="number" placeholder="N₂" />
            </div>

            <!-- Автоматический расчёт -->
            <div v-else>
              <div class="param-ans">
                {{ N1 && N2 ? `${N1} × ${N2}` : '-' }}
              </div>
            </div>
          </div>
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
.ans-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn {
  border: 1px solid rgba(97, 97, 97, 0.3);
  border-radius: 1.5rem;
  font-size: 1rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.input-nums {
  max-width: 7rem;
}

</style>