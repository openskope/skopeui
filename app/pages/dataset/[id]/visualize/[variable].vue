<template>
  <v-container fluid class="fill-height align-start">
    <LoadingSpinner v-if="isLoadingMetadata" />
    <template v-else>
      <SubHeader :select-variable="true">
        <v-btn
          :disabled="!hasValidStudyArea"
          :to="analyzeLocation"
          color="accent"
          variant="flat"
        >
          Analyze Data
          <v-icon class="ml-2" size="small"> mdi-chevron-right </v-icon>
        </v-btn>
      </SubHeader>
      <v-row class="pa-0 mb-6">
        <!-- 2 column layout with map and time series-->
        <v-col
          class="d-flex map-flex pa-0"
          cols="12"
          lg="6"
          align-self="stretch"
        >
          <Map
            :step="requestedStep"
            :display-raster="true"
            map-engine="maplibre"
            @step-ready="frameReady"
            @step-error="frameFailed"
          />
        </v-col>
        <!-- time series plot -->
        <v-col
          class="d-flex map-flex pa-0"
          cols="12"
          lg="6"
          align-self="stretch"
        >
          <TimeSeriesPlot
            :show-step-controls="true"
            :show-playback-control="true"
            :is-playing="isPlaying"
            :can-play="canPlay"
            :is-step-loading="isStepLoading"
            :traces="traces"
            :step-selected="stepSelected"
            @step-selected="setStep"
            @toggle-playback="togglePlay"
            @pause-playback="pause"
          />
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import Map from "@/components/dataset/Map.client.vue";
import TimeSeriesPlot from "@/components/dataset/TimeSeriesPlot.vue";
import SubHeader from "@/components/dataset/SubHeader.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { axisYears, yearOfTimestep } from "@/utils/timeAxis";
import { useRasterPlayback } from "@/composables/useRasterPlayback";
import { useAppStore } from "@/stores/app";
import { useDatasetStore } from "@/stores/dataset";
import { useMessagesStore } from "@/stores/messages";
import { useLegacyStoreActions } from "@/composables/useLegacyStoreActions";

definePageMeta({
  layout: "default",
  key: (route: any) => route.fullPath,
  middleware: ["requires-study-area"],
});

const route = useRoute();
const appStore = useAppStore();
const datasetStore = useDatasetStore();
const messageStore = useMessagesStore();
const legacyActions = useLegacyStoreActions();

const playbackYears = computed(() =>
  datasetStore.metadata?.time ? axisYears(datasetStore.metadata.time) : [],
);
const playbackRange = computed(
  () => datasetStore.temporalRange as [number, number],
);
const {
  requestedStep,
  displayedStep: stepSelected,
  isPlaying,
  isLoading: isStepLoading,
  canPlay,
  frameReady,
  selectStep,
  togglePlay,
  pause,
} = useRasterPlayback(
  playbackYears,
  playbackRange,
  datasetStore.temporalRangeMin,
);
let frameTimeout: ReturnType<typeof setTimeout> | undefined;
watch(
  [requestedStep, isStepLoading],
  () => {
    clearTimeout(frameTimeout);
    if (isStepLoading.value) {
      const step = requestedStep.value;
      frameTimeout = setTimeout(() => frameFailed(step), 30_000);
    }
  },
  { immediate: true },
);

function frameFailed(step: number) {
  if (step !== requestedStep.value) return;
  clearTimeout(frameTimeout);
  selectStep(stepSelected.value);
  messageStore.error(
    `Unable to load the map for ${step}. Playback paused. Try another year.`,
  );
}
let stopTimeSeriesWatch: (() => void) | null = null;
let isUnmounted = false;

const hasValidStudyArea = computed(() => datasetStore.hasGeoJson);
// No link while leaving the page: a link without its params makes the router
// throw mid-render, which left every page blank.
const analyzeLocation = computed(() => {
  const { id, variable } = route.params;
  if (!id || !variable) return undefined;
  return { name: "dataset-id-analyze-variable", params: { id, variable } };
});
const isLoadingMetadata = computed(() => datasetStore.metadata == null);
const traces = computed(() => {
  const ts = datasetStore.timeseriesTrace;
  if (!ts) return [];
  return [{ ...ts, type: "scatter" }];
});

