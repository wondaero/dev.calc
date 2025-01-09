<script setup>
  import { reactive, watch } from 'vue';
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
    tmpCard: undefined,
    isAutoCalc: false,
    myAnswer: ''
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

  const calcMyExpression = (isSubmit) => {
    if(isSubmit){
      if(state.nums.filter(n => n !== null).length){
          alert('모든 숫자를 사용해주세요.');
          return;
      }

      let oprCnt = 0;
      let overOpr = false;

      state.pickedCards.forEach(c => {
          if(c.type === 'opr') oprCnt++;
          else oprCnt = 0;

          if(oprCnt > 1) overOpr = true;
      })

      if(overOpr){
          alert('연산자를 확인해 주세요.');
          return;
      }

      if(state.pickedCards[0].type === 'opr'){
          alert('맨 앞에 연산자가 올 수 없습니다.');
          return;
      }

      if(!state.pickedCards.filter(c => c.type === 'opr').length){
        alert('연산자가 빠졌습니다.');
        return;
      }
    }

    const strExpr = state.pickedCards.map(c => c.type === 'num' ? c.char : c.opr).join('');
    try{
      const result = new Function('return ' + strExpr)();  // new Function을 사용하여 문자열 계산
      // console.log(result);  // 결과: -3
      state.myAnswer = result;
    }catch(err){
      if(!isSubmit) return;
      alert('식을 확인해주세요.');
    }

  }

  watch(
    () => state.pickedCards,
    () => {
      if(!state.isAutoCalc) return;

      calcMyExpression();
    },
    { immediate: true, deep: true } // 컴포넌트가 처음 로딩될 때도 watch가 동작하도록 설정
  );

  watch(
    () => state.isAutoCalc,
    (isAutoCalc2) => { 
      if(isAutoCalc2 === true){
        calcMyExpression();
      }else{
        state.myAnswer = '';
      }
    },
    { immediate: true } // 컴포넌트가 처음 로딩될 때도 watch가 동작하도록 설정
  );

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
    for(let i = 0; i < 5; i++) id+= rdmArr(a2z);

    if(state.tmpCard === undefined){
      state.pickedCards.push({
        ...obj,
        id: id + new Date().getTime()
      });
    }else{
      state.pickedCards[state.tmpCard.idx] = {
        ...obj,
        id: id + new Date().getTime()
      };
      if(state.tmpCard.card.type === 'num'){
        state.nums[state.tmpCard.idx] = state.tmpCard.card;
      }

      state.tmpCard = undefined;
    }
  }

  const pickNumCard = (obj) => {
    if(!obj) return;
    if(state.tmpCard === undefined){
      state.nums[obj.idx] = null;
      state.pickedCards.push(obj);
    }else{
      if(state.tmpCard.card.type === 'opr'){
        state.pickedCards[state.tmpCard.idx] = obj;
        state.nums[obj.idx] = null;
        state.tmpCard = undefined;
      }else if(state.tmpCard.card.type === 'num'){
        state.pickedCards[state.tmpCard.idx] = obj;
        state.nums[state.tmpCard.card.idx] = state.tmpCard.card;
        state.nums[obj.idx] = null;
        state.tmpCard = undefined;
      }
    }
  }

  const restoreCard = (obj, idx) => {
    if(!obj) return;
    if(obj.type === 'num'){
      if(state.tmpCard === undefined){
        state.tmpCard = {
          card: obj,
          idx
        };
      }else{
        if(idx === state.tmpCard.idx){
          console.log('지운다')
          state.pickedCards = state.pickedCards.filter((c, idx) => idx !== state.tmpCard.idx);
          state.nums[state.tmpCard.card.idx] = state.tmpCard.card;
          state.tmpCard = undefined;
        }else{
          state.tmpCard = {
            card: obj,
            idx
          };
        }
      }
    }else if(obj.type === 'opr'){
      if(state.tmpCard === undefined){
        state.tmpCard = {
          card: obj,
          idx
        };
      }else{
        if(idx === state.tmpCard.idx){
          // state.pickedCards = state.pickedCards.filter(c => !c.id || c.id !== c.id);
          state.pickedCards = state.pickedCards.filter((c, idx) => idx !== state.tmpCard.idx);
          state.tmpCard = undefined;
        }else{
          state.tmpCard = {
            card: obj,
            idx
          };
        }

      }
    }
  }

</script>

<template>
  <div class="wrapper">
    <aside id="recalCnt" class="recal-cnt">0</aside>
    <main>
        <h2 id="finalValue">{{ state.answer }}</h2>
        <p>
            아래 주어진 숫자카드와 연산자카드를 조합해서<br>
            위의 숫자를 만들어주세요.
            <strong>*모든 숫자를 사용할 것<br>*숫자가 10을 넘을 수 있음</strong>
        </p>
        <ul id="calcBoard" class="calc-board">
          <li v-for="(itm, idx) in state.pickedCards" :key="idx"
          :class="{blank: state.tmpCard && idx === state.tmpCard.idx}"
          @click="restoreCard(itm, idx)">{{ itm.char }}</li>
        </ul>
        <h2 id="myValue" class="my-value"></h2>
    </main>
    <footer>
        <fieldset class="my-answer">
            <legend><label><input type="checkbox" v-model="state.isAutoCalc" /><strong><span>자동계산</span><b></b></strong></label></legend>
            <h2>{{ state.myAnswer }}</h2>
        </fieldset>
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
  </div>
</template>

<style scoped lang="scss">
  .wrapper{
    position: fixed;
    bottom: 10px;
    left: 10px;
    right: 10px;
  }

  fieldset{
      border-radius: 5px;
      margin-top: 10px;
      border: 1px solid #fff;
  }
  fieldset legend{
      padding: 0 5px;
  }

  .my-answer{
    legend{
      display: flex;
      
      label{
        display: flex;
        align-items: center;
        cursor: pointer;

        input{
          display: none;

          &:checked + strong{
            b:before{
              transform: translateX(0);
            }
            b:after{
              transform: translateX(16px);
            }
          }
        }
        strong{
          display: flex;
          align-items: center;

          b{
            width: 36px;
            height: 20px;
            border-radius: 20px;
            background: #ddd;
            margin-left: 5px;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 0 2px rgba(0, 0, 0, .8);

            &:before{
              content: '';
              width: 100%;
              height: 100%;
              border-radius: 20px;
              background: lime;
              position: absolute;
              top: 0;
              left: 0;
              transform: translateX(-100%);
              transition: transform .1s;
            }

            &:after{
              content: '';
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #fff;
              position: absolute;
              top: 4px;
              left: 4px;
              transition: transform .5s;
              box-shadow: 0 0 4px rgba(0, 0, 0, .4);
            }
            
          }

        }
      }
    }
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

    &.calc-board{
      li.blank{
        color: rgba(255, 255, 255, 1);
        opacity: .5;
      }
    }

  }

  .opr-list{
    justify-content: center;
  }

  .btns{
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    button{
      display: flex;
      align-items: center;
      justify-content: center;
      background: deeppink;
      color: #fff;
    }
    button:first-of-type{
      margin-right: 5px;
      background: #fff;
      color: deeppink;
    }
  }
</style>
