import { toRaw, toRef, isRef, isReactive } from 'vue'

// toRefs 和 storeToRefs 的区别在于 storeToRefs 会避开函数
export function storeToRefs(store) {
  // 先转成原生对象，避免循环时不断的触发 get
  store = toRaw(store)

  const refs = {}
  for (let key in store) {
    const value = store[key]
    if (isReactive(value) || isRef(value)) {
      refs[key] = toRef(store, key)
    }
  }
  return refs
}