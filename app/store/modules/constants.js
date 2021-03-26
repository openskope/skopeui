import { find } from 'lodash'
export const DEPLOY_HOST_URL = 'https://api.openskope.org/' // FIXME: this should be parameterized at build / deployment
export const WMS_SERVER_URI = 'geoserver/SKOPE/wms?'
export const TIMESERIES_SERVICE_URI = 'timeseries-service/api/v1/timeseries/'
export const SKOPE_WMS_ENDPOINT = `https://app.openskope.org/${WMS_SERVER_URI}`
export const TIMESERIES_ENDPOINT = `${DEPLOY_HOST_URL}${TIMESERIES_SERVICE_URI}`
export const LEAFLET_PROVIDERS = [
  {
    name: 'CartoDB.Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
    visible: false,
    attribution:
      'OpenStreetMap &copy; <a href="//carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  },
  {
    name: 'Stamen.TonerLite',
    url:
      'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png',
    minZoom: 0,
    maxZoom: 20,
    visible: false,
    attribution:
      'Tiles &copy; <a href="//stamen.com">Stamen Design</a> <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>',
  },
  {
    name: 'Esri.WorldTerrain',
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 13,
    visible: false,
    attribution:
      'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
  },
  {
    name: 'Esri.WorldTopoMap',
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri et al',
    visible: true,
  },
]

export class BaseMapProvider {
  static get default() {
    return LEAFLET_PROVIDERS[0]
  }
  static get(name) {
    return find(LEAFLET_PROVIDERS, { name })
  }
}
