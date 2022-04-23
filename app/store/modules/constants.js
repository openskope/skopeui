import { find } from "lodash";
import {
  API_HOST_URL,
  GEOSERVER_HOST_URL,
  BUILD_ID,
} from "@/store/modules/_constants";
export const WMS_SERVER_URI = "geoserver/SKOPE/wms?";
export const DEFAULT_CENTERED_SMOOTHING_WIDTH = 11;
export const SKOPE_WMS_ENDPOINT = `${GEOSERVER_HOST_URL}/${WMS_SERVER_URI}`;
export const TIMESERIES_ENDPOINT = `${API_HOST_URL}/timeseries`;
export const METADATA_ENDPOINT = `${API_HOST_URL}/metadata`;
export const LEAFLET_PROVIDERS = [
  {
    name: "CartoDB.Positron",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    visible: 2,
    attribution:
      'OpenStreetMap &copy; <a href="//carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
  },
  {
    name: "Stamen.TonerLite",
    url:
      "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png",
    visible: false,
    attribution:
      'Tiles &copy; <a href="//stamen.com">Stamen Design</a> <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>',
  },
  {
    name: "Esri.WorldTerrain",
    url:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
    visible: false,
    attribution:
      "Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS",
  },
  {
    name: "Esri.WorldTopoMap",
    url:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri et al",
    visible: 1,
  },
];

export class BaseMapProvider {
  static get(name) {
    return find(LEAFLET_PROVIDERS, { name });
  }
}

export function buildReadme(requestData) {
  return `
# SKOPE data for ${requestData.dataset_id} / ${requestData.variable_id}
### [version: ${BUILD_ID}](https://github.com/openskope/skopeui)

## Terms of Service
By using the SKOPE application, you assume any risk associated with its use. You are solely responsible for any damage or loss you may incur resulting from your reliance on or use of information provided by SKOPE.

## Citation
Use of data, graphics, or other information provided by SKOPE should be accompanied by a citation of the original data source (provided by SKOPE in the dataset metadata) and of the SKOPE application Web page. Example reference: (SKOPE 2021).

Example Citation:
> SKOPE 2021 SKOPE: Synthesizing Knowledge of Past Environments. https://app.openskope.org/. Accessed 1 July 2021.

## Contact
For comments, feedback, or questions, please use the "Email Us" button on the application navigation bar or send us a note at skope-team@googlegroups.com

Time range: ${requestData.time_range.gte} - ${requestData.time_range.lte} CE
Location: ${JSON.stringify(requestData.selected_area, null, 2)}

## Files
- \`skope-request.json\` - A plaintext JSON file with all input parameters needed to recreate this analysis. Load this file into the SKOPE app to regenerate the data in this zipfile.
- \`summary-statistics.json\` - The computed mean, median, and standard deviation of the time series data.
- \`plot.png\` and \`plog.svg\` - Graph of the time series data.
- \`time-series.json\` and \`time-series.csv\` - time series data in JSON and long form CSV formats.
- \`study-area.geojson\` - GeoJSON file with the defined study area.
`;
}
