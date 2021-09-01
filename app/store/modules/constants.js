import { find } from "lodash";
import { API_HOST_URL, GEOSERVER_HOST_URL } from "@/store/modules/_constants";
export const WMS_SERVER_URI = "geoserver/SKOPE/wms?";
export const TIMESERIES_SERVICE_URI = "timeseries-service/api/v2/";
export const SKOPE_WMS_ENDPOINT = `${GEOSERVER_HOST_URL}/${WMS_SERVER_URI}`;
export const TIMESERIES_V2_ENDPOINT = `${API_HOST_URL}${TIMESERIES_SERVICE_URI}timeseries`;
export const METADATA_ENDPOINT = `${API_HOST_URL}${TIMESERIES_SERVICE_URI}metadata`;
export const LEAFLET_PROVIDERS = [
  {
    name: "CartoDB.Positron",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    maxZoom: 19,
    visible: false,
    attribution:
      'OpenStreetMap &copy; <a href="//carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
  },
  {
    name: "Stamen.TonerLite",
    url:
      "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png",
    minZoom: 0,
    maxZoom: 20,
    visible: false,
    attribution:
      'Tiles &copy; <a href="//stamen.com">Stamen Design</a> <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>',
  },
  {
    name: "Esri.WorldTerrain",
    url:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 13,
    visible: false,
    attribution:
      "Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS",
  },
  {
    name: "Esri.WorldTopoMap",
    url:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri et al",
    visible: true,
  },
];

export class BaseMapProvider {
  static get default() {
    return LEAFLET_PROVIDERS[0];
  }
  static get(name) {
    return find(LEAFLET_PROVIDERS, { name });
  }
}

export function buildReadme(requestData) {
  return `
# SKOPE data for ${requestData.dataset_id} / ${requestData.variable_id}

## Terms of Service
By using the SKOPE application, you assume any risk associated with its use. You are solely responsible for any damage or loss you may incur resulting from your reliance on or use of information. provided by SKOPE.

## Citation
Use of data, graphics, or other information provided by SKOPE should be accompanied by a citation of the original data source (provided by SKOPE in the dataset metadata) and of the SKOPE application Web page. Example reference: (SKOPE 2021).

Example Citation:
> SKOPE 2021 SKOPE: Synthesizing Knowledge of Past Environments. https://app.openskope.org/. Accessed 1 July 2021.

## Contact Us
Please use the "Email Us" button on the application navigation bar or submit your message directly to https://www.comses.net/about/contact)

Time range: ${requestData.time_range.gte} - ${requestData.time_range.lte} CE
Location: ${JSON.stringify(requestData.selected_area, null, 2)}

## Files
- \`request.json\` - a shareable file that contains all of the input parameters needed to recreate the analysis. You should be able to re-upload this file to SKOPE to generate the same analysis if the version is compatible
- \`summaryStatistics.json\` - the mean, median, and standard deviation of the time series data
- \`plot.png\` and \`plog.svg\` - plotly generated graph
- \`timeseries.json\` and \`timeseries.csv\` - the timeseries data in JSON and long form CSV formats
- \`studyarea.geojson\` - a GeoJSON file for the defined study area
`;
}
