<script setup>
import Menu from './components/Menu.vue'
import ParticlesCon from './export_components/ParticlesCon.vue';
</script>

<template>
  <div class="particles-container">
    <ParticlesCon
      :particle-count="200"
      :particle-spread="20"
      :speed="0.1"
      :particle-colors="['#969696']"
      :move-particles-on-hover="false"
      :particle-hover-factor="1"
      :alpha-particles="false"
      :particle-base-size="100"
      :size-randomness="1"
      :camera-distance="5"
      :disable-rotation="false"
      class="w-full h-full"
    />
  </div>
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
  width: 100%;
  display: flex;
  align-items: center;  
  justify-content: center; 
}

.menu-cell {
  display: flex;
}

.particles-container {
  width: 100%;
  height: 100vh;
  position: fixed;
  overflow: hidden;
  background: #000;
  z-index: -1;
}
</style>
