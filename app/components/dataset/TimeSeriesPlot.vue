<template>
  <v-card variant="outlined" class="time-series-card">
    <PanelHeader>
      <AreaReadout v-if="showArea" />
      <v-form
        v-model="isTemporalRangeValid"
        class="time-series-range"
        @click="enableTemporalRangeEdit"
      >
        <v-text-field
          v-model.number="formTemporalRangeMin"
          class="time-series-range-field"
          label="From"
          density="compact"
          variant="outlined"
          hide-details="auto"
          :disabled="!isTemporalRangeEditable"
          :min="minStep"
          :max="maxStep - 1"
          type="number"
          :rules="[validateMinStep]"
          @keydown.enter="setTemporalRange"
        />
        <v-text-field
          v-model.number="formTemporalRangeMax"
          class="time-series-range-field"
          label="To"
          density="compact"
          variant="outlined"
          hide-details="auto"
          :disabled="!isTemporalRangeEditable"
          :min="minStep + 1"
          :max="maxStep"
          :rules="[validateMaxStep]"
          type="number"
          @keydown.enter="setTemporalRange"
        />
        <v-btn
          :disabled="!hasTemporalRangeChanges || !isTemporalRangeValid"
          size="small"
          color="secondary"
          @click="setTemporalRange"
        >
          Apply
        </v-btn>
        <v-btn size="small" color="secondary" @click="resetTemporalRange">
          Reset
        </v-btn>
        <span class="time-series-range-steps">{{ timeStepsLabel }}</span>
      </v-form>
    </PanelHeader>

    <div
      class="time-series-plot-shell"
      :class="{ 'time-series-plot-shell--last': !showStepControls }"
    >
      <div
        v-if="timeSeriesRequestStatus.status === 'loading'"
        class="timeseries-loading-overlay"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="52"
          width="4"
        />
        <p class="loading-message mt-4">{{ loadingMessage }}</p>
      </div>
      <client-only placeholder="Loading...">
        <template
          v-if="
            timeSeriesRequestStatus.status !== 'success' &&
            timeSeriesRequestStatus.status !== 'loading'
          "
        >
          <v-alert
            v-for="(message, index) in timeSeriesRequestStatus.messages.filter(
              (m) => m.type !== 'error',
            )"
            :key="index"
            :type="message.type"
            class="mb-2"
          >
            {{ message.value }}
          </v-alert>
        </template>
        <Plotly
          ref="plotlyRef"
          class="time-series"
          :data="timeSeriesData"
          :layout="layoutMetadata"
          :options="options"
          @click="updatePlotlyStep"
        />
      </client-only>
    </div>

    <!-- The current timestep sits between the buttons that change it, centred
         under the plot; the x-axis title already says "Timestep". -->
    <div v-if="showStepControls" class="time-series-step-controls">
      <v-tooltip
        location="top"
        text="Go to the first timestep of the defined temporal range"
      >
        <template #activator="{ props }">
          <v-btn
            icon
            size="small"
            v-bind="props"
            color="accent"
            @click="gotoFirstStep"
          >
            <v-icon>mdi-skip-previous</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip location="top" text="Previous timestep">
        <template #activator="{ props }">
          <v-btn
            icon
            size="small"
            v-bind="props"
            color="accent"
            @click="previousStep"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <!-- Changes with these buttons, by clicking the plot, or by typing a
           timestep and pressing Enter. -->
      <input
        v-model="stepDraft"
        class="time-series-current-step"
        :class="{ 'time-series-current-step--invalid': isStepDraftInvalid }"
        :style="{ width: currentStepWidth }"
        type="text"
        inputmode="numeric"
        title="Type a timestep and press Enter"
        aria-label="Current timestep"
        :aria-invalid="isStepDraftInvalid"
        :aria-describedby="stepMessageId"
        data-test="current-step"
        @focus="($event.target as HTMLInputElement).select()"
        @input="hideStepMessage"
        @keydown.enter="applyStepDraft"
        @keydown.esc="resetStepDraft"
        @blur="applyStepDraftOnBlur"
      >
      <v-tooltip location="top" text="Next timestep">
        <template #activator="{ props }">
          <v-btn
            icon
            size="small"
            v-bind="props"
            color="accent"
            @click="nextStep"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="top"
        text="Go to the last timestep of the defined temporal range"
      >
        <template #activator="{ props }">
          <v-btn
            icon
            size="small"
            v-bind="props"
            color="accent"
            @click="gotoLastStep"
          >
            <v-icon>mdi-skip-next</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <!-- In the controls' bottom padding, so nothing moves when it shows. -->
      <Transition name="time-series-step-message">
        <span
          v-if="isStepMessageVisible"
          :id="stepMessageId"
          class="time-series-step-message"
          role="status"
          data-test="step-message"
        >
          Choose a timestep from {{ temporalRangeMin }} to
          {{ temporalRangeMax }}
        </span>
      </Transition>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  defineAsyncComponent,
  useId,
} from "vue";
import _ from "lodash";
import AreaReadout from "@/components/dataset/AreaReadout.vue";
import PanelHeader from "@/components/dataset/PanelHeader.vue";
import { useDatasetStore } from "@/stores/dataset";
import { wrapPlotTitle } from "@/utils/plotTitle";
import { PLOT_COLORS } from "@/utils/colors";
import { axisYears, stepAlongAxis, stepFromText } from "@/utils/timeAxis";

