import { ref, effectScope } from 'vue'

const piniaSymbol = Symbol('pinia')

export function createPinia() {
  const scope = effectScope()
  // 通过 run 方法进行包裹，可以通过 scope.stop() 停止响应式时
  const state = scope.run(() => ref({})) // 用来存储每个 store 的 state

  const pinia = {
    _s: new Map(), // 用于管理所有被定义的 store
    _e: scope, // 用来停止所有状态
    state, // 用来存储每个 store 的 state
    install(app) {
      console.log(app)

      // 通过 provide 让所有的 store 获取这个 pinia 对象
      app.provide(piniaSymbol, pinia) // 所有组件都可以通过 app.inject(piniaSymbol) 注入 pinia

      // 或者 vue2 方式，this.$pinia
      app.config.globalProperties.$pinia = pinia
    }
  }

  return pinia
}

