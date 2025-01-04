<script setup>
  import IntroPage from './components/IntroPage.vue';
  import GamePage from './components/GamePage.vue';

  import { reactive, onMounted } from 'vue'

  const state = reactive({
    pageNm: 'intro',
    gameConfig: {}
  });


  const gameStart = (data) => {
    if(!data) return;
    state.pageNm = 'game';
    state.gameConfig = data;


    //아래 임시
    state.gameConfig = {
        nums: 111,
        answer: 3
    };
  }

  onMounted(() => {
    const url = window.location;
    if(url.search.indexOf('nums') > -1 && url.search.indexOf('answer') > -1){
      const dataObj = {};
      const keyValueArr = url.search.slice(1).split('&');
      keyValueArr.forEach(el => {
        const keyValue = el.split('=');

        dataObj[keyValue[0]] = keyValue[1]; 
      })



      state.gameConfig = dataObj;
      state.pageNm = 'game';
    }
  })
</script>

<template>
  <IntroPage @gameStart="gameStart" v-if="state.pageNm === 'intro'" />
  <GamePage v-else-if="state.pageNm === 'game'" :gameConfig="state.gameConfig" />
</template>

<style scoped>
</style>
