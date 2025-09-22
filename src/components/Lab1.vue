<script setup>
import { ref, watch } from 'vue'

const number = ref(0)
const modules = ref([])
const answer = ref(null)
const inputClass = ref('param-input')

/** Функция для расчета остатков по модулям */
function lab1(number, modules) {
    return modules.map(m => number % m);
}

function check_number(val) {
  if (!Number.isInteger(val) || val < 0) {
    inputClass.value = 'param-input out-of-range'
    return false
  }
  inputClass.value = 'param-input'
  return true
}

/** Проверка взаимной простоты (НОД = 1) */
function gcd(a, b) {
  while (b) {
    [a, b] = [b, a % b]
  }
  return a
}

/** Автоматическая генерация массива взаимно простых чисел,
 * пока произведение модулей < number
 **/
function auto_modules(number) {
    const result = []
  let product = 1
  let candidate = 2 // начинаем с 2 (простые числа идут подряд)

  while (product <= number) {
    let ok = true
    for (let r of result) {
      if (gcd(candidate, r) !== 1) {
        ok = false
        break
      }
    }
    if (ok) {
      result.push(candidate)
      product *= candidate
    }
    candidate++
  }

  return result
}

/** Следим за изменением number → пересчитываем */
watch(number, (newVal) => {
  if (check_number(newVal)) {
    modules.value = auto_modules(newVal)
    answer.value = lab1(newVal, modules.value)
  } else {
    modules.value = []
    answer.value = null
  }
})

</script>

<template>
<div class="panel">
  <h2>Непозиционное кодирование сигналов</h2>
  
  <div class="params">
    <h3>Параметры:</h3>

    <!-- Число -->
    <div class="param">
      <div class="param-row small">
        <div class="param-label">Ограничения</div>
        <div class="param-range">Целое, неотрицательное</div>
      </div>
      <div class="param-row big">
        <div class="param-title">
          <span class="material-symbols-outlined" style="font-size: 1rem;">calculate</span>
          Число
        </div>
        <input v-model.number="number" :class="inputClass" type="number"/>
      </div>
    </div>

    <!-- Модули -->
    <div class="param">
      <div class="param-row small">
        <div class="param-label">Взаимно простые</div>
        <div class="param-range">Подбираются автоматически</div>
      </div>
      <div class="param-row big">
        <div class="param-title">
          <span class="material-symbols-outlined" style="font-size: 1rem;">data_object</span>
          Модули
        </div>
        <div class="param-ans">{{ modules }}</div>
      </div>
    </div>

    <!-- Ответ -->
    <h3>Ответ:</h3>
    <div class="param">
      <div class="param-row small">
        <div class="param-label">Массив чисел</div>
        <div class="param-range">Длина равна количеству модулей</div>
      </div>
      <div class="param-row big">
        <div class="param-title">
          <span class="material-symbols-outlined" style="font-size: 1rem;">sync</span>
          Число в остаточных классах
        </div>
        <div class="param-ans">{{ answer }}</div>
      </div>
    </div>
  </div>
</div>
</template>


<style scoped>

h3 {
    text-align: start;
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 20px;
  width: 600px;
  padding: 20px;
  background-color: rgba(23, 23, 23, 0.6);
  color: rgb(200, 200, 200);
  box-shadow: 5px 5px 10px rgba(97, 97, 97, 0.2);
}

.params {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
}

.param {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 12px 15px;
  border: 1px solid rgba(97, 97, 97, 0.3);
  border-radius: 15px;
  background: rgba(40, 40, 40, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.param:hover {
  transform: translateY(-5px);
  box-shadow: 2px 4px 5px rgba(97, 97, 97, 0.2);
}

.param-input.out-of-range {
  color: red;
  border: 1px solid rgb(167, 67, 67);
}

/* Строки */
.param-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Первая строка */
.param-row.small {
  font-size: 0.8rem;
  color: #aaa;
}

/* Вторая строка */
.param-row.big {
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


.param-input {
  padding: 8px 4px;
  border-radius: 10px;
  border: 1px solid rgba(97, 97, 97, 0.3);
  background: rgba(60, 60, 60, 0.6);
  color: white;
  font-family: "Comfortaa", "Open Sans", sans-serif;
  font-weight: bold;
  font-size: 1rem;
  width: 11rem;
  text-align: end;
}

.param-input::-webkit-inner-spin-button,
.param-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.param-ans {
  padding: 8px 4px;
  border-radius: 10px;
  border: 1px solid rgba(97, 97, 97, 0.3);
  background: rgba(60, 60, 60, 0.6);
  color: white;
  font-family: "Comfortaa", "Open Sans", sans-serif;
  font-weight: bold;
  width: 11rem;
  height: 1rem;
  text-align: end;
}

/* Кнопка */
.start-btn {
  margin-top: 1.5rem;
  border: 1px solid rgba(97, 97, 97, 0.3);
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  background: rgba(60, 60, 60, 0.6);
  transition: 0.2s;
}
.start-btn:hover {
  background: rgba(100, 100, 100, 0.6);
  color: white;
}
</style>