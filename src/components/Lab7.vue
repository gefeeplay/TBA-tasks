<script setup>
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import { onFileChange2D as handleFileChange, downloadFile as handleDownloadFile } from "../utils/fileHandlers.js";
import HelpPanel from "./HelpPanel.vue";

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

// комплексный экспоненциальный множитель для ДПФ
function twiddleDFT(k, n, N) {
    const angle = -2 * Math.PI * k * n / N;
    return new Complex(Math.cos(angle), Math.sin(angle));
}

function toTwosComplement(value, bits) {
    const max = 1 << bits;
    return value < 0 ? max + value : value;
}

function getBit(value, bit) {
    return (value >> bit) & 1;
}

function reshapeTo2D(values) {

    const N = values.length;

    const rows = Math.floor(Math.sqrt(N));
    const cols = Math.ceil(N / rows);

    const paddedSize = rows * cols;

    const padded = [...values];

    while (padded.length < paddedSize) {
        padded.push(0);
    }

    const matrix = [];

    for (let i = 0; i < rows; i++) {
        const row = padded.slice(i * cols, (i + 1) * cols);
        matrix.push(row);
    }

    return matrix;
}

/* ================= Одномерный поразрядный ДПФ ================= */
function opdft1D(input, bitWidth = 8) {

    const N = input.length;

    const x_tc = input.map(x =>
        toTwosComplement(Math.round(x.re), bitWidth)
    );

    const result = [];

    for (let k = 0; k < N; k++) {

        let Xk = new Complex(0, 0);

        for (let r = 0; r < bitWidth; r++) {

            let Cks = new Complex(0, 0);

            for (let n = 0; n < N; n++) {

                if (getBit(x_tc[n], r)) {
                    const w = twiddleDFT(k, n, N);
                    Cks = Cks.add(w);
                }
            }

            Xk = Xk.add(Cks.scale(1 << r));
        }

        result.push(Xk);
    }

    return result;
}

/* ================= 2D поразрядный ДПФ ================= */
function opdft2D(matrix, bitWidth = 8) {

    const rows = matrix.length;
    const cols = matrix[0].length;

    const tStart = performance.now();

    // 1) ДПФ по строкам
    const rowTransformed = [];

    for (let i = 0; i < rows; i++) {
        rowTransformed[i] = opdft1D(matrix[i], bitWidth);
    }

    // 2) ДПФ по столбцам
    const result = Array.from({ length: rows },
        () => new Array(cols));

    for (let j = 0; j < cols; j++) {

        const column = [];

        for (let i = 0; i < rows; i++) {
            column.push(rowTransformed[i][j]);
        }

        const columnDFT = opdft1D(column, bitWidth);

        for (let i = 0; i < rows; i++) {
            result[i][j] = columnDFT[i];
        }
    }

    const tEnd = performance.now();

    console.log(
        `2D ОПДПФ (${rows}×${cols}) за ${(tEnd - tStart).toFixed(4)} мс`
    );

    return result;
}

const inputText = ref("1,2,3,4,5,6,7,8");
const N = computed(() => parsed1D.value.length);
const fileExist = ref(false);

const parsed1D = computed(() => {

    return inputText.value
        .split(/[\s,;]+/)
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v));
});

/* ===== Автоматическое разбиение ===== */

const parsedMatrix = computed(() => {

    if (!parsed1D.value.length) return [];

    const matrixNumbers = reshapeTo2D(parsed1D.value);

    return matrixNumbers.map(row =>
        row.map(v => new Complex(v, 0))
    );
});

//Расчет
const output = computed(() => {
    if (!parsedMatrix.value.length) return [];

    return opdft2D(parsedMatrix.value, 8);
});

// Обратно в 1D - для вывода
const flatResult = computed(() => {

    if (!output.value.length) return [];

    const flat = [];

    let index = 0;

    for (let i = 0; i < output.value.length; i++) {
        for (let j = 0; j < output.value[i].length; j++) {
            flat.push({
                k: index++,
                re: output.value[i][j].re,
                im: output.value[i][j].im
            });
        }
    }

    return flat;
});

//Чтение с файла
function onFileChange(event) {
    handleFileChange(event, {
        fileExist,
        inputText,
        N
    });
}

//Создание файла с результатами
function downloadFile() {
    handleDownloadFile(output, N, "dft");
}

</script>

<template>
    <div class="page">
        <div class="panel">
            <h2>Многомерный поразрядный метод вычисления ДПФ</h2>

            <div class="params">

                <h3>Параметры:</h3>
                <!-- Ввод массива -->
                <div class="param">
                    <div class="param-row small">
                        <div class="param-label">Входные отсчёты</div>
                        <div v-if="!fileExist" class="param-range">Элементы через запятую</div>
                        <div v-else class="param-range">Файл загружен</div>
                    </div>
                    <div class="param-row right-side ans-btn">
                        <div class="file-upload">
                            <input type="file" id="fileInput" accept=".txt" @change="onFileChange" hidden />

                            <label v-if="!fileExist" for="fileInput" class="file-btn">
                                <Icon icon="ic:round-upload" width="24" height="24" />
                                <span>Загрузить</span>
                            </label>

                            <label v-if="fileExist" for="fileInput" class="file-btn">
                                <Icon icon="ic:round-done" width="24" height="24" />
                                <span>Загружено</span>
                            </label>
                        </div>

                        <input v-if="!fileExist" v-model="inputText" class="param-input width-line" />
                    </div>
                </div>

                <!-- Размер N -->
                <div class="param">
                    <div class="param-row small">
                        <div class="param-label">Размер N</div>
                        <div class="param-range">Количество отсчётов</div>
                    </div>
                    <div class="param-row big right-side">
                        <div class="param-ans">{{ N }}</div>
                    </div>
                </div>

                <!-- Ответ -->
                <h3>Результат ДПФ:</h3>
                <table v-if="!fileExist" border="1" cellpadding="4" class="answ-table">
                    <thead>
                        <tr>
                            <th>k</th>
                            <th>Re</th>
                            <th>Im</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in flatResult" :key="row.k">
                            <td>{{ row.k }}</td>
                            <td>{{ row.re.toFixed(3) }}</td>
                            <td>{{ row.im.toFixed(3) }}</td>
                        </tr>
                    </tbody>
                </table>

                <div v-else class="file-btn" style="width: 9rem;" @click="downloadFile">
                    <Icon icon="ic:round-download" width="24" height="24" />
                    Скачать файл
                </div>
            </div>
        </div>

        <HelpPanel />

    </div>
</template>

<style scoped>
.page {
    width: 100%;
    display: flex;
    gap: 2rem;
    justify-content: end;
    margin-right: 5rem;
}

.param-text {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 12px 15px;
    border: 1px solid rgba(97, 97, 97, 0.3);
    border-radius: 15px;
    background: rgba(40, 40, 40, 0.5);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.param-ans {
    width: 8rem;
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

/* Вторая строка */
.big {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    font-weight: 500;
}

.param-row.right-side {
    display: flex;
    justify-content: end;
}

.ans-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}
</style>
