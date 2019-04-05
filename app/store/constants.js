export const DEPLOY_HOST_URL = 'https://app.openskope.org/' // FIXME: this should be parameterized at build / deployment
export const WMS_SERVER_URI = 'geoserver/SKOPE/wms?'
export const TIMESERIES_SERVICE_URI = 'timeseries-service/api/v1/timeseries/'
export const SKOPE_WMS_ENDPOINT = `${DEPLOY_HOST_URL}${WMS_SERVER_URI}`
export const TIMESERIES_ENDPOINT = `${DEPLOY_HOST_URL}${TIMESERIES_SERVICE_URI}`
const BASE_MAP_TILE_SERVERS = [
  {
    name: 'arcgis',
    title: 'ArcGIS World Topography Map',
    type: 'xyz',
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      "&copy; <a target='_blank' href='https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer'>Esri and other contributors</a>"
  },
  {
    name: 'osm',
    title: 'OpenStreetMap',
    type: 'xyz',
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    attribution:
      "&copy; <a target='_blank' href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
  }
]
const BASE_MAP_WMS_SERVERS = [
  {
    name: 'ahocevar',
    title: 'ne_10m_admin_0_countries',
    type: 'wms',
    url:
      'https://ahocevar.com/geoserver/ne/wms?layers=ne:ne_10m_admin_0_countries&tiled=true'
  },
  {
    name: 'Mundialis TOPO-OSM-WMS',
    url: 'http://ows.mundialis.de/services/service?',
    layer: 'TOPO-OSM-WMS'
  }
]

export class BaseMapEndpoints {
  static get default() {
    return BASE_MAP_TILE_SERVERS[0]
  }

  static get defaultWms() {
    return BASE_MAP_WMS_SERVERS[0]
  }
}
