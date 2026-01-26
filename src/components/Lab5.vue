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

// комплексный экспоненциальный множитель для ДПФ
function twiddleDFT(k, n, N) {
    const angle = -2 * Math.PI * k * n / N;
    return new Complex(Math.cos(angle), Math.sin(angle));
}

const inputText = ref("1,2,3,4,5,6,7,8");
const N = ref(8); // размер ДПФ
const fileExist = ref(false);

//Введенный массив
const parsedInput = computed(() =>
    inputText.value.split(",").map(x => new Complex(parseFloat(x.trim()) || 0, 0))
);

//Алгоритм ДПФ (одномерный поразрядный метод)
function dft(input, sizeN) {
    const result = [];

    // Для каждого частотного индекса k
    for (let k = 0; k < sizeN; k++) {
        let sum = new Complex(0, 0);

        // Суммируем по всем временным отсчётам n
        for (let n = 0; n < sizeN; n++) {
            // Берём входной отсчёт (если есть) или ноль
            const x_n = n < input.length ? input[n] : new Complex(0, 0);

            // Вычисляем поворотный множитель W_N^(kn) = e^(-j*2π*k*n/N)
            const w = twiddleDFT(k, n, sizeN);

            // Добавляем к сумме: x[n] * W_N^(kn)
            sum = sum.add(w.mul(x_n));
        }

        result.push(sum);
    }

    return result;
}

//Расчет
const output = computed(() => {
    if (!parsedInput.value.length || !N.value || N.value <= 0) return [];
    return dft(parsedInput.value, N.value);
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
                    <div class="param-row big">
                        <input v-model.number="N" type="number" min="1" class="param-input" />
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


        <div class="help-panel">
            <h3>Использование:</h3>
            <!-- Замечания -->
            <div class="param-text">
                <div class="text-line">
                    <Icon icon="flowbite:caret-right-solid" class="icon-wrap" />
                    Для сигналов с небольшим числом отсчетов подойдет ручной ввод массива.
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
                    Размер N определяет количество отсчётов для вычисления ДПФ.
                </div>

                <div class="text-line">
                    <Icon icon="flowbite:caret-right-solid" class="icon-wrap" />
                    Если входных отсчётов меньше N, недостающие значения считаются нулями.
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
