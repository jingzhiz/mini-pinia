import { getCurrentInstance, reactive, computed, inject, effectScope } from 'vue'
import { piniaSymbol } from './rootStore'

function createSetupStore(id, setup, pinia) {
  let scope

  // 后续一些内置 api 会加载至这个 store 中
  const store = reactive({})

  // 外层 run 方法进行包裹可以用来停止所有 store
  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    // 内层 run 方法可以停止单一 store
    return scope.run(() => setup())
  })

  function wrapAction(name, action) {
    return function() {
      const result = action.apply(store, arguments)
  
      // action 可能是异步函数
      // 处理异步...
  
      return result
    }
  }
  for(let key in setupStore) {
    const prop = setupStore[key]
    // 处理 actions
    if (typeof prop === 'function') {
      // 通过包装一层进行劫持，处理 this 绑定问题或者添加其他逻辑
      setupStore[key] = wrapAction(store, prop)
    }
  }

  // 将 store 和 id 映射起来
  pinia._s.set(id, store)

  Object.assign(store, setupStore)

  return store
}

function createOptionsStore(id, options, pinia) {
  const { state, getters, actions } = options

  function setup() {
    const localState = pinia.state.value[id] = state ? state() : {}

    return Object.assign(
      localState,
      actions,
      // 循环所有属性转成计算属性进行值的缓存
      Object.keys(getters || {}).reduce((memo, name) => {
        memo[name] = computed(() => {
          const store = pinia._s.get(id)
          return getters[name].call(store)}
        )
        return memo
      }, {})
    )
  }

  createSetupStore(id, setup, pinia)
}


export function defineStore(idOrOptions, setup) {
  let id
  let options

  // id + options/setup
  if (typeof idOrOptions === 'string') {
    id = idOrOptions
    options = setup
  } else if (typeof idOrOptions === 'object') {
    // optionWithId
    id = idOrOptions.id
    options = idOrOptions
  }

  const isSetupStore = typeof setup === 'function'

  function useStore() {
    // 获取当前的组件实例
    const instance = getCurrentInstance()
    // 只有当前是在组件内才允许注入数据
    const pinia = instance && inject(piniaSymbol)
    
    // 如果是第一次使用则创建 store，建立映射关系
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, options, pinia)
      } else {
        createOptionsStore(id, options, pinia)
      }
    }

    // 后续通过 id 将对应 store 返回
    const store = pinia._s.get(id)

    return store
  }

  return useStore
}