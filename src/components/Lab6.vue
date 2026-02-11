<script setup>
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import { onFileChange as handleFileChange } from "../utils/fileHandlers.js";

//Модульные вычисления
function mod(a, m) {
    return ((a % m) + m) % m;
}

function modAdd(a, b, m) {
    return mod(a + b, m);
}

function modSub(a, b, m) {
    return mod(a - b, m);
}

function modMul(a, b, m) {
    return mod(a * b, m);
}

function modPow(base, exp, m) {
    let result = 1;
    base = mod(base, m);
    while (exp > 0) {
        if (exp & 1) result = modMul(result, base, m);
        base = modMul(base, base, m);
        exp >>= 1;
    }
    return result;
}

//Перестановка битов (обратная)
function modInverse(a, m) {
    let m0 = m, x0 = 0, x1 = 1;

    if (m === 1) return 0;

    while (a > 1) {
        let q = Math.floor(a / m);
        [a, m] = [m, a % m];
        [x0, x1] = [x1 - q * x0, x0];
    }

    if (x1 < 0) x1 += m0;
    return x1;
}

//КТО для восстановления
function crt(residues, moduli) {
    const M = moduli.reduce((acc, m) => acc * m, 1);
    let result = 0;

    for (let i = 0; i < moduli.length; i++) {
        const Mi = M / moduli[i];
        const inv = modInverse(Mi, moduli[i]);
        result += residues[i] * Mi * inv;
    }

    return mod(result, M);
}

// Поиск примитивного корня
function findPrimitiveRoot(N, m) {
    for (let g = 2; g < m; g++) {
        if (modPow(g, N, m) === 1) {
            let valid = true;
            for (let k = 1; k < N; k++) {
                if (modPow(g, k, m) === 1) {
                    valid = false;
                    break;
                }
            }
            if (valid) return g;
        }
    }
    return null;
}

//БПФ radix-8 DIF
function fftRadix8_DIF(x, m, root) {

    const N = x.length;
    const a = x.slice();

    let stageSize = N;

    while (stageSize >= 8) {

        const groupCount = N / stageSize;
        const step = N / stageSize;

        for (let g = 0; g < groupCount; g++) {

            const base = g * stageSize;

            for (let j = 0; j < stageSize / 8; j++) {

                const i0 = base + j;
                const i1 = i0 + stageSize / 8;
                const i2 = i0 + 2 * stageSize / 8;
                const i3 = i0 + 3 * stageSize / 8;
                const i4 = i0 + 4 * stageSize / 8;
                const i5 = i0 + 5 * stageSize / 8;
                const i6 = i0 + 6 * stageSize / 8;
                const i7 = i0 + 7 * stageSize / 8;

                const x0 = a[i0];
                const x1 = a[i1];
                const x2 = a[i2];
                const x3 = a[i3];
                const x4 = a[i4];
                const x5 = a[i5];
                const x6 = a[i6];
                const x7 = a[i7];

                // Первая стадия сложений
                const s0 = modAdd(x0, x4, m);
                const s1 = modAdd(x1, x5, m);
                const s2 = modAdd(x2, x6, m);
                const s3 = modAdd(x3, x7, m);

                const d0 = modSub(x0, x4, m);
                const d1 = modSub(x1, x5, m);
                const d2 = modSub(x2, x6, m);
                const d3 = modSub(x3, x7, m);

                // Вторая стадия
                a[i0] = modAdd(s0, s2, m);
                a[i2] = modSub(s0, s2, m);
                a[i1] = modAdd(s1, s3, m);
                a[i3] = modSub(s1, s3, m);

                const t0 = modAdd(d0, d2, m);
                const t2 = modSub(d0, d2, m);
                const t1 = modAdd(d1, d3, m);
                const t3 = modSub(d1, d3, m);

                // Корни
                const w1 = modPow(root, j * step, m);
                const w2 = modPow(root, 2 * j * step, m);
                const w3 = modPow(root, 3 * j * step, m);
                const w4 = modPow(root, 4 * j * step, m);
                const w5 = modPow(root, 5 * j * step, m);
                const w6 = modPow(root, 6 * j * step, m);
                const w7 = modPow(root, 7 * j * step, m);

                a[i4] = modMul(t0, w4, m);
                a[i5] = modMul(t1, w5, m);
                a[i6] = modMul(t2, w6, m);
                a[i7] = modMul(t3, w7, m);
            }
        }

        stageSize /= 8;
    }

    return a;
}

//vue
const inputText = ref("1,2,3,4,5,6,7,8");
const manualModuli = ref("");
const fileExist = ref(false);
const autoModuli = ref(true);
const inputMode = computed(() => autoModuli.value ? "Автоматический подбор" : "Ручной ввод")

const parsedInput = computed(() =>
    inputText.value
        .split(",")
        .map(x => parseInt(x.trim()))
        .filter(x => !isNaN(x))
);

const N = computed(() => parsedInput.value.length);
const log2N = computed(() => Math.log2(N.value));
const isValidRadix8 = computed(() =>
    N.value > 0 &&
    (N.value & (N.value - 1)) === 0 &&
    log2N.value % 3 === 0
);