const props = defineProps<{
  stepSelected?: number | null;
  showStepControls?: boolean;
  /** Show the API's area and cell count (analyze; visualize shows it on the map). */
  showArea?: boolean;
  traces?: any[];
  yAxisLabel?: string | null;
}>();

const emit = defineEmits<{
  (e: "step-selected", step: number): void;
  (e: "selected-temporal-range", range: [number, number]): void;
}>();

// Lazy-load PlotlyClient to avoid SSR issues
const Plotly = defineAsyncComponent(
  () => import("@/components/dataset/PlotlyClient.vue"),
);

const datasetStore = useDatasetStore();

// Local state
const localTemporalRangeMin = ref(1);
const localTemporalRangeMax = ref(new Date().getFullYear());
const isTemporalRangeEditable = ref(false);
const isTemporalRangeValid = ref(false);
const plotlyRef = ref<any>(null);

const PROGRESSIVE_MESSAGES = [
  { delay: 8_000, text: "Still working..." },
  { delay: 16_000, text: "Hang tight, almost there..." },
  {
    delay: 24_000,
    text: "This is taking longer than usual, but we'll get there...",
  },
];

const loadingMessage = ref("");
let progressiveTimers: ReturnType<typeof setTimeout>[] = [];

function startProgressiveMessages() {
  clearProgressiveMessages();
  progressiveTimers = PROGRESSIVE_MESSAGES.map(({ delay, text }) =>
    setTimeout(() => {
      loadingMessage.value = text;
    }, delay),
  );
}

function clearProgressiveMessages() {
  progressiveTimers.forEach(clearTimeout);
  progressiveTimers = [];
  loadingMessage.value = "";
}

// Computed
const selectedTemporalRange = computed({
  get() {
    return datasetStore.temporalRange;
  },
  set(range: [number, number]) {
    datasetStore.setTemporalRange(range);
    emit("selected-temporal-range", datasetStore.temporalRange);
  },
});

const temporalRangeMin = computed(() => datasetStore.temporalRangeMin);
const temporalRangeMax = computed(() => datasetStore.temporalRangeMax);
const timeSeriesRequestStatus = computed(
  () => datasetStore.timeSeriesRequestStatus,
);
const axis = computed(() =>
  datasetStore.metadata ? axisYears(datasetStore.metadata.time) : [],
);
// As wide as the longest timestep on the axis (a year now; a date such as
// 2000-01-01 once finer axes are read), so the buttons don't shift as it
// changes.
const currentStepWidth = computed(() => {
  const longest = Math.max(1, ...axis.value.map((step) => `${step}`.length));
  return `${longest + 0.5}ch`;
});
const minStep = computed(() => datasetStore.minYear);
const maxStep = computed(() => datasetStore.maxYear);
const variable = computed(() => datasetStore.variable as any);
const timeSeriesData = computed(() => props.traces);
const hasMultipleTimeSeries = computed(
  () => props.traces != null && props.traces.length > 1,
);
const hasTimeSeries = computed(
  () => props.traces != null && props.traces[0]?.x?.length > 0,
);
const canHandleTimeSeriesRequest = computed(
  () => datasetStore.canHandleTimeSeriesRequest,
);

