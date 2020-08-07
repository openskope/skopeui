const DEFAULT_TIMEOUT = 10000
export default function({ route, $axios, store }) {
  $axios.defaults.timeout = DEFAULT_TIMEOUT
  $axios.onError(error => {
    store.dispatch('error', error)
  })
}