function setStep(step: number) {
  selectStep(step);
}

async function updateTimeSeries(data: any) {
  if (!datasetStore.canHandleTimeSeriesRequest) {
    datasetStore.setTimeSeriesNoArea();
    return;
  }
  datasetStore.setTimeSeriesLoading();
  try {
    const varId = route.params.variable as string;
    const jobId = datasetStore.jobIds?.[varId];
    const { newJobId, response } = await legacyActions.resolveTimeSeries(
      jobId,
      data,
    );
    datasetStore.setJobId(varId, newJobId);
    // Left for another page meanwhile: its status and messages are its own.
    if (isUnmounted) return;
    const originalSeries = response.series[0];
    const timeSeries = {
      x: originalSeries.timesteps.map(yearOfTimestep),
      y: originalSeries.values,
      options: originalSeries.options,
    };
    datasetStore.setTimeSeries({
      timeSeries,
      numberOfCells: response.n_cells,
      area: response.area,
    });
    datasetStore.setTimeSeriesLoaded();
  } catch (e: any) {
    if (isUnmounted) return;
    datasetStore.clearTimeSeries();
    if (e.response) {
      const { status, data: responseData } = e.response;
      const detail = Array.isArray(responseData.detail)
        ? responseData.detail
        : [{ msg: responseData.detail }];
      if (status === 504) {
        datasetStore.setTimeSeriesTimeout();
        messageStore.error(
          "This area took too long to process. Try a smaller one on the Select Area step.",
        );
      } else if (status >= 500) {
        datasetStore.setTimeSeriesServerError(detail);
        messageStore.error(
          detail.map((d: any) => d.msg).join(" ") ||
            "Server error. Please try again.",
        );
      } else if (status >= 400) {
        datasetStore.setTimeSeriesBadRequest(detail);
        messageStore.error(
          detail.map((d: any) => d.msg).join(" ") || "Bad request.",
        );
      }
    } else {
      const msg =
        e.message ||
        "An unknown error occurred while retrieving analysis results. Please go back to the Select Area and try again.";
      datasetStore.setTimeSeriesServerError([{ msg }]);
      messageStore.error(msg);
    }
  }
}

async function loadTimeSeries() {
  if (datasetStore.canHandleTimeSeriesRequest) {
    await updateTimeSeries(datasetStore.timeSeriesRequestData);
  }
}

await useAsyncData(
  `visualize-${route.params.id}-${route.params.variable}`,
  async () => {
    await legacyActions.initializeDataset(
      route.params.id as string,
      route.params.variable as string,
    );
    selectStep(datasetStore.temporalRangeMin);
    return true;
  },
  { server: false },
);

onMounted(() => {
  document.addEventListener("visibilitychange", pauseWhenHidden);
  legacyActions.initializeDatasetGeoJson();
  stopTimeSeriesWatch = watch(
    () => datasetStore.timeSeriesRequestData,
    async (data) => {
      if (data) {
        await updateTimeSeries(data);
      } else {
        await loadTimeSeries();
      }
    },
    { immediate: true },
  );
  appStore.setVisited();
});

onUnmounted(() => {
  clearTimeout(frameTimeout);
  document.removeEventListener("visibilitychange", pauseWhenHidden);
  isUnmounted = true;
  stopTimeSeriesWatch?.();
});

function pauseWhenHidden() {
  if (document.hidden) pause();
}
</script>

<style scoped>
/* The viewport less the app bar, step bar and page title, so the panels fit
   a laptop screen. A minimum, so the plot's column can grow to fit it. */
.map-flex {
  min-height: calc(100vh - 250px);
}

@media all and (max-width: 960px) {
  .map-flex {
    min-height: 450px;
  }
}

@media all and (max-width: 600px) {
  .map-flex {
    min-height: 450px;
  }
}
</style>
