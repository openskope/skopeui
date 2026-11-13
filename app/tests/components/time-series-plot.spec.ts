import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TimeSeriesPlot from "@/components/dataset/TimeSeriesPlot.vue";
import { useDatasetStore } from "@/stores/dataset";
import metadataFixture from "@/tests/fixtures/metadata-1.0.0.json";

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "paleocar_v3" } }),
}));

vi.mock("@/components/dataset/PlotlyClient.vue", () => ({
  __esModule: true,
  default: {
    name: "PlotlyStub",
    props: ["data", "layout", "options"],
    template: "<div />",
  },
}));

const passThrough = { template: "<div><slot /></div>" };
const validateRange = vi.fn(async () => ({ valid: true }));

function mountPlot(props: Record<string, unknown> = {}) {
  return mount(TimeSeriesPlot, {
    props: { traces: [], ...props },
    global: {
      stubs: {
        "client-only": passThrough,
        "v-card": passThrough,
        "v-card-text": passThrough,
        "v-form": {
          template: "<form><slot /></form>",
          methods: { validate: () => validateRange() },
        },
        "v-text-field": {
          inheritAttrs: false,
          props: ["modelValue", "error", "errorMessages"],
          emits: ["update:modelValue"],
          template: `<div>
            <input v-bind="$attrs" :value="modelValue" :aria-invalid="!!error"
              @input="$emit('update:modelValue', $event.target.value)" />
            <template v-for="message in errorMessages || []" :key="message">
              <slot name="message" :message="message" />
            </template>
          </div>`,
        },
        "v-btn": true,
        "v-icon": true,
        "v-tooltip": true,
        "v-alert": true,
        "v-progress-circular": true,
      },
    },
  });
}

describe("TimeSeriesPlot loading messages", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the progress messages on the first request too", async () => {
    // The store starts out loading, so the first request doesn't change the
    // status string.
    const store = useDatasetStore();
    const wrapper = mountPlot();
    store.setTimeSeriesLoading();
    await flushPromises();

    vi.advanceTimersByTime(8_000);
    await flushPromises();
    expect(wrapper.find(".loading-message").text()).toBe("Still working...");

    vi.advanceTimersByTime(8_000);
    await flushPromises();
    expect(wrapper.find(".loading-message").text()).toBe(
      "Hang tight, almost there...",
    );
  });

  it("stops the messages once the data arrives", async () => {
    const store = useDatasetStore();
    const wrapper = mountPlot();
    store.setTimeSeriesLoaded();
    await flushPromises();

    vi.advanceTimersByTime(30_000);
    await flushPromises();
    expect(wrapper.find(".loading-message").exists()).toBe(false);
  });
});

describe("TimeSeriesPlot range submission", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    validateRange.mockReset().mockResolvedValue({ valid: true });
    const store = useDatasetStore();
    store.setMetadata(metadataFixture.datasets[0] as any);
    store.setTemporalRange([1500, 1800]);
  });

  it("validates an invalid draft on Enter without applying it", async () => {
    const store = useDatasetStore();
    validateRange.mockResolvedValueOnce({ valid: false });
    const wrapper = mountPlot();
    await wrapper.find(".time-series-range").trigger("click");
    const from = wrapper.find(".time-series-range input");
    await from.setValue("1");
    await from.trigger("keydown", { key: "Enter" });
    await flushPromises();
    expect(validateRange).toHaveBeenCalledOnce();
    expect(store.temporalRange).toEqual([1500, 1800]);
    expect(wrapper.emitted("selected-temporal-range")).toBeUndefined();
    wrapper.unmount();
  });

  it("applies a valid draft on Enter without requiring blur first", async () => {
    const store = useDatasetStore();
    const wrapper = mountPlot();
    await wrapper.find(".time-series-range").trigger("click");
    const from = wrapper.find(".time-series-range input");
    await from.setValue("1600");
    await from.trigger("keydown", { key: "Enter" });
    await flushPromises();
    expect(validateRange).toHaveBeenCalledOnce();
    expect(store.temporalRange).toEqual([1600, 1800]);
    expect(wrapper.emitted("selected-temporal-range")).toEqual([
      [[1600, 1800]],
    ]);
    wrapper.unmount();
  });
});

