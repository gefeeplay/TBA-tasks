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

</style>