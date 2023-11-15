import { defineStore } from "@/pinia"

export const useCounterStore1 = defineStore('counter1', {
  state: () => {
    return {
      count: 0
    }
  },
  getters: {
    doubleCount() {
      return this.count * 2
    }
  },
  actions: {
    increment(payload = 1) {
      this.count += payload
    }
  }
})