import { ref, computed } from "vue"
import { defineStore } from "@/pinia"

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