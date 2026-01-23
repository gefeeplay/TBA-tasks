<script setup>

</script>

<template>
    <div class="panel">
        <h2>Алгоритм БПФ по основанию 2</h2>

        <div class="params">
            <h3>Параметры:</h3>

            <!-- Ввод массива -->
            <div class="param">
                <div class="param-row small">
                    <div class="param-label">Входные отсчёты</div>
                    <div class="param-range">через запятую ({{ N }} элементов)</div>
                </div>
                <div class="param-row right-side">
                    <input v-model="inputText" :class="inputTextClass" class="param-input width-line" />
                </div>
            </div>

            <!-- Вывод N -->
            <div class="param">
                <div class="param-row small">
                    <div class="param-label">Первоначальный размер N</div>
                    <div class="param-range">Степень двойки</div>
                </div>
                <div class="param-row big">
                    <div class="param-ans">{{ userN }}</div>
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
</style>