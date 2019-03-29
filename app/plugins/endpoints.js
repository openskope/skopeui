import Vue from 'vue'

Vue.prototype.$skopeWmsEndpoint = `${process.env.deployHostUrl}${
  process.env.wmsServerUri
}`
Vue.prototype.$timeseriesEndpoint = `${process.env.deployHostUrl}${
  process.env.timeseriesServiceUri
}`
Vue.prototype.$defaultBaseMapEndpoint = process.env.baseMapWmsServers[0]
Vue.prototype.$baseMapEndpoints = process.env.baseMapWmsServers
