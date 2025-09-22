<script setup>
import Menu from './components/Menu.vue'
</script>

<template>
  <div class="view">
    <div class="menu-cell">
      <Menu />
    </div>
    <div class="router-cell">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.view {
  display: grid;
  grid-template-columns: 250px 1fr; 
  height: 100vh;  
}

.router-cell {
  display: flex;
  align-items: center;  
  justify-content: center; 
}
.menu-cell {
  display: flex;
}
</style>
