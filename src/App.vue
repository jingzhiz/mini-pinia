<template>
  <div>
    <h2>当前计数：{{ counterStore1.count }}</h2>
    <h2>双倍计数：{{ counterStore1.doubleCount }}</h2>
    <button @click="handleIncrement1">点击+1</button>
    <hr color="red">
    <h2>当前计数：{{ counterStore2.count }}</h2>
    <h2>双倍计数：{{ counterStore2.doubleCount }}</h2>
    <button @click="handleIncrement2">点击+10</button>
  </div>
</template>

<script setup>
import { useCounterStore1 } from './store/useCounterStore1'
import { useCounterStore2 } from './store/useCounterStore2'

const counterStore1 = useCounterStore1()

const handleIncrement1 = () => {
  counterStore1.increment(1)
}

const counterStore2 = useCounterStore2()

const handleIncrement2 = () => {
  counterStore2.increment(10)
}
</script>

