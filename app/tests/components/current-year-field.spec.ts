import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CurrentYearField from "@/components/dataset/CurrentYearField.vue";
import { useDatasetStore } from "@/stores/dataset";
import metadataFixture from "@/tests/fixtures/metadata-1.0.0.json";

enableAutoUnmount(afterEach);
afterEach(() => vi.useRealTimers());

function mountField(props: { stepSelected: number }) {
  return mount(CurrentYearField, {
    props: { isStepLoading: false, ...props },
    global: {
      stubs: {
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
        "v-icon": true,
      },
    },
  });
}

describe("CurrentYearField", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("shows an editable current timestep", async () => {
    const wrapper = mountField({ stepSelected: 1500 });
    await flushPromises();
    const field = wrapper.find('[data-test="current-step"]');
    expect((field.element as HTMLInputElement).value).toBe("1500");
    expect(field.attributes("readonly")).toBeUndefined();
  });

  it("uses the dataset's temporal label", async () => {
    const store = useDatasetStore();
    store.setMetadata(metadataFixture.datasets[0] as any);
    const wrapper = mountField({ stepSelected: 1500 });
    expect(
      wrapper.find('[data-test="current-step"]').attributes("aria-label"),
    ).toBe("Current year");
    store.metadata!.time.precision = "month";
    await flushPromises();
    expect(
      wrapper.find('[data-test="current-step"]').attributes("aria-label"),
    ).toBe("Current time");
    wrapper.unmount();
  });

  it("pauses playback when editing the current year", async () => {
    const wrapper = mountField({ stepSelected: 1500 });
    await flushPromises();
    await wrapper.find('[data-test="current-step"]').trigger("focus");
    expect(wrapper.emitted("pause-playback")).toHaveLength(1);
  });
});

describe("CurrentYearField typed timestep", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const store = useDatasetStore();
    store.setMetadata({
      ...metadataFixture.datasets[0],
      time: {
        ...metadataFixture.datasets[0]!.time,
        origin: "1001",
        end: "2000",
      },
    } as any);
    store.setTemporalRange([1500, 1600]);
  });

  async function typeStep(text: string) {
    const wrapper = mountField({ stepSelected: 1550 });
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

  it("selects a valid year when the field loses focus", async () => {
    const { wrapper, field } = await typeStep("1575");
    await field.trigger("blur");
    expect(wrapper.emitted("step-selected")).toEqual([[1575]]);
  });

  it("updates the field when playback displays another year", async () => {
    const { wrapper, field } = await typeStep("1575");
    await wrapper.setProps({ stepSelected: 1580 });
    expect((field.element as HTMLInputElement).value).toBe("1580");
    expect(wrapper.emitted("step-selected")).toBeUndefined();
  });

  it("rejects a timestep outside the range and says which are allowed", async () => {
    const { wrapper, field } = await typeStep("1700");
    await field.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("step-selected")).toBeUndefined();
    expect(field.attributes("aria-invalid")).toBe("true");
    expect((field.element as HTMLInputElement).value).toBe("1700");
    expect(wrapper.find('[data-test="step-message"]').text()).toBe(
      "Use 1500–1600.",
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
  });

  it("puts the current timestep back on Escape", async () => {
    const { wrapper, field } = await typeStep("1575");
    await field.trigger("keydown", { key: "Escape" });
    expect((field.element as HTMLInputElement).value).toBe("1550");
    expect(wrapper.emitted("step-selected")).toBeUndefined();
  });
});
