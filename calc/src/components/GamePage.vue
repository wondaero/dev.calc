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
    myAnswer: '',
    reCalcCnt: 0,
    classList: {
      answer: 'wrong'
    }
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
    if(!state.isAutoCalc && !isSubmit) return;

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

  const shuffleArr = (arr) => {
    //Fisher-Yates Shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // 0부터 i까지 랜덤한 인덱스
      [arr[i], arr[j]] = [arr[j], arr[i]];  // swap
    }
    return arr;
  }


  const setGroup = () => {
      let tmpArr = shuffleArr(JSON.parse(JSON.stringify(state.nums))).map(a => +a.char);

      while(tmpArr.length){
        // const cutLen = getRandomNum(1, props.gameConfig.randomDigitLen ? 10 : props.gameConfig.digitLen);
        const cutLen = getRandomNum(1, props.gameConfig.digitLen);
        state.numGroup.push(+(tmpArr.slice(0, cutLen).join('')));
        tmpArr = tmpArr.slice(cutLen);
      }

      console.log(state.numGroup);
  }

  const randomOprCalc = () => {
    state.answer = state.numGroup.reduce((accumulator, currentValue) => {
      const rdmOpr = oprs[getRandomNum(0, oprs.length - 1)];
      // return accumulator + currentValue;

      if(rdmOpr === '+') return +accumulator + +currentValue;
      else if(rdmOpr === '-') return +accumulator - +currentValue;
      else if(rdmOpr === '*') return +accumulator * +currentValue;
      else if(rdmOpr === '/') return +accumulator / +currentValue;

    });

    if(String(state.answer).indexOf('.') > -1){
      console.warn('재연산!!!');

      state.reCalcCnt++;
      return randomOprCalc();
    }
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
    randomOprCalc();
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
      calcMyExpression();
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
    calcMyExpression();
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

  const cancelSelect = (e) => {
    if(e.target.nodeName === 'LI') return;
    state.tmpCard = undefined;

  }

</script>

<template>
  <div class="wrapper" @click="cancelSelect($event)">
    <aside class="recal-cnt">{{ state.reCalcCnt }}</aside>
    <main>
      <div>
        <h2>{{ state.answer }}</h2>
        <p>
            아래 주어진 숫자카드와<br>
            연산자카드를 조합해서<br>
            위의 숫자를 만들어주세요.
            <strong>
              *모든 숫자를 사용할 것<br>
              *숫자가 10을 넘을 수 있음
            </strong>
        </p>
        <ul id="calcBoard" class="picked-cards">
          <li v-for="(itm, idx) in state.pickedCards" :key="idx"
          :class="{blank: state.tmpCard && idx === state.tmpCard.idx}"
          @click="restoreCard(itm, idx)">{{ itm.char }}</li>
        </ul>
        <h2 id="myValue" class="my-value"></h2>
      </div>
    </main>
    <footer>
      <div>
        <fieldset class="my-answer">
            <legend><label><input type="checkbox" v-model="state.isAutoCalc" /><strong><span>자동계산</span><b></b></strong></label></legend>
            <h2 :class="!state.nums.filter(n => n !== null).length && state.myAnswer === state.answer ? 'correct' : 'wrong'">{{ state.myAnswer }}</h2>
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
            <button @click="calcMyExpression(true)">제출</button>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
  .wrapper{
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    
    aside{
      position: fixed;
      top: 0;
      left: 0;
      color: rgba(0, 0, 0, .2);
      font-size: 30px;
      vertical-align: top;
    }
    main{
      flex: 1;
      padding: 10px;
      overflow-y: auto;
      display: flex;
      justify-content: center;

      & > div{
        width: 100%;
        max-width: 562px;
      }

      h2{
        font-size: 32px;
      }
      
      p{
        text-align: center;
        
        strong{
          font-size: 12px;
          display: block;
          color: orange;
        }
      }
    }
  }

  fieldset{
      border-radius: 5px;
      margin-top: 5px;
      padding: 0;
      border: 1px solid #bbb;
      text-align: left;
  }
  fieldset legend{
      padding: 0 5px;
      margin-left: 10px;
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
              transform: translateX(0);
              transition: transform .5s;
              box-shadow: 0 0 4px rgba(0, 0, 0, .4);
            }
          }
        }
      }
    }
    h2{
      margin: 0;
      text-align: center;
      height: 32px;

      &.wrong{
        color: #f00;
        opacity: .5;
      }
      &.correct{
        color: #0f0;
      }
    }
  }

  ul{
    list-style: none;
    display: flex;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
    padding-top: 5px;
    padding-left: 5px;

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
      margin-right: 5px;
      margin-bottom: 5px;
      cursor: pointer;
      background: #fff;
      color: #000;
      box-sizing: border-box;

      &.blank{
        background: 0;
        border: 1px dashed #ccc;
      }
    }

    &.picked-cards{
      // display: block;
      // white-space: nowrap;
      // overflow-x: auto;

      li{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: top;

        &.blank{
          color: rgba(255, 255, 255, 1);
          opacity: .5;
        }
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
      border: 1px solid deeppink;
    }
  }
  
  footer{
    background: #fff;
    padding: 5px;
    box-shadow: 0 0px 12px rgba(255, 255, 255, .9);
    color: #222;
    display: flex;
    align-items: center;
    justify-content: center;

    & > div{
      height: 100%;
      width: 100%;
      max-width: 562px;
    }
  }

  @media (max-width: 360px){
    ul{
      li{
        width: 42px;
        height: 42px;
      }

      &.picked-cards{
        li{
          width: 30px;
          height: 30px;
          font-size: 16px; 
        }
      }
    }
  }

  @media (max-height: 360px){
    .wrapper{
      flex-direction: row;
    }

    footer{
      position: relative;
      width: 287px;
      overflow-y: auto;
    }
  }
</style>