describe("TimeSeriesPlot step controls", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("shows the current timestep between the step buttons", async () => {
    const wrapper = mountPlot({ showStepControls: true, stepSelected: 1500 });
    await flushPromises();
    const field = wrapper.find('[data-test="current-step"]');
    expect((field.element as HTMLInputElement).value).toBe("1500");
  });

  it("sizes the current timestep to the longest one on the axis", async () => {
    const store = useDatasetStore();
    store.metadata = {
      time: { kind: "regular", origin: "0001", end: "2000", step: "P1Y" },
    } as any;
    const wrapper = mountPlot({ showStepControls: true, stepSelected: 7 });
    await flushPromises();
    expect(
      wrapper.find('[data-test="current-step"]').attributes("style"),
    ).toContain("width: 4.5ch");
  });
});

describe("TimeSeriesPlot typed timestep", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const store = useDatasetStore();
    store.metadata = {
      time: { kind: "regular", origin: "1001", end: "2000", step: "P1Y" },
    } as any;
    store.setTemporalRange([1500, 1600]);
  });

  async function typeStep(text: string) {
    const wrapper = mountPlot({ showStepControls: true, stepSelected: 1550 });
    await flushPromises();
    const field = wrapper.find('[data-test="current-step"]');
    await field.setValue(text);
    return { wrapper, field };
  }

  it("selects a typed timestep on Enter", async () => {
    const { wrapper, field } = await typeStep("1575");
    await field.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("step-selected")).toEqual([[1575]]);
  });

  it("rejects a timestep outside the range and says which are allowed", async () => {
    const { wrapper, field } = await typeStep("1700");
    await field.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("step-selected")).toBeUndefined();
    expect(field.attributes("aria-invalid")).toBe("true");
    expect((field.element as HTMLInputElement).value).toBe("1700");
    expect(wrapper.find('[data-test="step-message"]').text()).toBe(
      "Choose a timestep from 1500 to 1600",
    );
  });

  it("puts the current timestep back when left with a rejected one", async () => {
    vi.useFakeTimers();
    const { wrapper, field } = await typeStep("abc");
    await field.trigger("blur");
    expect((field.element as HTMLInputElement).value).toBe("1550");
    expect(wrapper.find('[data-test="step-message"]').exists()).toBe(true);
    vi.advanceTimersByTime(4_000);
    await flushPromises();
    expect(wrapper.find('[data-test="step-message"]').exists()).toBe(false);
    vi.useRealTimers();
  });

  it("puts the current timestep back on Escape", async () => {
    const { wrapper, field } = await typeStep("1575");
    await field.trigger("keydown", { key: "Escape" });
    expect((field.element as HTMLInputElement).value).toBe("1550");
    expect(wrapper.emitted("step-selected")).toBeUndefined();
  });
});

describe("TimeSeriesPlot y-axis title", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  async function layoutFor(title: string, unit: string) {
    const store = useDatasetStore();
    store.variable = { id: "v", title, unit } as any;
    const wrapper = mountPlot();
    await flushPromises();
    return wrapper.findComponent({ name: "PlotlyStub" }).props("layout");
  }

  it("keeps the plot's left edge put for short and long titles", async () => {
    const short = await layoutFor("Annual (Jan–Dec) Precipitation", "mm");
    const long = await layoutFor(
      "Water-year (Oct–Sept) Cotton Growing Degree Days",
      "°C GDD",
    );
    expect(short.margin.l).toBe(long.margin.l);
    expect(short.yaxis.automargin).toBeFalsy();
    expect(short.annotations[0].text).toBe(
      "Annual (Jan–Dec) Precipitation (mm)",
    );
    expect(long.annotations[0].text).toBe(
      "Water-year (Oct–Sept) Cotton<br>Growing Degree Days (°C GDD)",
    );
  });
});
