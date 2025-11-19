<script setup> 
import { ref, watch } from 'vue'

const number = ref(0)
const modules = ref([])         // итоговый массив (авто или ручной)
const userModules = ref('')     // строка для пользовательского ввода
const showInput = ref(false)    // флаг: отображать инпут или нет
const inputMode = ref('Автоматический подбор') 
const answer = ref(null)
const inputClass = ref('param-input')
const inputClassOfModules = ref('param-input')

/** Расчёт остатков */
function lab1(number, modules) {
  return modules.map(m => number % m);
}

/** Проверка числа */
function check_number(val) {
  if (!Number.isInteger(val) || val < 0) {
    inputClass.value = 'param-input out-of-range'
    return false
  }
  inputClass.value = 'param-input'
  return true
}

/** НОД */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b]
  return a
}

/** Проверка взаимной простоты массива модулей */
function checkCoprime(mods) {
  for (let i = 0; i < mods.length; i++) {
    for (let j = i + 1; j < mods.length; j++) {
      if (gcd(mods[i], mods[j]) !== 1) {
        return false
      }
    }
  }
  return true
}

/** Проверка, что произведение модулей больше введённого числа */
function checkProduct(mods, num) {
  const product = mods.reduce((acc, m) => acc * m, 1)
  return product > num
}

/** Автоподбор взаимно простых модулей */
function auto_modules(number) {
  const result = []
  let product = 1
  let candidate = 2

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

/** Переключение между вводом и авто */
function toggleInput() {
  showInput.value = !showInput.value
  inputMode.value = showInput.value ? 'Ручной ввод' : 'Автоматический подбор'

  if (!showInput.value && number.value > 0) {
    modules.value = auto_modules(number.value)
    answer.value = lab1(number.value, modules.value)
  } else {
    userModules.value = ''
  }
}

/** Обработка пользовательского ввода модулей */
watch(userModules, (newVal) => {
  if (showInput.value && newVal.trim() !== '') {
    const parsed = newVal
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n > 0)
    inputClassOfModules.value = 'param-input'

    // Проверка взаимной простоты
    if (!checkCoprime(parsed)) {
      inputClassOfModules.value = 'param-input out-of-range'
      modules.value = []
      answer.value = null
      return
    }

    // Проверка произведения
    if (!checkProduct(parsed, number.value)) {
      inputClassOfModules.value = 'param-input out-of-range'
      modules.value = []
      answer.value = null
      return
    }

    modules.value = parsed
    if (parsed.length > 0 && number.value > 0) {
      answer.value = lab1(number.value, parsed)
    }
  }
})

/** Автоматический пересчёт при изменении числа */
watch(number, (newVal) => {
  if (check_number(newVal)) {
    if (!showInput.value) {
      modules.value = auto_modules(newVal)
      answer.value = lab1(newVal, modules.value)
    } else if (userModules.value.trim() !== '') {
      const parsed = userModules.value
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n))
      if (!checkCoprime(parsed) || !checkProduct(parsed, newVal)) {
        inputClassOfModules.value = 'param-input out-of-range'
        modules.value = []
        answer.value = null
        return
      }
      answer.value = lab1(newVal, parsed)
    }
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
        <div class="param-range">{{inputMode}}</div>
      </div>
      <div class="param-row big">
        <div class="param-title">
          <span class="material-symbols-outlined" style="font-size: 1rem;">data_object</span>
          Модули
        </div>

        <div class="ans-btn">
          <span class="material-symbols-outlined btn" @click="toggleInput">draw</span>

          <!-- Если showInput = true → поле ввода -->
          <div class="ans-btn" v-if="showInput">
            <input
              v-model="userModules"
              :class="inputClassOfModules"
              placeholder="Введите через запятую"
            />
          </div>

          <!-- Иначе просто вывод -->
          <div v-else>
            <div class="param-ans">{{ modules }}</div>
          </div>
        </div>
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
        <div class="param-ans"> {{ answer }}</div>
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

.param-row-with-btn {
  display: flex;
  align-items: center;
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

.param-title.with-btn {
  display: flex;
  
}

.param-title {
  font-weight: 600;
}
.param-label {
  padding: 6px 10px;
}
.param-range {
  width: 15rem;
  text-align: end;
  padding: 6px 4px;
}

.param-ans {
  width: 15rem;
}

.ans-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem; 
}

.btn {
  border: 1px solid rgba(97, 97, 97, 0.3);
  border-radius: 1.5rem;
  font-size: 1rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn:hover{
  cursor: pointer;
  color: #91d28c;
}
</style>