const errorStyle = computed(() => {
    return (isValidRadix8.value) ? 'param-input' : 'param-input out-of-range'
})
const errorMessage = ref("Элементы через запятую");

function generateDefaultModuli() {
    return [17, 257, 65537];
}

const moduli = computed(() => {
    if (autoModuli.value) return generateDefaultModuli();
    return manualModuli.value
        .split(",")
        .map(x => parseInt(x.trim()))
        .filter(x => !isNaN(x));
});

const output = computed(() => {

    if (!isValidRadix8.value) {
        errorMessage.value = "N должно быть степенью 8 (log2(N) кратно 3)";
        alert("Длина должна быть степенью 8 (8^m)");
        return [];
    }

    errorMessage.value = "Элементы через запятую";

    const roots = moduli.value.map(m =>
        findPrimitiveRoot(N.value, m)
    );

    const residues = moduli.value.map(m =>
        parsedInput.value.map(x => mod(x, m))
    );

    const tStart = performance.now();

    const channelResults = residues.map((channel, i) =>
        fftRadix8_DIF(channel, moduli.value[i], roots[i])
    );

    const tEnd = performance.now();
    console.log(
        `БПФ в СОК (N=${N.value} за ${(tEnd - tStart).toFixed(4)} мс`
    );

    const result = [];

    for (let k = 0; k < N.value; k++) {

        const rk = channelResults.map(ch => ch[k]);

        result.push({
            residues: rk,
            reconstructed: crt(rk, moduli.value)
        });
    }

    return result;
});

function isRadix8(x) {
    return x > 0 && (x & (x - 1)) === 0 && Math.log2(x) % 3 === 0
}

//Чтение с файла
function onFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
        alert("Поддерживаются только .txt файлы");
        return;
    }

    fileExist.value = true;

    const reader = new FileReader();

    reader.onload = e => {
        const text = e.target.result;

        // разбиваем по запятым и переводам строки
        const values = text
            .split(/[\s,]+/)
            .map(v => parseFloat(v))
            .filter(v => !isNaN(v));

        if (values.length === 0) {
            alert("Файл не содержит числовых данных");
            fileExist.value = false;
            return;
        }

        if (!isRadix8(values.length)) {
            console.log("Ошибка")
            alert("N должно быть степенью 8 (log2(N) кратно 3)" + "\n" + "Возможные варианты: 8, 64, 4096");
            fileExist.value = false;
            return;
        }

        // обновляем inputText → всё остальное пересчитается автоматически
        inputText.value = values.join(",");

    };

    reader.readAsText(file);
}

function downloadFile() {

    let text = "k\t" +
        moduli.value.map(m => `mod ${m}`).join("\t") +
        "\tCRT\n";

    output.value.forEach((row, i) => {
        text += i + "\t" +
            row.residues.join("\t") +
            "\t" +
            row.reconstructed +
            "\n";
    });

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fft_rns_N${N.value}.txt`;
    link.click();
}

</script>

<template>
    <div class="page">
        <div class="panel">
            <h2>БПФ по основанию 2 в СОК (NTT)</h2>

            <div class="params">

                <h3>Параметры:</h3>
                <div class="param">
                    <div class="param-row small">
                        <div class="param-label">Входные отсчёты</div>
                        <div v-if="!fileExist" class="param-range">{{ errorMessage }}</div>
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

                        <input v-if="!fileExist" v-model="inputText" :class="errorStyle" class="width-line" />
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


                <div class="param">
                    <div class="param-row small">
                        <div class="param-label">Взаимно простые</div>
                        <div class="param-range">{{ inputMode }}</div>
                    </div>
                    <div class="param-row big">
                        <div class="param-title">
                            <Icon icon="ic:round-data-array" width="20" height="20" />
                            Модули
                        </div>

                        <div class="ans-btn">
                            <span class="material-symbols-outlined btn" @click="autoModuli = !autoModuli">draw</span>

                            <div class="ans-btn" v-if="!autoModuli">
                                <input v-model="manualModuli" class="param-input" placeholder="Введите через запятую" />
                            </div>

                            <!-- Иначе просто вывод -->
                            <div v-else>
                                <div class="param-ans">{{ moduli }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Результат -->
                <h3>Результат ДПФ:</h3>

                <table v-if="!fileExist" border="1" cellpadding="4" class="answ-table">
                    <thead>
                        <tr>
                            <th>k</th>
                            <th v-for="m in moduli" :key="m">
                                mod {{ m }}
                            </th>
                            <th>CRT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, i) in output" :key="i">
                            <td>{{ i }}</td>

                            <td v-for="(val, j) in row.residues" :key="j">
                                {{ val }}
                            </td>
                            <td>{{ row.reconstructed }}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="file-btn" style="width: 9rem; margin-top:1rem;" @click="downloadFile">
                    <Icon icon="ic:round-download" width="24" height="24" />
                    Скачать файл
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
    justify-content: center;
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

.param-title {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 6px 10px;
    border: 1px solid rgba(97, 97, 97, 0.3);
    border-radius: 8px;
    max-width: 15rem;
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

.btn {
    border: 1px solid rgba(97, 97, 97, 0.3);
    border-radius: 1.8rem;
    font-size: 1rem;
    width: 1.8rem;
    height: 1.8rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.btn:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>