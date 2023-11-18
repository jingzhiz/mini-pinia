import { getCurrentInstance, isRef, isReactive, toRefs, reactive, computed, watch, inject, effectScope } from 'vue'
import { piniaSymbol } from './rootStore'
import { addSubscribe, triggerSubscribe } from './subscribe'

function isComputed(value) {
  return !!(isRef(value) && value.effect)
}

function isObject(value) {
  return value !== null && typeof value === 'object'
}

function mergeReactiveObject(target, state) {
  for (let key in state) {
    let oldVal = target[key]
    let newVal = state[key]

    if (isObject(oldVal) && isObject(newVal)) {
      target[key] = mergeReactiveObject(oldVal, newVal)
    } else {
      target[key] = newVal
    }
  }
  return target
}

function createSetupStore(id, setup, pinia, isOption) {
  let scope

  let actionSubscribers = []

  // 记录一些内置的 api
  const partialStore = {
    $patch(partialStateOrMutation) {
      if (typeof partialStateOrMutation === 'object') {
        mergeReactiveObject(pinia.state.value[id], partialStateOrMutation)
      } else if (typeof partialStateOrMutation === 'function') {
        partialStateOrMutation(pinia.state.value[id])
      }
    },
    $subscribe(callback, options) {
      scope.run(() => {
        watch(
          pinia.state.value[id],
          (state) => {
            callback({storeId: id}, state)
          },
          options
        )
      })
    },
    $onAction: addSubscribe.bind(null, actionSubscribers)
  }

  const store = reactive(partialStore)

  const initialState = pinia.state.value[id] // 对于 setup api 而言是没有初始化状态的

  if (!initialState && !isOption) { // setup api
    pinia.state.value[id] = {} // 给 setup api 赋一个初始化值
  }

  // 外层 run 方法进行包裹可以用来停止所有 store
  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    // 内层 run 方法可以停止单一 store
    return scope.run(() => setup())
  })

  function wrapAction(name, action) {
    return function() {
      const afterCallbackList = []
      const onErrorCallbackList = []
      function after(callback) {
        afterCallbackList.push(callback)
      }
      function onError(callback) {
        onErrorCallbackList.push(callback)
      }
      triggerSubscribe(actionSubscribers, { after, onError})

      let result
      try {
        result = action.apply(store, arguments)
      } catch (e) {
        triggerSubscribe(onErrorCallbackList, e)
      }

      if (result instanceof Promise) {
        return result.then(
          (res) => {
            triggerSubscribe(afterCallbackList, res)
            return res
          },
          (err) => {
            triggerSubscribe(onErrorCallbackList, err)
            return Promise.reject(err)
          }
        )
      }

      triggerSubscribe(afterCallbackList, result)
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

    // 处理 state
    if (isReactive(prop) || (!isComputed(prop) && isRef(prop))) {
      if (!isOption) {
        pinia.state.value[id][key] = prop
      }
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
    pinia.state.value[id] = state ? state() : {}

    // 将对象里每一个非 ref 转换成 ref
    const localState = toRefs(pinia.state.value[id])

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

  const store = createSetupStore(id, setup, pinia, true)

  // options store 才支持内置的 $reset api
  store.$reset = () => {
    const newState = state? state() : {}
    store.$patch((state) => {
      Object.assign(state, newState)
    })
  }
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