const formTemporalRangeMin = computed({
  get() {
    return isTemporalRangeEditable.value
      ? localTemporalRangeMin.value
      : selectedTemporalRange.value[0];
  },
  set(value: number) {
    localTemporalRangeMin.value = value;
  },
});

const formTemporalRangeMax = computed({
  get() {
    return isTemporalRangeEditable.value
      ? localTemporalRangeMax.value
      : selectedTemporalRange.value[1];
  },
  set(value: number) {
    localTemporalRangeMax.value = value;
  },
});

const hasTemporalRangeChanges = computed(
  () =>
    localTemporalRangeMin.value !== selectedTemporalRange.value[0] ||
    localTemporalRangeMax.value !== selectedTemporalRange.value[1],
);

const timeStepsLabel = computed(() => {
  const steps =
    selectedTemporalRange.value[1] - selectedTemporalRange.value[0] + 1;
  return `${steps} time steps`;
});

const yAxisTitle = computed(() => {
  if (props.yAxisLabel) return props.yAxisLabel;
  const { title, unit } = variable.value;
  return unit ? `${title} (${unit})` : title;
});

const shapes = computed(() => {
  if (!_.isNull(props.stepSelected ?? null)) {
    return [
      {
        type: "line",
        x0: props.stepSelected,
        x1: props.stepSelected,
        yref: "paper",
        y0: 0,
        y1: 1,
        line: { color: PLOT_COLORS.plotAccent, width: 3 },
      },
    ];
  }
  return [];
});

// The left margin is a fixed budget for the y tick labels and a title of up
// to two lines, so the plot doesn't move when the variable or transform
// changes. Tick labels wider than 5 characters (-1000) would run into the
// title.
const Y_TICK_LABELS_WIDTH = 58;
const AXIS_TITLE_SIZE = 14;
const Y_TITLE_LINE_HEIGHT = 20;
const MARGIN_LEFT = Y_TICK_LABELS_WIDTH + 2 * Y_TITLE_LINE_HEIGHT + 4;
// The longest title kept on one line. It fits the plot's minimum height
// (.time-series), and longer titles wrap in two halves that do too.
const Y_TITLE_MAX_LINE_LENGTH = 44;

// An annotation, not the axis title: Plotly places an axis title from its tick
// labels, so it would move with their width. A one-line title sits on the
// line next to the axis.
const yAxisTitleAnnotation = computed(() => ({
  text: wrapPlotTitle(yAxisTitle.value ?? "", Y_TITLE_MAX_LINE_LENGTH),
  font: { size: AXIS_TITLE_SIZE },
  textangle: -90,
  xref: "paper",
  yref: "paper",
  x: 0,
  y: 0.5,
  xanchor: "right",
  yanchor: "middle",
  xshift: -Y_TICK_LABELS_WIDTH,
  showarrow: false,
}));

const layoutMetadata = computed(() => ({
  autosize: true,
  margin: { l: MARGIN_LEFT, b: 60, t: 10, pad: 2 },
  showlegend: hasMultipleTimeSeries.value,
  legend: { x: 1, y: 0.5 },
  xaxis: {
    title: { text: "Timestep", font: { size: AXIS_TITLE_SIZE } },
    linewidth: 3,
    gridwidth: 3,
    automargin: true,
  },
  yaxis: {
    linewidth: 3,
    gridwidth: 3,
  },
  font: { size: 14 },
  // In trace order: the first series, then Smoothed.
  colorway: [PLOT_COLORS.main, PLOT_COLORS.plotAccent],
  shapes: shapes.value,
  annotations: [yAxisTitleAnnotation.value],
}));

const options = computed(() => ({
  displaylogo: false,
  modeBarButtonsToRemove: ["toImage"],
  responsive: true,
}));

function getPlotlyApi() {
  const plotlyInstance = plotlyRef.value as any;
  if (!plotlyInstance) {
    return null;
  }

  if (
    typeof plotlyInstance.toImage === "function" ||
    typeof plotlyInstance.update === "function"
  ) {
    return plotlyInstance;
  }

  if (plotlyInstance.$?.exposed) {
    return plotlyInstance.$.exposed;
  }

  if (plotlyInstance.$?.subTree?.component?.exposed) {
    return plotlyInstance.$.subTree.component.exposed;
  }

  return null;
}

