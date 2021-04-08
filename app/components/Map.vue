<template>
  <v-card class="mx-10" height="100%" elevation="2" style="z-index: 1" outlined>
    <v-card-title>
      <v-tooltip top>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" text v-on="on" @click="exportSelectedGeometry">
            <a id="exportSelectedGeometry">
              <v-icon>fas fa-download</v-icon>
              Download study area as a GeoJSON file
            </a>
          </v-btn>
        </template>
        <span>Download study area as a GeoJSON file</span>
      </v-tooltip>
      <input
        id="loadGeoJsonFile"
        type="file"
        style="display: none"
        @change="loadGeoJson"
      />
      <v-tooltip top>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" text v-on="on" @click="selectGeoJsonFile">
            <v-icon>fas fa-upload</v-icon>
            Upload a GeoJSON file
          </v-btn>
        </template>
        <span>Upload a GeoJSON file</span>
      </v-tooltip>
      <v-spacer></v-spacer>
      <h3 class="headline">Selected area: {{ selectedArea }} km<sup>2</sup></h3>
    </v-card-title>
    <v-card-text style="height: 90%">
      <client-only placeholder="Loading map, please wait...">
        <l-map
          ref="layerMap"
          :min-zoom="3"
          :zoom="4"
          :center="metadata.region.center"
          @ready="mapReady"
        >
          <l-control-attribution v-if="showMapControls" position="topright" />
          <l-tile-layer
            v-for="provider of leafletProviders"
            :key="provider.name"
            :url="provider.url"
            :name="provider.name"
            :attribution="provider.attribution"
            :visible="provider.default"
            :min-zoom="provider.minZoom"
            :max-zoom="provider.maxZoom"
            layer-type="base"
          />
          <l-rectangle
            :bounds="metadata.region.extents"
            :style="metadata.region.style"
            :fill-opacity="defaultRegionOpacity"
          />
          <l-control-layers
            v-if="showMapControls"
            :sort-layers="false"
            position="topright"
          />
          <l-wms-tile-layer
            v-for="v of metadata.variables"
            ref="wmsLayers"
            :key="v.id"
            :base-url="skopeWmsUrl"
            :layers="fillTemplateYear(v.wmsLayer)"
            :name="v.name"
            :crs="defaultCrs"
            :transparent="true"
            :opacity="layerOpacity"
            layer-type="overlay"
            :attribution="v.name"
            :visible="v.visible"
            version="1.3.0"
            format="image/png"
          />
          <l-control-scale position="bottomright" />
        </l-map>
      </client-only>
    </v-card-text>
  </v-card>
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import { Prop, Watch } from "vue-property-decorator";
import {
  LEAFLET_PROVIDERS,
  SKOPE_WMS_ENDPOINT,
} from "@/store/modules/constants";
import circleToPolygon from "circle-to-polygon";
import { stringify } from "query-string";
import {
  initializeDatasetGeoJson,
  clearGeoJson,
  saveGeoJson,
} from "@/store/actions";

const fillTemplate = require("es6-dynamic-template");
import _ from "lodash";

@Component({
  components: {},
})
class Map extends Vue {
  @Prop({ default: 2000 })
  year;

  @Prop({ default: 0.5 })
  opacity;

  maxTemporalRange = new Date().getFullYear();

  defaultRegionOpacity = 0.05;
  defaultCircleToPolygonEdges = 32;
  legendImage = null;
  legendControl = null;
  legendPosition = "bottomleft";
  wMinTemporalRangeKey = "skope:temporal-range-min";
  wMaxTemporalRangeKey = "skope:temporal-range-max";

  get stepNames() {
    return this.$api().app.stepNames;
  }

  get metadata() {
    return this.$api().dataset.metadata;
  }

  get timespan() {
    return this.$api().dataset.timespan;
  }

  get timeZero() {
    return this.$api().dataset.timeZero;
  }

  get variable() {
    return this.$api().dataset.variable;
  }

  get geoJson() {
    return this.$api().dataset.geoJson;
  }

