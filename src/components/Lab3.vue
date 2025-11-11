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
    scale(s) { return new Complex(this.re * s, this.im * s); }
}

function twiddle(k, N) {
    const angle = (-2 * Math.PI * k) / N;
    return new Complex(Math.cos(angle), Math.sin(angle));
}

// ---------------- Прямое ДПФ ----------------
function DFT(seq) {
    const N = seq.length;
    let res = [];
    for (let k = 0; k < N; k++) {
        let sum = new Complex(0, 0);
        for (let n = 0; n < N; n++)
            sum = sum.add(seq[n].mul(twiddle(k * n, N)));
        res.push(sum);
    }
    return res;
}

// ---------------- Расширенный алгоритм Евклида ----------------
function extendedGcd(a, b) {
    if (b === 0) return { g: a, x: 1, y: 0 };
    const { g, x: x1, y: y1 } = extendedGcd(b, a % b);
    return { g, x: y1, y: x1 - Math.floor(a / b) * y1 };
}

function mod(a, m) { return ((a % m) + m) % m; }

// ---------------- Алгоритм Гуда–Томаса ----------------
function GoodThomasFFT(seq, N1, N2) {
    const N = N1 * N2;
    if (seq.length !== N) {
        inputTextClass.value = 'param-input out-of-range';
        inputN2Class.value = 'param-input';
        throw new Error("Размер входа не совпадает с N1 * N2");      
    }

    // 1. Находим P, Q из P*N1 + Q*N2 = 1
    const eg = extendedGcd(N1, N2);
    if (eg.g !== 1) {
        inputN2Class.value = 'param-input out-of-range';
        inputTextClass.value = 'param-input';
        throw new Error("N1 и N2 не взаимно простые!");
    }
  
    const P = eg.x;
    const Q = eg.y;

    // 2. Формируем двумерную таблицу
    let table = Array.from({ length: N1 }, () => new Array(N2));
    for (let i1 = 0; i1 < N1; i1++) {
        for (let i2 = 0; i2 < N2; i2++) {
            const i = mod(i1 * Q * N2 + i2 * P * N1, N);
            table[i1][i2] = seq[i];
        }
    }

    // 3. БПФ по столбцам (n2)
    for (let i1 = 0; i1 < N1; i1++) {
        table[i1] = DFT(table[i1]);
    }

    // 3b. БПФ по строкам (n1)
    let temp = Array.from({ length: N2 }, () => new Array(N1));
    for (let k2 = 0; k2 < N2; k2++) {
        let col = [];
        for (let i1 = 0; i1 < N1; i1++) col.push(table[i1][k2]);
        let colFFT = DFT(col);
        for (let k1 = 0; k1 < N1; k1++) temp[k2][k1] = colFFT[k1];
    }

    // 4. Вычисляем выходные индексы
    let output = new Array(N);
    for (let k1 = 0; k1 < N1; k1++) {
        for (let k2 = 0; k2 < N2; k2++) {
            const k = mod(k1 * N2 + k2 * N1, N);
            output[k] = temp[k2][k1];
        }
    }

    return output;
}

// ---------------- Vue-переменные ----------------
const N1 = ref(3);
const N2 = ref(4);
const inputText = ref("1,2,3,4,5,6,7,8,9,10,11,12");
const method = ref("");
const inputN2Class = ref('param-input')
const inputTextClass = ref('param-input')

const N = computed(() => N1.value * N2.value);

const parsedInput = computed(() =>
    inputText.value.split(",").map(x => new Complex(parseFloat(x.trim()) || 0, 0))
);

const output = computed(() => {
    try {
        const res = GoodThomasFFT(parsedInput.value, N1.value, N2.value);
        method.value = `Метод Гуда–Томаса (${N1.value} × ${N2.value})`;
        return res;
    } catch (e) {
        method.value = e.message;
        return [];
    }
});
</script>

<template>
    <div class="panel">
        <h2>Алгоритм Гуда–Томаса БПФ</h2>

        <div class="params">
            <h3>Параметры:</h3>

            <!-- Ввод N1, N2 -->
            <div class="param">
                <div class="param-row small">
                    <div class="param-label">Введите N₁ и N₂</div>
                    <div class="param-range">взаимно простые числа</div>
                </div>
                <div class="param-row big">
                    <input v-model.number="N1" class="param-input small-input" placeholder="N1">
                    <input v-model.number="N2" :class="inputN2Class" class="small-input" placeholder="N2">
                </div>
            </div>

            <!-- Вывод N -->
            <div class="param">
                <div class="param-row small">
                    <div class="param-label">Размер N</div>
                    <div class="param-range">N = N₁ × N₂</div>
                </div>
                <div class="big">
                    <div class="param-ans">{{ N }}</div>
                </div>
            </div>

            <!-- Ввод массива -->
            <div class="param">
                <div class="param-row small">
                    <div class="param-label">Входные отсчёты</div>
                    <div class="param-range">через запятую ({{ N }} элементов)</div>
                </div>
                <div class="param-row big">
                    <input v-model="inputText" :class="inputTextClass" class="width-line" />
                </div>
            </div>

            <!-- Метод -->
            <div class="param">
                <div class="param-row small">
                    <div class="param-label">Использованный метод</div>
                    <div class="param-range">или возникшие ошибки</div>
                </div>
                <div class="big">
                    <div class="param-ans width-line">{{ method }}</div>
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

.panel {
    margin-top: 2rem;
}
/* Первая строка */
.param-row.small {
    font-size: 0.8rem;
    color: #aaa;
}

.small-input {
    width: 3rem;
    margin: 0 0.4rem;
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
    width: 15rem;
    text-align: end;
    padding: 6px 4px;
}

.width-line {
    width: 18rem;
    font-size: 0.8rem;
    text-align: end;
}

</style>
