<script setup>
  import { reactive, watch, defineEmits, onMounted } from 'vue';
  
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
    },
    queryString: {
      nums: '',
      oprs: '',
      answer: ''
    }
  });

  onMounted(() => {
    create();
    state.queryString = {
      nums: state.nums.map(n => n.char).join(''),
      oprs: state.oprs.map(o => opr2symbol[o.char]).join(''),
      answer: state.answer
    }

    if (!Kakao.isInitialized()) {
      Kakao.init('e14b339e334e3a9bb5d3a6b66a9859fa'); // 사용하려는 앱의 JavaScript 키 입력
    }
  })

  const emit = defineEmits(['goBackHome']);

  const getRandomNum = (mn, mx) => Math.floor(Math.random() * (mx - mn + 1)) + mn;
  const rdmArr = (arr) => arr[getRandomNum(0, arr.length - 1)]; 
  // const nums = '1234567890';  
  const nums = '123456789';    //일단 0 뺌
  const oprs = '+-*/';
  const a2z = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const opr2symbol = {
    '+': 'p',
    '-': 'm',
    '*': 'm2',
    '/': 'd',
    p: '+',
    m: '-',
    m2: '*',
    d: '/',
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
      state.myAnswer = result;

      if(!isSubmit) return;

      if(+state.myAnswer === +state.answer){
        if(window.confirm('정답입니다. \n다른문제를 낼까요?')){
          create(true);
          state.queryString = {
            nums: state.nums.map(n => n.char).join(''),
            oprs: state.oprs.map(o => opr2symbol[o.char]).join(''),
            answer: state.answer
          }
          console.log(state.queryString);
        }
        
      }else{
        alert('땡! 틀렸습니다.');
      }

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

    state.numGroup = [];

    while(tmpArr.length){
      let cutLen = getRandomNum(1, props.gameConfig.digitLen);
      if(props.gameConfig.digitLen === '0') cutLen = getRandomNum(1, state.nums.length - 2);

      state.numGroup.push(+(tmpArr.slice(0, cutLen).join('')));
      tmpArr = tmpArr.slice(cutLen);
    }
  }

  const randomOprCalc = () => {
    let strExpr = '';

    state.numGroup.forEach((ng) => {
      const rdmOpr = rdmArr(state.oprs).opr;
      strExpr += ng + rdmOpr;
    })

    // console.log(strExpr.slice(0, -1));  //정답

    state.answer = new Function('return ' + strExpr.slice(0, -1))();

    if(String(state.answer).indexOf('.') > -1){
      console.warn('재연산!!!');

      state.reCalcCnt++;
      return randomOprCalc();
    }
  }

  //create
  const create = (isReGame) => {
    state.pickedCards = [];
    state.myAnswer = '';
    const qs = props.gameConfig;  //코드 줄이기
    if(!isReGame && qs && qs.nums !== undefined && qs.answer !== undefined && qs.oprs !== undefined){
      state.nums = String(qs.nums).split('').map((n, idx) => ({char: n, idx: idx, type: 'num'}));
      state.answer = +qs.answer;
      state.oprs = String(qs.oprs).split('').map((o, idx) => ({opr: o, char: opr2symbol[o], idx: idx, type: 'opr'}));
    }else{
      if(isReGame){
        qs.numLen = qs.nums ? qs.nums.length : state.queryString.nums.length;
        qs.oprs = typeof qs.oprs === 'string' ? qs.oprs.split('') : qs.oprs;
        qs.digitLen = qs.numLen - 2;
      }

      state.nums = [];

      let numCnt = qs.numLen;
      if(numCnt === '0'){
        if(qs.digitLen === '0'){
          numCnt = getRandomNum(3, 10);
        }else{
          numCnt = getRandomNum(qs.digitLen + 2, 10);
        }
      }

      for(let i = 0; i < numCnt; i++){
        state.nums.push({
          char: rdmArr(nums),
          idx: i,
          type: 'num'
        });

      }

      state.oprs = (typeof qs.oprs === 'string' ? qs.oprs.split('') : qs.oprs).map((o, idx) => ({opr: o, char: opr2symbol[o], idx: idx, type: 'opr'}));

      setGroup();
      randomOprCalc();
    }
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
        state.nums[state.tmpCard.card.idx] = state.tmpCard.card;
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

  const initBoard = () => {
    if(!window.confirm('모든 카드들을 초기화할까요?')) return;
    state.pickedCards.forEach((pc) => {
      if(pc.type === 'num') state.nums[pc.idx] = pc;
    })

    state.pickedCards = [];
  }

  const goHome = () => {
    if(!window.confirm('초기화면으로 돌아갈까요?')) return;
    emit('goBackHome');
  }

  const reGame = () => {
    if(!window.confirm('문제를 바꿀까요?')) return;
    create(true);
    state.queryString = {
      nums: state.nums.map(n => n.char).join(''),
      oprs: state.oprs.map(o => opr2symbol[o.char]).join(''),
      answer: state.answer
    }
    calcMyExpression();
  }

  const shareKaKao = () => {
    const qs = state.queryString; //코드 줄임
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '연산군',
        description: `#${state.answer}\n#이것좀 풀어줘`,
        link: {
          // [내 애플리케이션] > [플랫폼] 에서 등록한 사이트 도메인과 일치해야 함
          mobileWebUrl: 'https://developers.kakao.com',
          webUrl: 'https://developers.kakao.com',
        },
      },
      
      buttons: [
        {
          title: '도전하기',
          link: {
            mobileWebUrl: `${window.location.origin + window.location.pathname}?nums=${qs.nums}&oprs=${qs.oprs}&answer=${qs.answer}`,
            webUrl: `${window.location.origin + window.location.pathname}?nums=${qs.nums}&oprs=${qs.oprs}&answer=${qs.answer}`,
          },
        },
      ],
    });
  }
