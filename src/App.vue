<template>
  <div>
    <h2>当前计数：{{ counterStore1.count }}</h2>
    <h2>双倍计数：{{ counterStore1.doubleCount }}</h2>
    <button @click="handleIncrement1">点击+1</button>
    <button @click="handleReset1">点击重置</button>
    <hr color="red">
    <h2>当前计数：{{ counterStore2.count }}</h2>
    <h2>双倍计数：{{ counterStore2.doubleCount }}</h2>
    <button @click="handleIncrement2">点击+10</button>
    <button @click="handleReset2">点击重置</button>
  </div>
</template>

<script setup>
import { useCounterStore1 } from './store/useCounterStore1'
import { useCounterStore2 } from './store/useCounterStore2'

const counterStore1 = useCounterStore1()
counterStore1.$subscribe((storeInfo, state) => {
  console.log('counterStore1', storeInfo, state)
})
counterStore1.$onAction(({ after, onError}) => {
  console.log('counterStore1 actions execute')
  after(() => {
    console.log('after')
  })
  onError(() => {
    console.log('onerror')
  })
})
const handleIncrement1 = () => {
  counterStore1.increment(1)
  // counterStore1.$patch({
  //   count: counterStore1.count + 1
  // })
  // counterStore1.$patch(state => {
  //   state.count++
  // })
}
const handleReset1 = () => {
  counterStore1.$reset()
}

const counterStore2 = useCounterStore2()
counterStore2.$subscribe((storeInfo, state) => {
  console.log('counterStore2', storeInfo, state)
})
const handleIncrement2 = () => {
  counterStore2.increment(10)
  // counterStore2.$patch({
  //   count: counterStore2.count + 10
  // })
  // counterStore2.$patch(state => {
  //   state.count += 10
  // })
}
const handleReset2 = () => {
  counterStore2.$reset()
}
</script>

