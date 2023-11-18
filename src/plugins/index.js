
const PINIA_STORE_PREFIX = 'pinia_'

export function localCache({ store }) {
  const localState = localStorage[PINIA_STORE_PREFIX + store.$id]

  if (localState) {
    store.$state = JSON.parse(localState)
  }

  store.$subscribe(function ({storeId}, state) {
    localStorage.setItem(PINIA_STORE_PREFIX + storeId, JSON.stringify(state))
  })
}