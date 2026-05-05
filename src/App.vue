<script setup lang="ts">
// App.vue - Conteneur principal avec router-view
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* Styles globaux si nécessaire */
#app {
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Reset des styles de base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f5f5f5;
}
</style>
