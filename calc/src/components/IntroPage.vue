<script setup>
  import { ref, reactive, watch, defineEmits } from 'vue'

  const state = reactive({
    numLen: 3,
    digitLen: 1,
    randomNumLen: false,
    randomDigitLen: false,
    oprs: ['+', '-', '*', '/'],
  });

  const emit = defineEmits(['gameStart']);

  const numLenRef = ref(null);
  const digitLenRef = ref(null);

  // numLen이 변경될 때 digitLen을 업데이트
  watch(
      () => state.numLen,
    (newNumLen) => {
      if (state.digitLen > newNumLen - 2) {
        state.digitLen = newNumLen - 2; // 예시: digitLen을 numLen - 2로 맞추기
      }
    },
    { immediate: true } // 컴포넌트가 처음 로딩될 때도 watch가 동작하도록 설정
  );

  watch(  //랜덤 숫자 갯수
    () => state.randomNumLen,
    (randomNumLen) => {
      numLenRef.value.disabled = randomNumLen;
      if(randomNumLen){
        state.numLen = 10;
      }
    },
  )
  watch(  //랜덤 자릿수 갯수
    () => state.randomDigitLen,
    (randomDigitLen) => {
      digitLenRef.value.disabled = randomDigitLen;
      if(randomDigitLen){
        state.digitLen = 8;
      }
    },
  )
  
  const initConfig = () => {
    state.numLen = 3;
    state.digitLen = 1;
    state.randomNumLen = false;
    state.randomDigitLen = false;
    state.oprs = ['+', '-', '*', '/'];
  }

  const gameStart = () => {
    emit('gameStart', state);
  }

</script>

<template>
  <h1>연산군</h1>
  <ul>
    <li class="oprs">
      <label><input type="checkbox" value="+" v-model="state.oprs" checked /><strong>➕</strong></label>
      <label><input type="checkbox" value="-" v-model="state.oprs" checked /><strong>➖</strong></label>
      <label><input type="checkbox" value="*" v-model="state.oprs" checked /><strong>✖️</strong></label>
      <label><input type="checkbox" value="/" v-model="state.oprs" checked /><strong>➗</strong></label>
    </li>
    <li>
      <div>
        <label><input type="checkbox" value="random" v-model="state.randomNumLen" />랜덤</label>
        <input type="range" min="3" max="10" v-model="state.numLen" ref="numLenRef" />
      </div>
      <strong>숫자 갯수: {{ state.randomNumLen ? 'random' : state.numLen }}</strong>
    </li>
    <li>
      <div>
        <label><input type="checkbox" value="random" v-model="state.randomDigitLen" />랜덤</label>
        <input type="range" min="1" :max="state.numLen - 2" v-model="state.digitLen" ref="digitLenRef">
      </div>
      <strong>최대 자릿수: {{ state.randomDigitLen ? 'random' : state.digitLen }}</strong>
    </li>
  </ul>
  <div class="btns">
    <button @click="initConfig">설정 초기화</button>
    <button @click="gameStart">게임 시작</button>
  </div>

</template>

<style scoped lang="scss">
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

      input[type="range"]{
        display: block;
        width: 100%;
        flex: 1;
        background: 0;

        -webkit-appearance: none; /* 기본 스타일 제거 */
        appearance: none;

        /* track 스타일 (Webkit 기반 브라우저) */
        &::-webkit-slider-runnable-track {
          width: 100%;
          height: 7px;
          position: relative;
          background: rgba(255, 255, 255, .2); /* track 배경색 */
          border-radius: 10px; /* track의 둥근 모서리 */
        }

        &::-webkit-slider-thumb {
        -webkit-appearance: none; /* 기본 thumb 스타일 제거 */
        appearance: none;
        width: 19px; /* thumb의 너비 */
        height: 19px; /* thumb의 높이 */
        border-radius: 50%; /* thumb을 원형으로 만들기 */
        background: #fff; /* thumb의 배경색 */
        cursor: pointer; /* thumb를 클릭 가능한 상태로 설정 */
        position: relative;
        top: -6px;
        box-shadow: 0 0 8px rgba(255, 255, 255, .8), inset 0 0 8px rgba(0, 0, 0, .2);
      }

        &[disabled]{
            &::-webkit-slider-runnable-track{
              background: #888;
            }

            &::-webkit-slider-thumb{
              background: #888;
              box-shadow: inset 0 0 8px #999;
            }
        }
      }

      strong{display: block;}
    }
  }

  .btns{
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 30px;
  }
  .btns button:first-of-type{
    margin-right: 10px;
  }
</style>
