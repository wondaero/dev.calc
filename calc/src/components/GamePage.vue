<script setup>
  import { reactive } from 'vue';
  const props = defineProps({
    gameConfig: {
      type: Object,
      required: true
    },
  });

  const state = reactive({
    nums: [],
    pickedCards: [],
    answer: '',
    oprs: [],
    numGroup: [],
    
  });

  const getRandomNum = (mn, mx) => Math.floor(Math.random() * (mx - mn + 1)) + mn;
  const rdmArr = (arr) => arr[getRandomNum(0, arr.length - 1)]; 
  // const nums = '1234567890';  
  const nums = '123456789';    //일단 0 뺌
  const oprs = '+-*/';
  const a2z = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const opr2symbol = {
    '+': '➕',
    '-': '➖',
    '*': '✖️',
    '/': '➗'
  }


  console.log(props.gameConfig);

  const setGroup = () => {
      state.numGroupArr = [];

      let tmpArr = JSON.parse(JSON.stringify(state.nums));

      while(tmpArr.length){
          // const cutLen = getRandomNum(1, props.gameConfig.randomDigitLen ? 10 : props.gameConfig.digitLen);
          const cutLen = getRandomNum(1, props.gameConfig.digitLen);
          state.numGroup.push(+tmpArr.slice(0, cutLen).map(n => n.char));
          tmpArr = tmpArr.slice(cutLen);
      }

      console.log(state.numGroup);
  }

  //create
  if(props.gameConfig && props.gameConfig.nums !== undefined && props.gameConfig.answer !== undefined){
    state.nums = String(props.gameConfig.nums).split('').map((n, idx) => ({idx: idx, num: n}));
    console.log(state);
    state.answer = props.gameConfig.answer;
  }else{

    for(let i = 0; i < props.gameConfig.numLen; i++){
      state.nums.push({
        char: rdmArr(nums),
        idx: i,
        type: 'num'
      });
    }
    state.oprs = props.gameConfig.oprs.map((o, idx) => ({opr: o, char: opr2symbol[o], idx: idx, type: 'opr'}));
    setGroup();
  }

  const pickOprCard = (obj) => {
    if(!obj) return;

    let id = '';

    for(let i = 0; i < 5; i++){
      id+= rdmArr(a2z);
    }
    state.pickedCards.push({
      ...obj,
      id: id + new Date().getTime()
    });
  }

  const pickNumCard = (obj) => {
    console.log(obj);
    if(!obj) return;
    state.nums[obj.idx] = null;
    state.pickedCards.push(obj);
  }

  const restoreCard = (obj) => {
    if(!obj) return;
    if(obj.type === 'num'){
      state.pickedCards = state.pickedCards.filter(c => c.idx !== obj.idx);
      state.nums[obj.idx] = obj;
    }else if(obj.type === 'opr'){
      console.log(obj);
      state.pickedCards = state.pickedCards.filter(c => !c.id || c.id !== c.id);
    }
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
      <ul id="calcBoard" class="calc-board">
        <li v-for="(itm, idx) in state.pickedCards" :key="idx" @click="restoreCard(itm)">{{ itm.char }}</li>
      </ul>
      <h2 id="myValue" class="my-value"></h2>
  </main>
  <footer>
      <fieldset>
          <legend>연산자</legend>
          <ul id="oprList" class="opr-list">
            <li v-for="(opr, idx) in state.oprs" :key="idx" @click="pickOprCard(opr)">
              {{ opr.char }}
            </li>
          </ul>
      </fieldset>
      <fieldset>
          <legend>숫자</legend>
          <ul id="numList" class="num-list">
            <li v-for="(itm, idx) in state.nums" :class="{blank: !itm}" :key="idx" @click="pickNumCard(itm)">{{ itm && itm.char }}</li>
          </ul>
      </fieldset>
      <div class="btns">
          <button id="init">초기화</button>
          <button id="submit">제출</button>
      </div>
  </footer>
</template>

<style scoped lang="scss">

  fieldset{
      border-radius: 5px;
      margin-top: 10px;
      border: 1px solid #fff;
  }
  fieldset legend{
      padding: 0 5px;
  }

  ul{
    list-style: none;
    display: flex;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
    padding-top: 10px;
    padding-left: 10px;

    li{
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      border: 1px solid #eee;
      box-shadow: 0 1px 5px rgba(0, 0, 0, .2);
      font-size: 32px;
      margin-right: 10px;
      margin-bottom: 10px;
      cursor: pointer;
      background: #fff;
      color: #000;

      &.blank{
        background: 0;
        border: 1px dashed #fff;
      }
    }

  }
</style>
