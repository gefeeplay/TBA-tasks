<script setup>
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import { onFileChange as handleFileChange, downloadFile as handleDownloadFile } from "../utils/fileHandlers.js";

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

// комплексный экспоненциальный множитель
function twiddle(k, N) {
    const angle = -2 * Math.PI * k / N;
    return new Complex(Math.cos(angle), Math.sin(angle));
}

// битовый разворот индекса
function bitReverse(x, bits) {
    let y = 0;
    for (let i = 0; i < bits; i++) {
        y = (y << 1) | (x & 1);
        x >>= 1;
    }
    return y;
}

const N0 = computed(() => parsedInput.value.length); // исходное число отсчётов
const N = computed(() => Math.pow(2, m.value)); //Итоговое кол-во отсчетов
const m = computed(() => Math.ceil(Math.log2(N0.value || 1))); // степень двойки
const zeros = computed(() => N.value - N0.value); // количество добавленных нулей
const inputText = ref("1,2,3,4,5,6,7,8");

const fileExist = ref(false);

//Введенный массив
const parsedInput = computed(() =>
    inputText.value.split(",").map(x => new Complex(parseFloat(x.trim()) || 0, 0))
);

// массив с нулевым дополнением
const paddedInput = computed(() => {
    const arr = parsedInput.value.slice();
    while (arr.length < N.value) {
        arr.push(new Complex(0, 0));
    }
    return arr;
});

//Алгоритм
function fftRadix2(input) {
    const n = input.length;
    const stages = Math.log2(n);

    // --- перестановка битовым разворотом ---
    const a = new Array(n);
    for (let i = 0; i < n; i++) {
        const j = bitReverse(i, stages);
        a[j] = input[i];
    }

    // --- стадии бабочек ---
    for (let s = 1; s <= stages; s++) {
        const m = 1 << s;
        const m2 = m >> 1;

        for (let k = 0; k < n; k += m) {
            for (let j = 0; j < m2; j++) {
                const w = twiddle(j, m);
                const t = w.mul(a[k + j + m2]);
                const u = a[k + j];

                a[k + j] = u.add(t);
                a[k + j + m2] = u.sub(t);
            }
        }
    }

    return a;
}

//Расчет
const output = computed(() => {
    if (!paddedInput.value.length) return [];
    return fftRadix2(paddedInput.value);
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
        <h2>Алгоритм БПФ по основанию 2</h2>

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

                    <input v-if="!fileExist" v-model="inputText" :class="inputTextClass"
                        class="param-input width-line" />
                </div>
            </div>

            <!-- Вывод N -->
            <div class="param">
                <div class="param-row small">
                    <div class="param-label">Первоначальный размер N</div>
                    <div class="param-range">Степень двойки</div>
                </div>
                <div class="param-row big">
                    <div class="param-ans">{{ N0 }}</div>
                    <div class="param-ans">{{ m }}</div>
                </div>
            </div>

            <!-- Нули -->
            <div class="param">
                <div class="param-row small">
                    <div class="param-label">Добавлено нулей</div>
                    <div class="param-range">Итоговый размер N</div>
                </div>
                <div class="param-row big">
                    <div class="param-ans">{{ zeros }}</div>
                    <div class="param-ans">{{ N }}</div>
                </div>
            </div>

            <!-- Ответ -->
            <h3>Результат FFT:</h3>
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


    <div class="help-panel">
        <h3>Использование:</h3>
        <!-- Замечания -->
        <div class="param-text">
            <div class="text-line">
                <Icon icon="flowbite:caret-right-solid" class="icon-wrap" />
                Для сигналов с 16 и менее отсчетов подойдет ручной ввод массива.
            </div>

            <div class="text-line">
                <Icon icon="flowbite:caret-right-solid" class="icon-wrap" />
                Для сигналов с большим числом отсчетов рекомендуется использовать ввод файлом.
            </div>

            <div class="text-line">
                <Icon icon="flowbite:caret-right-solid" class="icon-wrap" />
                Форматы файла:
            </div>

            <div class="text-line" style="justify-content: space-around;">
                <div class="example-con">
                    Через запятую:
                    <div class="example">
                        1.2, 3.5, -0.8, 4, 5
                    </div>
                </div>
                <div class="example-con">
                    В столбец:
                    <div class="example">
                        1.2<br>3.5<br>-0.8<br>4<br>5
                    </div>
                </div>
            </div>

            <div class="text-line">
                <Icon icon="flowbite:caret-right-solid" class="icon-wrap" />
                Для удобства вы сможете скачать файл с полученным результатом
            </div>

            <div class="text-line">
                <Icon icon="flowbite:caret-right-solid" class="icon-wrap" />
                Формат файла:
            </div>

            <div class="text-line">
                <div class="example-con">
                    В столбец:
                    <div class="example">
                        Re1 Im1<br>Re2 Im2<br>Re3 Im3<br>Re4 Im4<br>Re5 Im5
                    </div>
                </div>
            </div>
        </div>
    </div>
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

.text-line {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    padding: 5px;
}

.icon-wrap {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.icon-wrap svg {
    width: 100%;
    height: 100%;
    display: block;
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