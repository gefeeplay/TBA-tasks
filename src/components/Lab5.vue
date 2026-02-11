<script setup>
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import { onFileChange as handleFileChange, downloadFile as handleDownloadFile } from "../utils/fileHandlers.js";
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

function precomputeWeightSums(N, bitWidth) {
    const table = [];

    for (let k = 0; k < N; k++) {
        table[k] = [];
        for (let r = 0; r < bitWidth; r++) {
            table[k][r] = new Complex(0, 0);
        }
    }

    for (let k = 0; k < N; k++) {
        for (let n = 0; n < N; n++) {
            const w = twiddleDFT(k, n, N);
            for (let r = 0; r < bitWidth; r++) {
                // здесь пока только заготовка, заполнение будет по x_r
                table[k][r].w_n = table[k][r].w_n || [];
                table[k][r].w_n[n] = w;
            }
        }
    }

    return table;
}

const inputText = ref("1,2,3,4,5,6,7,8");
const N = computed(() => parsedInput.value.length);
const fileExist = ref(false);

//Введенный массив
const parsedInput = computed(() =>
    inputText.value.split(",").map(x => new Complex(parseFloat(x.trim()) || 0, 0))
);

//Алгоритм ДПФ (одномерный поразрядный метод)
function opdft(input, N, bitWidth = 8) {

    // Преобразуем вход в доп. код
    const x_tc = input.map(x => toTwosComplement(Math.round(x.re), bitWidth));

    const weights = precomputeWeightSums(N, bitWidth);

    const tStart = performance.now();

    const result = [];

    for (let k = 0; k < N; k++) {
        let Xk = new Complex(0, 0);

        for (let r = 0; r < bitWidth; r++) {
            let Cks = new Complex(0, 0);

            for (let n = 0; n < N; n++) {
                if (getBit(x_tc[n], r)) {
                    Cks = Cks.add(weights[k][r].w_n[n]);
                }
            }

            // учёт веса разряда
            Xk = Xk.add(Cks.scale(1 << r));
        }

        result.push(Xk);
    }

    const tEnd = performance.now();
    console.log(
        `ОПДПФ (N=${N}, bits=${bitWidth}) за ${(tEnd - tStart).toFixed(4)} мс`
    );

    return result;
}

//Расчет
const output = computed(() => {
    if (!parsedInput.value.length || !N.value || N.value <= 0) return [];
    return opdft(parsedInput.value, N.value, 8);
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
            <h2>Одномерный поразрядный метод вычисления ДПФ</h2>

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
                        <tr v-for="(c, i) in output" :key="i">
                            <td>{{ i }}</td>
                            <td>{{ c.re.toFixed(3) }}</td>
                            <td>{{ c.im.toFixed(3) }}</td>
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
