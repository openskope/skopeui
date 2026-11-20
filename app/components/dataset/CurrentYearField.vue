<template>
  <v-text-field
    v-model="stepDraft"
    class="current-year-field"
    :style="{ '--current-year-accent': PLOT_COLORS.plotAccent }"
    :label="temporalLabels.current"
    density="compact"
    variant="outlined"
    base-color="primary"
    color="primary"
    :hint="isStepLoading ? 'Loading map…' : 'Shown on map'"
    persistent-hint
    :hide-details="false"
    :error="isStepDraftInvalid"
    :error-messages="
      isStepMessageVisible
        ? [`Use ${temporalRangeMin}–${temporalRangeMax}.`]
        : []
    "
    type="text"
    inputmode="numeric"
    title="Displayed year: type a year and press Enter"
    :aria-label="temporalLabels.current"
    :aria-invalid="isStepDraftInvalid"
    data-test="current-step"
    @focus="focusStepDraft"
    @input="hideStepMessage"
    @keydown.enter.prevent="applyStepDraft"
    @keydown.esc.prevent="resetStepDraft"
    @blur="applyStepDraftOnBlur"
  >
    <template #prepend-inner>
      <v-icon :color="PLOT_COLORS.plotAccent" size="12" aria-hidden="true">
        mdi-circle
      </v-icon>
    </template>
    <template #message="{ message }">
      <span :data-test="isStepMessageVisible ? 'step-message' : undefined">
        {{ message }}
      </span>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from "vue";
import { useDatasetStore } from "@/stores/dataset";
import {
  axisYears,
  resolveTemporalLabels,
  stepFromText,
} from "@/utils/timeAxis";
import { PLOT_COLORS } from "@/utils/colors";

const props = defineProps<{
  stepSelected: number;
  isStepLoading: boolean;
}>();
const emit = defineEmits<{
  (e: "step-selected", step: number): void;
  (e: "pause-playback"): void;
}>();
const datasetStore = useDatasetStore();
const temporalRangeMin = computed(() => datasetStore.temporalRangeMin);
const temporalRangeMax = computed(() => datasetStore.temporalRangeMax);
const axis = computed(() =>
  datasetStore.metadata ? axisYears(datasetStore.metadata.time) : [],
);
const temporalLabels = computed(() =>
  resolveTemporalLabels(datasetStore.metadata?.time),
);

function selectStep(step: number) {
  emit("pause-playback");
  emit("step-selected", step);
}

// The timestep typed in the header, applied on Enter or when the field loses
// focus. A timestep outside the range on screen is rejected, with
// a message that says which ones are allowed.
const STEP_MESSAGE_LINGER = 4_000;
const stepDraft = ref("");
const isStepDraftInvalid = ref(false);
const isStepMessageVisible = ref(false);
let stepMessageTimer: ReturnType<typeof setTimeout> | null = null;

function focusStepDraft(event: FocusEvent) {
  emit("pause-playback");
  (event.target as HTMLInputElement).select();
}

function currentStepText() {
  return String(props.stepSelected);
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
  if (step !== props.stepSelected) selectStep(step);
  return true;
}

function applyStepDraft() {
  if (commitStepDraft()) return;
  clearStepMessageTimer();
  isStepDraftInvalid.value = true;
  isStepMessageVisible.value = true;
}

// Leaving the field puts the current timestep back, so it never shows one the
// map isn't on; the message stays a moment to say why.
function applyStepDraftOnBlur() {
  if (stepDraft.value === currentStepText() || commitStepDraft()) return;
  stepDraft.value = currentStepText();
  isStepDraftInvalid.value = false;
  isStepMessageVisible.value = true;
  clearStepMessageTimer();
  stepMessageTimer = setTimeout(hideStepMessage, STEP_MESSAGE_LINGER);
}

watch(() => props.stepSelected, resetStepDraft, { immediate: true });

onUnmounted(clearStepMessageTimer);
</script>

<style scoped>
.current-year-field :deep(.v-input__details) {
  min-height: 36px;
}

.current-year-field {
  flex: 0 0 120px;
  width: 120px;
  margin-left: auto;
  align-self: flex-start;
}

/* A distinct current-frame readout, tied to the plot cursor by its marker.
   Label and helper text explain the meaning independently of color. */
.current-year-field :deep(.v-field) {
  background-color: rgb(var(--v-theme-panel));
  background-color: color-mix(
    in srgb,
    var(--current-year-accent) 8%,
    rgb(var(--v-theme-surface))
  );
}

.current-year-field :deep(input) {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.current-year-field :deep(.v-field-label),
.current-year-field :deep(.v-field__prepend-inner > .v-icon) {
  opacity: 1;
}

.current-year-field :deep(.v-field__outline) {
  --v-field-border-opacity: 0.65;
}

.current-year-field:not(.v-input--error) :deep(.v-messages) {
  color: rgb(var(--v-theme-muted));
  opacity: 1;
}
</style>
