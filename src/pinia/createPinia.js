import { ref, effectScope } from 'vue'
import { piniaSymbol } from './rootStore'

// 定义一个全局变量
export let activePinia
export const setActivePinia = (pinia) => {
  activePinia = pinia
}

export function createPinia() {
  const scope = effectScope()
  // 通过 run 方法进行包裹，可以通过 scope.stop() 停止响应式时
  const state = scope.run(() => ref({})) // 用来存储每个 store 的 state

  const toBeInstalled = []

  const pinia = {
    _e: scope, // 用来停止所有状态
    _s: new Map(), // 用于管理所有被定义的 store
    _p: [], // 用来存储所有被 use 的插件
    state, // 用来存储每个 store 的 state
    install(app) {
      setActivePinia(pinia)
      // 通过 provide 让所有的 store 获取这个 pinia 对象
      app.provide(piniaSymbol, pinia) // 所有组件都可以通过 app.inject(piniaSymbol) 注入 pinia

      // 或者 vue2 方式，this.$pinia
      app.config.globalProperties.$pinia = pinia
    },
    use(plugin) {
      pinia._p.push(plugin)
      return this
    }
  }

  return pinia
}