</script>

<template>
  <div class="wrapper" @click="cancelSelect($event)">
    <aside class="recal-cnt">{{ state.reCalcCnt }}</aside>
    <aside class="share-btn">
      <button class="share-btn" @click="shareKaKao">
        <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_small.png" alt="카카오톡 공유 보내기 버튼" />
      </button>
    </aside>
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
          :class="{
            blank: state.tmpCard && idx === state.tmpCard.idx,
            [itm.char] : itm.type === 'opr'
          }"
          @click="restoreCard(itm, idx)">
            <span v-if="itm.type === 'opr'">
              <span></span>
              <span></span>
            </span>
            <span v-else>{{ itm.char }}</span>
          </li>
        </ul>
        <h2 id="myValue" class="my-value"></h2>
      </div>
    </main>
    <footer>
      <div>
        <fieldset class="my-answer">
            <legend><label><input type="checkbox" v-model="state.isAutoCalc" /><strong><span>자동계산</span><b></b></strong></label></legend>
            <h2 :class="!state.nums.filter(n => n !== null).length && +state.myAnswer === +state.answer ? 'correct' : 'wrong'">{{ state.myAnswer }}</h2>
        </fieldset>
        <fieldset>
            <legend>연산자</legend>
            <ul id="oprList" class="opr-list">
              <li v-for="(opr, idx) in state.oprs" :key="idx" :class="opr.char" @click="pickOprCard(opr)">
                <span>
                  <span></span>
                  <span></span>
                </span>
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
            <div>
              <button class="home" @click="goHome"></button>
              <button class="re" @click="reGame"><span></span></button>
            </div>
            <div>
              <button class="init" @click="initBoard">초기화</button>
              <button @click="calcMyExpression(true)">제출</button>
            </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
  .wrapper{
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    
    aside{
      position: fixed;
      top: 0;
      left: 0;
      color: rgba(0, 0, 0, .2);
      font-size: 30px;
      vertical-align: top;

      &.share-btn{
        left: unset;
        top: 10px;
        right: 10px;

        button{
          padding: 0;
          background: 0;
          vertical-align: top;
          border: 0;
          
          img{
            vertical-align: top;
          }
        }
      }

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
      position: relative;

      &.blank{
        background: 0;
        border: 1px dashed #ccc;
      }

      & > span{
        pointer-events: none;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      &.p > span span,
      &.m > span span:first-of-type,
      &.m2 > span span,
      &.d > span span:first-of-type{
        width: 28px;
        height: 8px;
        background: #000;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      &.p > span span:last-of-type{
        transform: translate(-50%, -50%) rotate(90deg);
      }
      &.m2 > span span:first-of-type{
        transform: translate(-50%, -50%) rotate(45deg);
      }
      &.m2 > span span:last-of-type{
        transform: translate(-50%, -50%) rotate(-45deg);
      }
      &.d > span span:last-of-type{
        position: relative;
        width: 28px;
        height: 34px;
      }
      &.d > span span:last-of-type:before,
      &.d > span span:last-of-type:after{
        content: '';
        display: block;
        width: 10px;
        height: 10px;
        background: #000;
        position: absolute;
        top: 0;
        left: 50%;
        border-radius: 50%;
        transform: translateX(-50%);
      }
      &.d > span span:last-of-type:after{
        top: unset;
        bottom: 0;
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

          &.p > span span,
          &.m > span span,
          &.m2 > span span,
          &.d > span span:first-of-type,
          &.d > span span:after,
          &.d > span span:before{background: #fff;}
        }
      }
    }

  }

  .opr-list{
    justify-content: center;
  }
  .opr-list li{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  

  .btns{
    margin-top: 10px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;

    & > div{
      display: flex;
    }

    button{
      display: flex;
      align-items: center;
      justify-content: center;
      background: deeppink;
      color: #fff;
      margin-right: 5px;
      padding: 8px 16px;
      outline: 0;

      &:hover{
        border-color: transparent;
      }

      &:last-of-type{
        margin-right: 0;
      }

      &.home{
        position: relative;
        padding: 0;
        width: 36px;

        &:before,
        &:after{
          content: '';
          position: absolute;
          left: 50%;
          box-sizing: border-box;
          transform: translateX(-50%);
        }

        &:before{
          width: 20px;
          height: 20px;
          border-top: 10px solid transparent;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 10px solid deeppink;
          top: -2px;
          // border-radius: 5px;
        }
        &:after{
          top: 16px;
          width: 14px;
          height: 10px;
          border-radius: 2px;
          border: 4px solid deeppink;
          border-bottom: 0;
        }
        
      }

      &.re{
        position: relative;
        padding: 0;
        width: 36px;

        span{
          width: 16px;
          height: 16px;
          border: 2px solid #fff;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-15deg);
          animation: re 10s linear infinite;
          pointer-events: none;
        }
        span:before,
        span:after{
          content: '';
          width: 10px;
          height: 10px;
          border: 5px solid transparent;
          position: absolute;
          top: 50%;
          box-sizing: border-box;
        }
        span:before{
          border-top: 5px solid #fff;
          left: -5px;
          transform: translateY(-50%) rotate(6deg);
        }
        span:after{
          border-bottom: 5px solid #fff;
          right: -5px;
          transform: translateY(-50%) rotate(6deg);
        }
      }

      &.init{
        background: palevioletred;
      }
    }
    button:first-of-type{
      background: #fff;
      color: deeppink;
      border: 1px solid deeppink;
    }
  }
  
  footer{
    background: #fff;
    padding: 10px 5px;
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

        &.p > span,
        &.m > span,
        &.m2 > span,
        &.d > span{
          transform: scale(.8);
        }
        
      }

      &.picked-cards{
        li{
          width: 30px;
          height: 30px;
          font-size: 16px;

          &.p > span,
          &.m > span,
          &.m2 > span,
          &.d > span{
            transform: scale(.5);
          }

        }
      }
    }
  }

  // @media (max-height: 360px){
  //   .wrapper{
  //     flex-direction: row;
  //   }

  //   footer{
  //     position: relative;
  //     width: 287px;
  //     overflow-y: auto;
  //   }
  // }

  @keyframes re {
    0%{transform: rotate(0);}
    100%{transform: rotate(-360deg);}
    
  }
</style>
