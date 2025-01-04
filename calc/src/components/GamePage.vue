<script setup>
  import { defineProps, reactive } from 'vue';
  const props = defineProps({
    gameConfig: {
      type: Object,
      required: true
    },
  });

  const state = reactive({
    nums: '',
    answer: '',
  });

  const getRandomNum = (mn, mx) => Math.floor(Math.random() * (mx - mn + 1)) + mn;
  // const nums = '1234567890';  
  const nums = '123456789';    //일단 0 뺌
  const oprs = '+-*/';


  console.log(props.gameConfig);
  if(props.gameConfig && props.gameConfig.nums !== undefined && props.gameConfig.answer !== undefined){
    state.nums = props.gameConfig.nums;
    state.answer = props.gameConfig.answer;
  }


</script>

<template>
  <aside id="recalCnt" class="recal-cnt">0</aside>
  <main>
      <h2 id="finalValue">{{ state.answer }}</h2>
      <p>
          아래 주어진 숫자카드와 연산자카드를 조합해서<br>
          위의 숫자를 만들어주세요.
          <strong>*모든 숫자를 사용할 것<br>*숫자가 10을 넘을 수 있음</strong>
      </p>
      <ul id="calcBoard" class="calc-board"></ul>
      <h2 id="myValue" class="my-value"></h2>
  </main>
  <footer>
      <fieldset>
          <legend>연산자</legend>
          <ul id="oprList" class="opr-list">
              <li data-id="+" data-type="opr">➕</li>
              <li data-id="-" data-type="opr">➖</li>
              <li data-id="*" data-type="opr">✖️</li>
              <li data-id="/" data-type="opr">➗</li>
          </ul>
      </fieldset>
      <fieldset>
          <legend>숫자</legend>
          <ul id="numList" class="num-list">
            <li v-for="(num, idx) in String(state.nums).split('')" :key="idx">{{ num }}</li>
          </ul>
      </fieldset>
      <div class="btns">
          <button id="init">초기화</button>
          <button id="submit">제출</button>
      </div>
  </footer>
</template>

<style scoped lang="scss">
</style>