// Methods
function enableTemporalRangeEdit() {
  if (isTemporalRangeEditable.value) return;
  localTemporalRangeMin.value = selectedTemporalRange.value[0];
  localTemporalRangeMax.value = selectedTemporalRange.value[1];
  isTemporalRangeEditable.value = true;
}

function validateMinStep(value: number) {
  if (value < minStep.value)
    return `Please enter a min step >= ${minStep.value}`;
  if (value >= maxStep.value)
    return `Please enter a min step < ${maxStep.value}`;
  return true;
}

function validateMaxStep(value: number) {
  if (value <= minStep.value)
    return `Please enter a max step > ${minStep.value}`;
  if (value > maxStep.value)
    return `Please enter a max step <= ${maxStep.value}`;
  return true;
}

function updatePlotlyStep(data: any) {
  setStep(data.points[0].x);
}

function setStep(step: number) {
  emit("step-selected", step);
}

function setTemporalRange() {
  if (!hasTemporalRangeChanges.value || !isTemporalRangeValid.value) return;
  selectedTemporalRange.value = [
    localTemporalRangeMin.value,
    localTemporalRangeMax.value,
  ];
  isTemporalRangeEditable.value = false;
  if (props.stepSelected == null) return;
  if (props.stepSelected < temporalRangeMin.value)
    setStep(temporalRangeMin.value);
  else if (props.stepSelected > temporalRangeMax.value)
    setStep(temporalRangeMax.value);
}

function resetTemporalRange() {
  localTemporalRangeMin.value = datasetStore.minYear;
  localTemporalRangeMax.value = datasetStore.maxYear;
  setTemporalRange();
}

function gotoFirstStep() {
  if (variable.value === null) return;
  setStep(temporalRangeMin.value);
}

function gotoLastStep() {
  if (variable.value === null) return;
  setStep(temporalRangeMax.value);
}

function stepBy(delta: number) {
  if (variable.value === null || props.stepSelected == null) return;
  setStep(
    stepAlongAxis(axis.value, props.stepSelected, delta, [
      temporalRangeMin.value,
      temporalRangeMax.value,
    ]),
  );
}

function nextStep() {
  stepBy(1);
}

function previousStep() {
  stepBy(-1);
}

// The timestep typed between the step buttons, applied on Enter or when the
// field loses focus. A timestep outside the range on screen is rejected, with
// a message that says which ones are allowed.
const STEP_MESSAGE_LINGER = 4_000;
const stepDraft = ref("");
const isStepDraftInvalid = ref(false);
const isStepMessageVisible = ref(false);
const stepMessageId = useId();
let stepMessageTimer: ReturnType<typeof setTimeout> | null = null;

function currentStepText() {
  return props.stepSelected == null ? "" : String(props.stepSelected);
}

function clearStepMessageTimer() {
  if (stepMessageTimer != null) clearTimeout(stepMessageTimer);
  stepMessageTimer = null;
}

function hideStepMessage() {
  clearStepMessageTimer();
  isStepDraftInvalid.value = false;
  isStepMessageVisible.value = false;
}

function resetStepDraft() {
  hideStepMessage();
  stepDraft.value = currentStepText();
}

/** Selects the timestep the draft names; false if it names none in range. */
function commitStepDraft() {
  const step = stepFromText(axis.value, stepDraft.value, [
    temporalRangeMin.value,
    temporalRangeMax.value,
  ]);
  if (step === null) return false;
  hideStepMessage();
  stepDraft.value = String(step);
  if (step !== props.stepSelected) setStep(step);
  return true;
}

function applyStepDraft() {
  if (commitStepDraft()) return;
  clearStepMessageTimer();
  isStepDraftInvalid.value = true;
  isStepMessageVisible.value = true;
}

// Leaving the field puts the current timestep back, so it never shows one the
// plot isn't on; the message stays a moment to say why.
function applyStepDraftOnBlur() {
  if (stepDraft.value === currentStepText() || commitStepDraft()) return;
  stepDraft.value = currentStepText();
  isStepDraftInvalid.value = false;
  isStepMessageVisible.value = true;
  clearStepMessageTimer();
  stepMessageTimer = setTimeout(hideStepMessage, STEP_MESSAGE_LINGER);
}

