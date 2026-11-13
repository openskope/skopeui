import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAnalysisStore,
  createDatasetStore,
  timeSeriesResponseFixture,
} from "@/tests/fixtures/page-fixtures";
import {
  installNuxtTestGlobals,
  mountWithSuspense,
  resetNuxtTestGlobals,
} from "@/tests/fixtures/nuxt-test-helpers";

import AnalyzePage from "@/pages/dataset/[id]/analyze/[variable].vue";

const routeParams = { id: "paleocar", variable: "tasmax" };
let analysisStore: any;
let datasetStore: any;
let legacyActions: any;
let extractionStore: any;
let messagesStore: any;

vi.mock("vue-router", () => ({
  useRoute: () => ({
    params: routeParams,
  }),
}));

vi.mock("vuetify", () => ({
  useDisplay: () => ({ mdAndDown: false }),
}));

vi.mock("@/components/dataset/TimeSeriesPlot.vue", () => ({
  default: {
    name: "TimeSeriesPlotStub",
    template: '<div data-test="timeseries">timeseries</div>',
    methods: {
      getTimeSeriesPlotImage: async () => ({
        png: "data:image/png",
        svg: "data:image/svg+xml",
      }),
    },
  },
}));

vi.mock("@/components/dataset/SubHeader.vue", () => ({
  default: {
    name: "SubHeaderStub",
    template: '<div data-test="subheader"><slot /></div>',
  },
}));

vi.mock("@/components/LoadingSpinner.vue", () => ({
  default: {
    name: "LoadingSpinnerStub",
    template: '<div data-test="loading">loading</div>',
  },
}));

vi.mock("@/stores/analysis", () => ({
  useAnalysisStore: () => analysisStore,
}));

vi.mock("@/stores/dataset", () => ({
  useDatasetStore: () => datasetStore,
}));

vi.mock("@/stores/messages", () => ({
  useMessagesStore: () => messagesStore,
}));

vi.mock("@/stores/extraction", () => ({
  useExtractionStore: () => extractionStore,
}));

vi.mock("@/composables/useLegacyStoreActions", () => ({
  useLegacyStoreActions: () => legacyActions,
}));

const layoutStubs = {
  "v-container": { template: "<div><slot /></div>" },
  "v-row": { template: "<div><slot /></div>" },
  "v-col": { template: "<div><slot /></div>" },
  "v-form": {
    props: ["modelValue"],
    emits: ["update:modelValue"],
    template: '<form data-test="analysis-form"><slot /></form>',
  },
  "v-data-table": { template: '<div data-test="stats-table"></div>' },
  "v-select": { template: '<div data-test="select"></div>' },
  "v-text-field": { template: '<input data-test="input" />' },
  "v-icon": { template: "<i><slot /></i>" },
  "v-btn": {
    props: ["to"],
    // Declared, so a click runs the page's handler once, not also as a
    // native listener.
    emits: ["click"],
    template:
      '<button data-test="action-btn" :data-to="to && JSON.stringify(to)" @click="$emit(\'click\')"><slot /></button>',
  },
};

describe("route /dataset/:id/analyze/:variable", () => {
  beforeEach(() => {
    installNuxtTestGlobals({
      nuxtApp: {
        $download: {
          saveAs: vi.fn(),
        },
      },
    });

    datasetStore = createDatasetStore({
      hasGeoJson: true,
      geoJson: { type: "FeatureCollection", features: [] },
    });
    analysisStore = createAnalysisStore();
    messagesStore = {
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      dismiss: vi.fn(),
      clearMessages: vi.fn(),
    };
    legacyActions = {
      initializeDataset: vi.fn(async () => true),
      initializeDatasetGeoJson: vi.fn(),
    };
    extractionStore = {
      beginRequest: () => () => true,
      resolveTimeSeries: vi.fn(async () => timeSeriesResponseFixture),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetNuxtTestGlobals();
  });

  it("[smoke] renders analysis form and timeseries plot", async () => {
    const wrapper = await mountWithSuspense(AnalyzePage, {
      global: { stubs: layoutStubs },
    });

    await flushPromises();
    const page = wrapper.findComponent(AnalyzePage);

    expect(page.find('[data-test="analysis-form"]').exists()).toBe(true);
    expect(page.findComponent({ name: "TimeSeriesPlotStub" }).exists()).toBe(
      true,
    );
  });

  it("[behavior] submits updated request data when Update is clicked", async () => {
    const wrapper = await mountWithSuspense(AnalyzePage, {
      global: { stubs: layoutStubs },
    });
    const page = wrapper.findComponent(AnalyzePage);

    await flushPromises();
    // The first analysis runs on mount; Update must run another.
    expect(extractionStore.resolveTimeSeries).toHaveBeenCalledTimes(1);

    const updateButton = page
      .findAll('[data-test="action-btn"]')
      .find((button) => button.text().includes("Update"));

    expect(updateButton).toBeDefined();
    await updateButton!.trigger("click");
    await flushPromises();

    expect(analysisStore.setRequestData).toHaveBeenCalledTimes(1);
    const [request] = analysisStore.setRequestData.mock.calls[0];
    expect(request).toMatchObject({
      zonal_statistic: "mean",
      time_range: { gte: "0001-01-01", lte: "0003-01-01" },
    });
    expect(extractionStore.resolveTimeSeries).toHaveBeenCalledTimes(2);
    expect(extractionStore.resolveTimeSeries).toHaveBeenLastCalledWith(request);
  });

  it("[behavior] shows the API's reason for a 422 as a warning", async () => {
    const reason =
      "The z-score's reference period [0450, 0500] has 0 time steps with values; it needs at least 2. Choose other years.";
    extractionStore.resolveTimeSeries.mockRejectedValueOnce(
      Object.assign(new Error("Request failed with status 422"), {
        response: { status: 422, data: { detail: reason } },
      }),
    );

    await mountWithSuspense(AnalyzePage, { global: { stubs: layoutStubs } });
    await flushPromises();

    expect(messagesStore.warning).toHaveBeenCalledWith(reason);
    expect(messagesStore.error).not.toHaveBeenCalled();
  });

  it("[behavior] starts the analysis once metadata arrives after mounting", async () => {
    // A fresh page load: the page mounts before the dataset's metadata loads.
    const metadata = datasetStore.metadata;
    datasetStore.metadata = null;

    await mountWithSuspense(AnalyzePage, { global: { stubs: layoutStubs } });
    await flushPromises();
    expect(analysisStore.setDefaultRequestData).not.toHaveBeenCalled();
    expect(extractionStore.resolveTimeSeries).not.toHaveBeenCalled();

    datasetStore.metadata = metadata;
    await flushPromises();

    expect(legacyActions.initializeDatasetGeoJson).toHaveBeenCalled();
    expect(analysisStore.setDefaultRequestData).toHaveBeenCalledTimes(1);
    expect(extractionStore.resolveTimeSeries).toHaveBeenCalledTimes(1);
    expect(datasetStore.setAreaSummary).toHaveBeenCalledWith(
      timeSeriesResponseFixture.n_cells,
      timeSeriesResponseFixture.area,
    );
  });
});
