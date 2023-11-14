import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useCounterStore2 = defineStore('counter2', () => {
  const count = ref(100)

  const doubleCount = computed(() => count.value * 2)

  const increment = (payload = 1) => {
    count.value += payload
  }

  return {
    count,
    doubleCount,
    increment
  }
})