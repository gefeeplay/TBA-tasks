<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeLab = ref(null)

const goToLab = (labName) => {
    activeLab.value = labName
    switch (labName) {
        case 'Lab1':
            router.push('/TBA-tasks')
            break
        case 'Lab2':
            router.push('/TBA-tasks/Lab2')
            break
        case 'Lab3':
            router.push('/TBA-tasks/Lab3')
            break
        case 'Lab4':
            router.push('/TBA-tasks/Lab4')
            break
        case 'Lab5':
            router.push('/TBA-tasks/Lab5')
            break
    }
}
</script>

<template>
    <div class="info">Список лабораторных:</div>
    <div class="list">
        <div class="list-item" :class="{ active: activeLab === 'Lab1' }" @click="goToLab('Lab1')">
            Лабораторная 1
        </div>

        <div class="list-item" :class="{ active: activeLab === 'Lab2' }" @click="goToLab('Lab2')">
            Лабораторная 2
        </div>

        <div class="list-item" :class="{ active: activeLab === 'Lab3' }" @click="goToLab('Lab3')">
            Лабораторная 3
        </div>

        <div class="list-item" :class="{ active: activeLab === 'Lab4' }" @click="goToLab('Lab4')">
            Лабораторная 4
        </div>

        <div class="list-item" :class="{ active: activeLab === 'Lab5' }" @click="goToLab('Lab5')">
            Лабораторная 5
        </div>
    </div>
    <div class="info me">
        Выполнил: Моляров М. Л. <br/>
        ИВТ-11-22
    </div>
</template>

<style scoped>
.info {
    padding-top: 2.5rem;
    position: fixed;
    width: 250px;
    text-align: center;
}
.me {
    box-sizing: border-box;
    text-align: end;
    bottom: 1rem;
    padding-right: 1rem;
}
.list {
    padding-left: 25px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    border-right: 1px solid rgba(97, 97, 97, 0.3);
}

.list-item {
    border-radius: 10px;
    border: 1px solid rgba(97, 97, 97, 0.3);
    width: 10rem;
    padding: 1rem;
    transition: width 0.3s ease;
}

.list-item:hover {
    width: 11rem;
    cursor: pointer;
}

.list-item.active {
  width: 11rem;
  background: rgba(97, 97, 97, 0.1);
  border-color: rgba(97, 97, 97, 0.8);
}
</style>