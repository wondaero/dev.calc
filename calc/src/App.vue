<script setup>
  import IntroPage from './components/IntroPage.vue';
  import GamePage from './components/GamePage.vue';

  import { ref, reactive, watch } from 'vue'

  const state = reactive({
    pageNm: 'intro',
    gameConfig: {}
  });


  const gameStart = (data) => {
    if(!data) return;
    state.pageNm = 'game';
    state.gameConfig = data;
  }
</script>

<template>
  <IntroPage @gameStart="gameStart" v-if="state.pageNm === 'intro'" />
  <GamePage @gameStart="gameStart" v-else-if="state.pageNm === 'game'" :gameConfig="state.gameConfig" />
</template>

<style scoped>
</style>
