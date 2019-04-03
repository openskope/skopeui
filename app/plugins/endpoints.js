import Vue from 'vue'

Vue.prototype.$skopeWmsEndpoint = `${process.env.deployHostUrl}${
  process.env.wmsServerUri
}`
Vue.prototype.$timeseriesEndpoint = `${process.env.deployHostUrl}${
  process.env.timeseriesServiceUri
}`
Vue.prototype.$defaultWmsBaseMapEndpoint = process.env.baseMapWmsServers[0]
Vue.prototype.$baseMapEndpoints = process.env.baseMapWmsServers
Vue.prototype.$defaultBaseMap = process.env.baseMap
Vue.prototype.$defaultMapAttribution = process.env.baseMapAttribution
