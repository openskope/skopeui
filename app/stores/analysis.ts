import { defineStore } from "pinia";
import { useDatasetStore } from "@/stores/dataset";
import { formatStats } from "@/store/stats";
import { yearOfTimestep } from "@/utils/timeAxis";

const EMPTY_RESPONSE = {
  area: 0,
  n_cells: 1,
  series: [],
  zonal_statistic: "mean",
  dataset_id: "",
  variable_id: "",
  summary_stats: [],
};

export const useAnalysisStore = defineStore("analysis", {
  state: () => ({
    response: { ...EMPTY_RESPONSE } as any,
    // Only analysis choices are stored here; dataset, geometry and range
    // always come from the active dataset selection.
    requestOptions: null as Record<string, unknown> | null,
  }),
  // Requests follow the selection; plots and summaries follow the response.
  getters: {
    requestData(state): Record<string, any> {
      if (!state.requestOptions) return {};
      return {
        ...useDatasetStore().defaultApiRequestData,
        ...state.requestOptions,
      };
    },
    timeseries: (state) => {
      return (state.response?.series || []).map((s: any) => ({
        x: s.timesteps.map(yearOfTimestep),
        y: s.values,
        name: s.options?.name,
      }));
    },
    summaryStatistics: (state) =>
      formatStats(state.response?.summary_stats || []),
  },
  actions: {
    setDefaultRequestData(requestData: Record<string, unknown>) {
      this.setRequestData(requestData);
      this.response = { ...EMPTY_RESPONSE };
    },
    setResponse(response: Record<string, unknown>) {
      this.response = response;
    },
    /** Drops the last response, e.g. when the study area changes. */
    clear() {
      this.response = { ...EMPTY_RESPONSE };
    },
    setRequestData(requestData: Record<string, unknown>) {
      const {
        zonal_statistic,
        transform,
        requested_series_options,
        max_processing_time,
      } = requestData;
      this.requestOptions = Object.fromEntries(
        Object.entries({
          zonal_statistic,
          transform,
          requested_series_options,
          max_processing_time,
        }).filter(([, value]) => value !== undefined),
      );
    },
  },
});
