import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LoadAnalysis from "@/components/dataset/LoadAnalysis.vue";
import { useAnalysisStore } from "@/stores/analysis";
import { useDatasetStore } from "@/stores/dataset";
import metadata from "@/tests/fixtures/metadata-1.0.0.json";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("vue-router", () => ({ useRouter: () => router }));
vi.stubGlobal("defineNuxtRouteMiddleware", (middleware: unknown) => middleware);
const { default: requiresStudyArea } =
  await import("@/middleware/requires-study-area");

const request = {
  dataset_id: "paleocar_v3",
  variable_id: "ppt_annual",
  selected_area: { type: "Point", coordinates: [-108, 37] },
  time_range: { gte: "0103", lte: "2000" },
};

function mountLoader() {
  return mount(LoadAnalysis, {
    global: {
      plugins: [createPinia()],
      stubs: {
        "v-tooltip": {
          template: '<div><slot name="activator" :props="{}" /></div>',
        },
        "v-btn": { template: "<button><slot /></button>" },
      },
    },
  });
}

async function importRequest(wrapper: ReturnType<typeof mountLoader>) {
  const input = wrapper.find("input");
  Object.defineProperty(input.element, "files", {
    value: [{ text: async () => JSON.stringify(request) }],
  });
  await input.trigger("change");
  await flushPromises();
}

describe("LoadAnalysis", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    router.push.mockReset();
    vi.stubGlobal(
      "navigateTo",
      vi.fn((location: unknown) => location),
    );
    vi.stubGlobal("alert", vi.fn());
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response(JSON.stringify(metadata), { status: 200 }),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("restores the request before the analysis route guard runs", async () => {
    const wrapper = mountLoader();
    let destination: any;
    router.push.mockImplementation(async (location: any) => {
      expect(useDatasetStore().geoJson).toEqual(request.selected_area);
      expect(useAnalysisStore().requestData).toEqual(request);
      destination = (requiresStudyArea as any)(location) ?? location;
    });

    await importRequest(wrapper);

    expect(destination).toEqual({
      name: "dataset-id-analyze-variable",
      params: { id: request.dataset_id, variable: request.variable_id },
    });
    expect(navigateTo).not.toHaveBeenCalled();
    expect(alert).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("reports initialization failure without navigating", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("API unavailable"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const wrapper = mountLoader();

    await importRequest(wrapper);

    expect(router.push).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith("Unable to import the request file.");
    wrapper.unmount();
  });
});