  get selectedArea() {
    return (this.$api().dataset.selectedAreaInSquareMeters / 1000000.0).toFixed(
      2
    );
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name);
  }

  get showMapControls() {
    return this.currentStep >= 2;
  }

  get selectedLayerName() {
    return this.isLayerSelected ? this.variable.name : "";
  }

  get opacityLabel() {
    return `${this.selectedLayerName} Opacity`;
  }

  get layerOpacity() {
    return this.opacity / 100.0;
  }

  get isLayerSelected() {
    return this.variable !== null;
  }

  get skopeWmsUrl() {
    return SKOPE_WMS_ENDPOINT;
  }

  get leafletProviders() {
    return LEAFLET_PROVIDERS;
  }

  get defaultCrs() {
    if (this.$L) {
      return this.$L.CRS.EPSG4326;
    }
    return "";
  }

  set variable(id) {
    this.$api().dataset.setVariable(id);
  }

  destroyed() {
    if (this.geoJsonUnwatcher) {
      this.geoJsonUnwatcher();
    }
  }

  mapReady(map) {
    const handler = (event) => {
      console.log("handling layer change event ", { event });
      const leafletLayer = event.layer;
      if (this.isSkopeLayer(leafletLayer)) {
        const variable = _.find(
          this.metadata.variables,
          (v) => v.name === event.name
        );
        this.$api().dataset.setVariable(variable.id);
        this.updateWmsLegend(map, leafletLayer.wmsParams.layers);
        leafletLayer.bringToFront();
      }
    };
    map.on("overlayadd", handler);
    map.on("baselayerchange", handler);
    this.addDrawToolbar(map);
    initializeDatasetGeoJson(this.$warehouse, this.$api());
    this.registerToolbarHandlers(map);
    this.geoJsonUnwatcher = this.$watch(
      "geoJson",
      function (geoJson) {
        console.log("watcher updating geojson", geoJson);
        if (geoJson === null) {
          this.drawnItems.clearLayers();
        } else {
          this.renderSelectedArea(geoJson, map);
        }
      },
      { immediate: true }
    );
  }

  addDrawToolbar(map) {
    const L = this.$L;
    this.drawnItems = new L.FeatureGroup();
    map.addLayer(this.drawnItems);
    this.drawControlFull = new L.Control.Draw({
      position: "topleft",
      draw: {
        // disable polylines and circlemarkers, allow polygon, rectangle, circle, and marker
        polyline: false,
        circlemarker: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
      },
      edit: {
        featureGroup: this.drawnItems,
      },
    });
    this.drawControlEditOnly = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems,
      },
      draw: true,
    });
    // set custom tooltips on the draw and edit toolbars
    const drawControlButtons = L.drawLocal.draw.toolbar.buttons;
    drawControlButtons.marker = "Select a point";
    drawControlButtons.polygon = "Select a polygon area";
    drawControlButtons.circle = "Select a circular area";
    drawControlButtons.rectangle = "Select a rectangular area";
    const editControlButtons = L.drawLocal.edit.toolbar.buttons;
    editControlButtons.edit = "Edit spatial selection";
    editControlButtons.editDisabled = "No spatial selection to edit";
    editControlButtons.remove = "Clear spatial selection";
    editControlButtons.removeDisabled = "No spatial selection to remove";
    map.addControl(this.drawControlFull);
  }

  registerToolbarHandlers(map) {
    const L = this.$L;
    // check for persisted geometry
    map.on(L.Draw.Event.EDITRESIZE, (event) => this.saveGeoJson(event.layer));
    map.on(L.Draw.Event.EDITMOVE, (event) => this.saveGeoJson(event.layer));
    map.on(L.Draw.Event.EDITVERTEX, (e) => this.saveGeoJson(e.poly));
    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      this.saveGeoJson(layer);
      this.drawnItems.addLayer(layer);
      this.enableEditOnly(map);
    });
    map.on(L.Draw.Event.DELETED, (event) => {
      clearGeoJson(this.$warehouse, this.$api());
      if (this.drawnItems.getLayers().length === 0) {
        this.disableEditOnly(map);
      }
    });
  }

  renderSelectedArea(geoJson, map) {
    const L = this.$L;
    const geoJsonLayer = this.toLeafletLayer(geoJson);
    if (!map) {
      map = this.$refs.layerMap.mapObject;
    }
    // remove all existing layers from the FeatureGroup
    this.drawnItems.clearLayers();
    geoJsonLayer.eachLayer((l) => {
      this.drawnItems.addLayer(l);
    });
    this.enableEditOnly(map);
    let padding = [5, 5];
    if (geoJsonLayer instanceof L.Marker) {
      padding = [30, 30];
    }
    map.fitBounds(this.drawnItems.getBounds(), { padding });
  }

  /**
   * persists geo json to the vuex store and local storage / warehouse and
   * converts leaflet circles to polygons
   */
  saveGeoJson(layer) {
    const data = layer.toGeoJSON();
    if (layer instanceof L.Circle) {
      data.properties.radius = layer.getRadius();
      const geometry = circleToPolygon(
        data.geometry.coordinates,
        layer.getRadius(),
        this.defaultCircleToPolygonEdges
      );
      data.geometry = geometry;
    }
    // save geoJSON in local storage (consider pushing into the vuex store)
    saveGeoJson(this.$warehouse, this.$api(), data);
  }

  toLeafletLayer(geoJson) {
    const L = this.$L;
    return L.geoJson(geoJson, {
      // convert persisted circles to L.Circle instead of L.Marker
      pointToLayer: (feature, latlng) => {
        if (feature.properties.radius) {
          return new L.Circle(latlng, feature.properties.radius);
        } else {
          return new L.Marker(latlng);
        }
      },
    });
  }

  disableEditOnly(map) {
    this.drawControlEditOnly.remove(map);
    this.drawControlFull.addTo(map);
  }

  enableEditOnly(map) {
    this.drawControlFull.remove(map);
    this.drawControlEditOnly.addTo(map);
  }

  setLegendImage(htmlElement) {
    this.legendImage = htmlElement;
  }

  generateWmsLegendUrl(layerName) {
    const query = {
      REQUEST: "GetLegendGraphic",
      VERSION: "1.0.0",
      FORMAT: "image/png",
      LAYER: layerName,
      LEGEND_OPTIONS: "layout:vertical;dx:10",
    };
    const queryString = stringify(query);
    const legendUrl = this.skopeWmsUrl + queryString;
    return legendUrl;
  }

  @Watch("year")
  updateWmsLayer() {
    // hairy bit of code to:
    // 1. pull out the currently selected layer's layer template string
    // 2. update it with the current year
    // 3. reset the params on the currently selected layer to request the new layer from GeoServer
    if (this.variable !== null) {
      for (const wmsLayerRef of this.$refs.wmsLayers) {
        if (wmsLayerRef.name === this.variable.name) {
          const layerName = this.fillTemplateYear(this.variable.wmsLayer);
          const wmsLayer = wmsLayerRef.mapObject;
          wmsLayer.setParams({ layers: layerName }, false);
        }
      }
    }
  }

  updateWmsLegend(map, layerName) {
    const L = this.$L;
    const wmsLegendUrl = this.generateWmsLegendUrl(layerName);
    if (_.isNil(this.legendControl)) {
      const legend = L.control({ position: this.legendPosition });
      legend.onAdd = (map) => {
        const controlCss = "leaflet-control-wms-legend";
        const legendCss = "wms-legend";
        const div = L.DomUtil.create("div", controlCss);
        const legendImage = L.DomUtil.create("img", legendCss, div);
        legendImage.src = wmsLegendUrl;
        this.setLegendImage(legendImage);
        return div;
      };
      legend.addTo(map);
      this.legendControl = legend;
    }
    if (this.legendImage !== null) {
      this.legendImage.src = wmsLegendUrl;
    }
  }

  fillTemplateYear(templateString) {
    const year = (this.year || this.maxTemporalRange).toString();
    const layer = fillTemplate(templateString, {
      year: year.padStart(4, "0"),
    });
    return layer;
  }

  isSkopeLayer(leafletLayer) {
    return (leafletLayer.options.layers || "").startsWith("SKOPE");
  }

  loadGeoJson(event) {
    const file = event.target.files[0];
    file.text().then((text) => {
      console.log("received possible geojson to load: ", text);
      try {
        const geojson = JSON.parse(text);
        this.$api().dataset.setGeoJson(geojson);
      } catch (error) {
        console.error(error);
        // FIXME: this should be a toast or other notification
        alert("Sorry! We couldn't re-import this file: " + text);
      }
    });
  }

  selectGeoJsonFile() {
    document.getElementById("loadGeoJsonFile").click();
  }

  exportSelectedGeometry(event) {
    const geoJson = this.$api().dataset.geoJson;
    if (geoJson) {
      console.log("exporting selected geoJson: ", { geoJson });
      const convertedArea =
        "text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(geoJson));
      const button = document.getElementById("exportSelectedGeometry");
      button.setAttribute("href", "data:" + convertedArea);
      // FIXME: generate a more unique name using the lat lngs or similar
      button.setAttribute("download", `${this.metadata.id}.geojson`);
    }
  }
}
export default Map;
</script>
<style>
.leaflet-top.leaflet-right
  .leaflet-control-layers:nth-child(2)
  .leaflet-control-layers-toggle {
  background-image: url(/earth.svg);
}

#exportSelectedGeometry {
  text-decoration: none;
  color: inherit;
}

.map {
  height: calc(100% - 48px);
  position: relative;
  z-index: 1;
}

ul.leaflet-draw-actions.leaflet-draw-actions-bottom li a[title="Save changes"] {
  display: none;
}
</style>