watch(() => props.stepSelected, resetStepDraft, { immediate: true });

async function getTimeSeriesPlotImage() {
  const plotlyApi = getPlotlyApi();
  const svg = await plotlyApi?.toImage({
    format: "svg",
    height: 600,
    width: 1200,
  });
  const png = await plotlyApi?.toImage({
    format: "png",
    height: 600,
    width: 1200,
  });
  return { png, svg };
}

// Watch the status object, not its `status` string: every request sets a new
// object, so a first request (loading -> loading) restarts the messages too.
watch(
  timeSeriesRequestStatus,
  ({ status }) => {
    if (status === "loading") startProgressiveMessages();
    else clearProgressiveMessages();
  },
  { immediate: true },
);

onUnmounted(() => {
  clearProgressiveMessages();
  clearStepMessageTimer();
});

defineExpose({ getTimeSeriesPlotImage });

onMounted(() => {
  localTemporalRangeMin.value = selectedTemporalRange.value[0];
  localTemporalRangeMax.value = selectedTemporalRange.value[1];
});

watch(
  () => [
    minStep.value,
    maxStep.value,
    selectedTemporalRange.value[0],
    selectedTemporalRange.value[1],
  ],
  ([nextMin, nextMax, selectedMin, selectedMax]) => {
    // Keep the selected range within metadata bounds when datasets/routes change.
    if (
      selectedMin < nextMin ||
      selectedMax > nextMax ||
      selectedMin > selectedMax
    ) {
      selectedTemporalRange.value = [nextMin, nextMax];
    }

    // Keep form inputs in sync unless the user is actively editing.
    if (!isTemporalRangeEditable.value) {
      localTemporalRangeMin.value = selectedTemporalRange.value[0];
      localTemporalRangeMax.value = selectedTemporalRange.value[1];
    }
  },
  { immediate: true },
);

watch(timeSeriesData, (data) => {
  getPlotlyApi()?.update(data, layoutMetadata.value);
});

watch(layoutMetadata, (layout) => {
  getPlotlyApi()?.update(timeSeriesData.value, layout);
});
</script>
<style>
/* Fills its column, which grows instead when the plot's minimum height and
   the controls don't fit, so neither overlaps the other. */
.time-series-card {
  --plot-min-height: 410px;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
}

.time-series-range {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* A fixed width, so the range's row is sized from its contents and doesn't
   wrap while there's room. */
.time-series-range-field {
  flex: 0 0 120px;
  width: 120px;
}

.time-series-range-steps {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-muted));
  white-space: nowrap;
}

/* Sized from the plot's minimum, not its rendered height, so the card can
   shrink again when the window does. */
.time-series-plot-shell {
  position: relative;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-height: calc(var(--plot-min-height) + 16px);
  padding: 16px 16px 0;
}

.time-series-plot-shell--last {
  min-height: calc(var(--plot-min-height) + 32px);
  padding-bottom: 16px;
}

/* Its bottom padding matches the map card's, so the buttons end level with
   the map. */
.time-series-step-controls {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 4px;
  padding: 8px 16px 16px;
}

.time-series-current-step {
  padding: 0;
  border: none;
  border-bottom: 1px solid transparent;
  outline: none;
  background: transparent;
  color: inherit;
  font-size: 1.125rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.time-series-current-step:hover {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.4);
}

.time-series-current-step:focus {
  border-bottom-color: rgb(var(--v-theme-primary));
}

.time-series-current-step--invalid,
.time-series-current-step--invalid:hover,
.time-series-current-step--invalid:focus {
  border-bottom-color: rgb(var(--v-theme-error));
  color: rgb(var(--v-theme-error));
}

.time-series-step-message {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  font-size: 0.75rem;
  line-height: 16px;
  color: rgb(var(--v-theme-error));
  text-align: center;
}

.time-series-step-message-leave-active {
  transition: opacity 0.3s;
}

.time-series-step-message-leave-to {
  opacity: 0;
}

.timeseries-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

.loading-message {
  font-size: 13px;
  color: rgb(var(--v-theme-muted));
}

/* Tall enough for a one-line y-axis title of Y_TITLE_MAX_LINE_LENGTH. */
.time-series {
  flex: 1 1 0;
  width: 100%;
  min-height: var(--plot-min-height);
}
</style>
