<script setup>
  import { ref, reactive, watch, defineEmits, onMounted } from 'vue'

  const state = reactive({
    numLen: 3,
    minNumLen: 3,
    maxNumLen: 10,
    digitLen: 1,
    oprs: ['+', '-', '*', '/'],
  });

  const emit = defineEmits(['gameStart']);

  const numLenRef = ref(null);
  const digitLenRef = ref(null);

  // numLen이 변경될 때 digitLen을 업데이트
  watch(
      () => state.numLen,
    (newNumLen) => {
      if(newNumLen === '0'){ //랜덤
        if(state.digitLen !== '0') state.digitLen = 1;
      }else if (state.digitLen > newNumLen - 2) {
        state.digitLen = newNumLen - 2; // 예시: digitLen을 numLen - 2로 맞추기
      }
    },
    { immediate: true } // 컴포넌트가 처음 로딩될 때도 watch가 동작하도록 설정
  );

  onMounted(() => {
    const savedConf = localStorage.getItem('calc');

    if(savedConf){
      const parsedData = JSON.parse(savedConf);
      for(let key in  parsedData){
        state[key] = parsedData[key];
      }
    }
  })

  
  const initConfig = () => {
    state.numLen = 3;
    state.digitLen = 1;
    state.oprs = ['+', '-', '*', '/'];
  }

  const gameStart = () => {
    localStorage.setItem('calc', JSON.stringify(state));
    emit('gameStart', state);
  }

</script>

<template>
  <div class="intro-wrapper">
    <h1>연산군</h1>
    <ul>
      <li class="oprs">
        <label><input type="checkbox" value="+" v-model="state.oprs" checked /><strong>➕</strong></label>
        <label><input type="checkbox" value="-" v-model="state.oprs" checked /><strong>➖</strong></label>
        <label><input type="checkbox" value="*" v-model="state.oprs" checked /><strong>✖️</strong></label>
        <label><input type="checkbox" value="/" v-model="state.oprs" checked /><strong>➗</strong></label>
      </li>
      <li>
        <label>
          <strong>숫자 갯수</strong>
          <select v-model="state.numLen">
            <option value="0">랜덤</option>
            <option v-for="(num, idx) in (state.maxNumLen - state.minNumLen + 1)" :value="state.minNumLen + idx" :key="num">{{state.minNumLen + idx}}</option>
          </select>
        </label>
      </li>
      <li>
        <label>
          <strong>최대 자릿수</strong>
          <select v-model="state.digitLen">
            <option value="0">랜덤</option>
            <option v-for="(num, idx) in ((state.numLen !== '0' ? state.numLen : state.maxNumLen) - 2)" :value="idx + 1" :key="num">{{1 + idx}}</option>
          </select>
          
        </label>
      </li>
    </ul>
    <div class="btns">
      <button @click="initConfig">설정 초기화</button>
      <button @click="gameStart">게임 시작</button>
    </div>
  </div>

</template>

<style scoped lang="scss">
  .intro-wrapper{
    padding: 20px 5px;
  }
  h1{
    margin: 0;
    margin-bottom: 50px;
    transform: rotate(-2deg);
  }

  ul{
    list-style: none;
    margin: 0;
    padding: 0;

    li{
      margin-bottom: 20px;

      &:last-of-type{
        margin-bottom: 0;
      }

      & > div{
        display: flex;
        align-items: center;

        label{
          display: flex;
          align-items: center;
          margin-right: 10px;

          input{
            margin-right: 4px;
          }
        }
      }

      &.oprs{
        display: flex;
        align-items: center;
        justify-content: center;

        li:last-of-type{
          margin-bottom: 0;
        }

        label{

          margin-right: 10px;

          &:last-of-type{
            margin-right: 0;
          }

          input[type="checkbox"]{
            display: none;
          }
  
          strong{
            width: 42px;
            height: 42px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #ddd;
            box-shadow: inset 0 0 10px #000;
            opacity: .2;
            cursor: pointer;
          }

          input:checked + strong{
            background: #fff;
            box-shadow: 0 0 8px #fff;
            opacity: 1;
          }
        }

      }

      label{
        display: flex;
        align-items: center;

        strong{
          width: 100px;
        }

        select{
          color: #000;
          background: #fff;
          cursor: pointer;
          width: 100%;
          height: 40px;
          flex: 1;
          text-align: center;
          padding: 8px;
          border-radius: 8px;
          box-sizing: border-box;
        }
      }
    }
  }

  .btns{
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 30px;

    button{
      background: #fff;
      color: #000;

      &:first-of-type{
        margin-right: 10px;
      }
    }
  }
</style>
