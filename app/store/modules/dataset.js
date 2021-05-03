import _ from "lodash";
import area from "@turf/area";
import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import { ALL_DATA } from "@/store/data";
import { filterTimeSeries, summarize } from "@/store/stats";

const LOADING = "loading";
const SUCCESS = "success";

const LOADING_STATUS = {
  status: LOADING,
  type: "info",
  messages: [{ type: "info", value: "Loading time series data." }],
};
const SUCCESS_STATUS = {
  status: SUCCESS,
  type: "info",
  messages: [{ type: "info", value: "Success" }],
};
const TIMEOUT_STATUS = {
  status: "timeout",
  messages: [
    {
      type: "warning",
      value: "Timeout exceeded, please try again with a smaller study area.",
    },
  ],
};
const NO_STUDY_AREA_STATUS = {
  status: "no-area",
  messages: [
    {
      type: "warning",
      value: "Please enter a study area.",
    },
  ],
};

function toTemporalRange(metadata) {
  return [
    parseInt(metadata.timespan.period.gte),
    parseInt(metadata.timespan.period.lte),
  ];
}

@Module({ stateFactory: true, name: "dataset", namespaced: true })
class Dataset extends VuexModule {
  timeseries = {
    x: [],
    y: [],
  };
  metadata = null;
  hasData = false;
  geoJson = null;
  selectedAreaInSquareMeters = 0;
  temporalRange = [1, 2000];
  totalCellArea = 0;
  numberOfCells = 0;
  variable = null;

  // status types: loading | timeout | badrequest | servererror | success
  timeSeriesRequestStatus = LOADING_STATUS;

  @Action
  async loadVariable({ metadataId, variableId }) {
    if (this.metadata == null) {
      this.context.dispatch("loadMetadata", metadataId);
    }
    if (variableId == null) {
      // set a default variable if no variable id was passed in
      variableId = this.metadata.variables[0].id;
    }
    this.context.commit("setVariable", variableId);
  }

  @Action
  loadMetadata(id) {
    if (this.metadata == null || this.metadata.id !== id) {
      const metadata = ALL_DATA.find((m) => m.id === id);
      if (metadata) {
        this.context.commit("setMetadata", metadata);
      }
    }
  }

  get filteredTimeSeries() {
    return filterTimeSeries({
      timeseries: this.timeseries,
      temporalRange: this.temporalRange,
      minYear: this.minYear,
    });
  }

  get hasGeoJson() {
    return this.geoJson != null;
  }

  get geoJsonKey() {
    if (this.metadata === null) {
      return "skope:geometry";
    }
    return `geojson:${this.metadata.id}`;
  }

  get canHandleTimeSeriesRequest() {
    return this.metadata != null && this.hasGeoJson && this.variable != null;
  }

  get selectedAreaInSquareKm() {
    return (this.selectedAreaInSquareMeters / 1e6).toFixed(2);
  }

  get totalCellAreaInSquareKm() {
    return (this.totalCellArea / 1e6).toFixed(2);
  }

  get summaryStatistics() {
    return { ...summarize(this.filteredTimeSeries), series: "Original" };
  }

  get timeZero() {
    if (this.metadata) {
      return this.metadata.timespan.period.timeZero || 0;
    }
    return 0;
  }

  get minYear() {
    if (this.metadata) {
      return parseInt(this.metadata.timespan.period.gte);
    }
    return 0;
  }

  get maxYear() {
    if (this.metadata) {
      return parseInt(this.metadata.timespan.period.lte);
    }
    return 2000;
  }

  get timespan() {
    if (this.metadata) {
      return toTemporalRange(this.metadata);
    }
    console.log("No selected dataset, returning default year range");
    return [1, new Date().getFullYear()];
  }

  get isTimeSeriesLoading() {
    return this.timeSeriesRequestStatus.status === LOADING;
  }

  get isTimeSeriesLoaded() {
    return this.timeSeriesRequestStatus.status === SUCCESS;
  }

  get timeseriesRequestData() {
    // returns timeseries v2 request data
    if (this.canHandleTimeSeriesRequest) {
      return {
        dataset_id: this.metadata.id,
        variable_id: this.variable.id,
        selected_area: this.geoJson.geometry,
        time_range: { gte: this.minYear, lte: this.maxYear },
        zonal_statistic: "mean",
        transforms: [],
      };
    } else {
      return {
        dataset_id: null,
        variable_id: null,
        selected_area: null,
        time_range: null,
        zonal_statistic: null,
        transforms: null,
      };
    }
  }

  @Mutation
  setTimeSeriesLoading() {
    this.timeSeriesRequestStatus = LOADING_STATUS;
  }

  @Mutation
  setTimeSeriesLoaded() {
    this.timeSeriesRequestStatus = SUCCESS_STATUS;
  }

  @Mutation
  setTimeSeriesTimeout() {
    this.timeSeriesRequestStatus = TIMEOUT_STATUS;
  }

  @Mutation
  setTimeSeriesBadRequest(errorDetails) {
    this.timeSeriesRequestStatus = {
      status: "badrequest",
      type: "error",
      messages: errorDetails.map((detail) => ({
        type: "error",
        value: detail.msg,
      })),
    };
  }

  @Mutation
  setTimeSeriesServerError(errorDetails) {
    this.timeSeriesRequestStatus = {
      status: "servererror",
      type: "error",
      messages: errorDetails.map((detail) => ({
        type: "error",
        value: detail.msg,
      })),
    };
  }

  @Mutation
  setTimeSeriesNoArea() {
    this.timeSeriesRequestStatus = NO_STUDY_AREA_STATUS;
  }

  @Mutation
  setMetadata(metadata) {
    this.metadata = metadata;
    if (metadata) {
      this.temporalRange.splice(
        0,
        this.temporalRange.length,
        ...toTemporalRange(metadata)
      );
    }
  }

  @Mutation
  setTemporalRange(temporalRange) {
    this.temporalRange.splice(0, this.temporalRange.length, ...temporalRange);
  }

  @Mutation
  setVariable(id) {
    console.log("Setting variable to ", id);
    for (const variable of this.metadata.variables) {
      variable.visible = variable.id === id;
      if (variable.visible) {
        this.variable = variable;
      }
    }
  }

  @Mutation
  setGeoJson(geoJson) {
    this.geoJson = geoJson;
    this.selectedAreaInSquareMeters = geoJson ? area(geoJson) : 0;
  }

  @Mutation
  clearGeoJson() {
    this.geoJson = null;
    this.selectedAreaInSquareMeters = 0;
  }

  @Mutation
  setTimeSeries({ timeseries, numberOfCells, totalCellArea }) {
    this.hasData = true;
    this.timeseries = timeseries;
    this.numberOfCells = numberOfCells;
    this.totalCellArea = totalCellArea;
  }

  @Mutation
  clearTimeSeries() {
    this.hasData = false;
    this.timeseries = {
      x: [],
      y: [],
    };
    this.numberOfCells = 0;
    this.totalCellArea = 0;
  }
}

export { Dataset };
