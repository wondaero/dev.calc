<script setup>
  import { defineProps } from 'vue';
  const props = defineProps({
    gameConfig: {
      type: Object,
      required: true
    },
  });

  console.log(props.gameConfig);


</script>

<template>
  <h1>333</h1>

</template>

<style scoped lang="scss">
</style>
