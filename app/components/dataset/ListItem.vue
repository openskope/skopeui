<template>
  <v-row align-content-start justify-space-around>
    <v-col cols="12" md="4" class="list-item-map-col">
      <client-only>
        <NuxtLink :to="absoluteUrl">
          <l-map
            :min-zoom="2"
            :zoom="initialCenter.zoom"
            :center="initialCenter.center"
            :options="{ zoomSnap: 0.25 }"
            class="list-item-map"
            @ready="fitToViewport"
          >
            <l-control-scale />
            <l-tile-layer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
            />
            <l-rectangle
              :bounds="leafletBounds(bbox)"
              :color="MAP_COLORS.datasetExtent"
              :weight="2"
              :fill-opacity="0.12"
            />
          </l-map>
        </NuxtLink>
      </client-only>
    </v-col>
    <v-col cols="12" md="8" class="list-item-info-col d-flex">
      <v-card elevation="0" class="list-item-info">
        <v-card-title class="ma-0 pa-0">
          <div class="text-h6">
            <NuxtLink :to="absoluteUrl" class="dataset-title">
              {{ title }}
            </NuxtLink>
            <MetadataModal :metadata-id="id" />
          </div>
          <div class="list-item-coverage">
            {{ spatialCoverage }} | {{ temporalCoverage }}
          </div>
        </v-card-title>
        <v-card-text class="list-item-description mt-3 pa-0">
          <span v-html="$md.render(safeDescription)" />
        </v-card-text>
        <VariableList :variables="safeVariables" />
        <v-card-text v-if="sourceLink" class="list-item-source">
          <b class="text-subtitle-1">Source:</b>{{ " " }}
          <a target="_blank" :href="sourceLink.href">
            {{ sourceLink.title ?? sourceLink.href }}
          </a>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from "vue";
import { BaseMapProvider } from "@/store/modules/constants";
import MetadataModal from "@/components/dataset/MetadataModal.vue";
import VariableList from "@/components/dataset/VariableList.vue";
import {
  getInitialMapViewport,
  leafletBounds,
  leafletStartView,
} from "@/composables/useMapInitialViewport";
import type { MapView, OverviewLink, Time, Variable } from "@/types/metadata";
import { timeCoverageLabel } from "@/utils/timeAxis";
import { MAP_COLORS } from "@/utils/colors";

const props = defineProps<{
  title: string;
  region_name: string;
  resolution_label: string;
  time: Time;
  links: OverviewLink[];
  bbox: [number, number, number, number];
  map_view: MapView | null;
  description: string;
  id: string;
  variables: Variable[];
}>();

const viewport = computed(() => getInitialMapViewport(props));
const initialCenter = computed(() => leafletStartView(viewport.value));

// Leaflet reads its size once, so it would leave the rest gray when the row
// grows, as when a variable category is expanded.
let resizeObserver: ResizeObserver | null = null;

function fitToViewport(map: any) {
  if ("bbox" in viewport.value)
    map.fitBounds(leafletBounds(viewport.value.bbox));
  resizeObserver = new ResizeObserver(() => map.invalidateSize());
  resizeObserver.observe(map.getContainer());
}

onBeforeUnmount(() => resizeObserver?.disconnect());

const safeDescription = computed(() => props.description ?? "");
const safeVariables = computed(() => props.variables ?? []);

const spatialCoverage = computed(
  () => `${props.region_name} at ${props.resolution_label}`,
);
const temporalCoverage = computed(() => timeCoverageLabel(props.time));
// STAC's "via" link points at the source the dataset was taken from.
const sourceLink = computed(() =>
  props.links.find((link) => link.rel === "via"),
);
const absoluteUrl = computed(() => `/dataset/${props.id}`);
</script>
<style scoped>
/* An underline that becomes a highlight on hover, in the theme's accent. */
.dataset-title {
  padding: 0 6px;
  margin: 0 -6px;
  text-decoration: none;
  box-shadow: inset 0 -2px 0 rgb(var(--v-theme-accent));
  transition: box-shadow 0.3s;
  color: inherit;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.dataset-title:hover {
  box-shadow: inset 0 -1.6em 0 rgb(var(--v-theme-accent));
  color: white;
}

.list-item-coverage {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: rgb(var(--v-theme-muted));
}

/* A little wider than Vuetify's 4 of 12 columns for the map. */
@media (min-width: 960px) {
  .list-item-map-col {
    flex: 0 0 38%;
    max-width: 38%;
  }

  .list-item-info-col {
    flex: 1 1 0;
    min-width: 0;
    max-width: none;
  }
}

/* The source line sits at the bottom of the row, however long the rest is. */
/* Visible overflow, so the title's highlight isn't cut off on the left. */
.list-item-info,
.list-item-info :deep(.v-card-title) {
  overflow: visible;
}

.list-item-info {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  width: 100%;
}

.list-item-description {
  flex: 0 0 auto;
}

.list-item-source {
  flex: 0 0 auto;
  margin-top: auto;
  padding: 8px 0 0;
}

.list-item-source a {
  color: rgb(var(--v-theme-primary));
}

/* Fills the column beside the text. The minimum keeps a dataset with few
   variable categories about as tall as the others, and gives the map a height
   when it's stacked above the text. */
.list-item-map {
  position: relative;
  z-index: 1;
  min-height: 300px;
  cursor: pointer;
}
</style>
