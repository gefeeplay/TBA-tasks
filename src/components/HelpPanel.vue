<script setup>
import { Icon } from '@iconify/vue';
</script>

<template>
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
</template>

<style scoped>

.param-text {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-top: 10px;
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
</style>