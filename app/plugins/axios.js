const DEFAULT_TIMEOUT = 5000
export default function({ route, $axios, store }) {
  $axios.defaults.timeout = DEFAULT_TIMEOUT
  $axios.onError(error => {
    store.dispatch('error', error)
  })
}
