import area from "@turf/area";
import { Module, Mutation, VuexModule } from "vuex-module-decorators";
import { filterTimeSeries, summarize, toISODate } from "@/store/stats";
import { DEFAULT_MAX_PROCESSING_TIME } from "@/store/modules/constants";

import _ from "lodash";

const LOADING_STATUS = {
  status: "loading",
  messages: [{ type: "warning", value: "Loading time series data." }],
};
const SUCCESS_STATUS = {
  status: "success",
  messages: [{ type: "info", value: "Success" }],
};
const TIMEOUT_STATUS = {
  status: "timeout",
  messages: [
    {
      type: "error",
      value: "Timeout exceeded, please try again with a smaller study area.",
    },
  ],
};
const NO_STUDY_AREA_STATUS = {
  status: "no-area",
  messages: [
    {
      type: "error",
      value: "Please enter a study area.",
    },
  ],
};

function clampTemporalRange(candidateTemporalRange, datasetTemporalRange) {
  const start = _.clamp(
    candidateTemporalRange[0],
    datasetTemporalRange[0],
    datasetTemporalRange[1]
  );
  const end = _.clamp(
    candidateTemporalRange[1],
    datasetTemporalRange[0],
    datasetTemporalRange[1]
  );
  return [start, end];
}

function toTemporalRange(metadata) {
  return [
    parseInt(metadata.timespan.period.gte),
    parseInt(metadata.timespan.period.lte),
  ];
}

@Module({ stateFactory: true, name: "dataset", namespaced: true })
class Dataset extends VuexModule {
  timeSeries = {
    x: [],
    y: [],
  };
  metadata = null;
  hasData = false;
  geoJson = null;
  // defined temporal range for the given dataset [min, max)
  temporalRange = [1, 2000];
  totalCellArea = 0;
  numberOfCells = 0;
  variable = null;

  // status types: loading | timeout | badrequest | servererror | success
  timeSeriesRequestStatus = LOADING_STATUS;

  get filteredTimeSeries() {
    if (
      this.timeSeries?.x.length ===
      this.temporalRangeMax - this.temporalRangeMin + 1
    ) {
      // FIXME: timeSeries has already been filtered by the Analyze page, this
      // makes navigation between analyze <-> visualize trickier as we have to special case
      return this.timeSeries;
    }
    return filterTimeSeries({
      timeSeries: this.timeSeries,
      temporalRange: this.temporalRange,
      minYear: this.minYear,
    });
  }

  get hasGeoJson() {
    return this.geoJson != null;
  }

  get hasMetadata() {
    return this.metadata != null;
  }

  get geoJsonKey() {
    if (this.hasMetadata) {
      return `geojson:${this.metadata.id}`;
    }
    return "skope:geometry";
  }

  get canHandleTimeSeriesRequest() {
    return this.hasMetadata && this.hasGeoJson && this.variable != null;
  }

  get selectedAreaInSquareMeters() {
    return this.hasGeoJson ? area(this.geoJson) : 0;
  }

  get selectedAreaInSquareKm() {
    return (this.selectedAreaInSquareMeters / 1e6).toFixed(2);
  }

  get totalCellAreaInSquareKm() {
    return (this.totalCellArea / 1e6).toFixed(2);
  }

  get summaryStatistics() {
    return { ...summarize(this.filteredTimeSeries), name: "Original" };
  }

  get minYear() {
    return this.timespan[0];
  }

  get maxYear() {
    return this.timespan[1];
  }

  get timespan() {
    if (this.hasMetadata) {
      return toTemporalRange(this.metadata);
    }
    return [1, new Date().getFullYear()];
  }

  /**
   * Returns the first value with data in the defined temporal range
   */
  get temporalRangeMin() {
    return this.temporalRange[0];
  }

  /**
   * Returns the last value with data in the defined temporal range
   */
  get temporalRangeMax() {
    return this.temporalRange[1];
  }

  get defaultApiRequestData() {
    const defaultRequestData = {
      dataset_id: this.metadata.id,
      variable_id: this.variable.id,
      selected_area: this.geoJson,
      time_range: {
        gte: toISODate(this.temporalRangeMin),
        lte: toISODate(this.temporalRangeMax),
      },
      zonal_statistic: "mean",
      transform: { type: "NoTransform" },
      requested_series_options: [
        {
          name: "Original",
          smoother: { type: "NoSmoother" },
        },
      ],
      max_processing_time: DEFAULT_MAX_PROCESSING_TIME,
    };
    console.log("retrieving default request data: ", defaultRequestData);
    return defaultRequestData;
  }

  get timeSeriesRequestData() {
    // returns timeSeries v2 request data
    if (this.canHandleTimeSeriesRequest) {
      return this.defaultApiRequestData;
    } else {
      return {
        dataset_id: null,
        variable_id: null,
        selected_area: null,
        time_range: null,
        zonal_statistic: null,
        transform: null,
        requested_series: null,
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
    if (metadata === this.metadata) {
      console.log("identical metadata, no-op");
      return;
    }
    this.metadata = metadata;
    if (metadata) {
      const defaultTemporalRange = toTemporalRange(metadata);
      console.log(
        "finding intersection of existing temporal range and dataset default",
        { currentTemporalRange: this.temporalRange, defaultTemporalRange }
      );
      this.temporalRange.splice(
        0,
        this.temporalRange.length,
        ...clampTemporalRange(this.temporalRange, defaultTemporalRange)
      );
    }
  }

  @Mutation
  setTemporalRange(temporalRange) {
    console.log(`dataset.setTemporalRange to ${temporalRange}`);
    temporalRange[0] = _.clamp(temporalRange[0], this.minYear, this.maxYear);
    temporalRange[1] = _.clamp(temporalRange[1], this.minYear, this.maxYear);
    if (temporalRange[0] > temporalRange[1]) {
      temporalRange[0] = temporalRange[1];
    }
    this.temporalRange.splice(0, this.temporalRange.length, ...temporalRange);
    console.log("CLAMPED dataset.setTemporalRange: ", this.temporalRange);
  }

  // takes variable id to set variable object
  @Mutation
  setVariable(id) {
    for (const variable of this.metadata.variables) {
      variable.visible = variable.id === id;
      if (variable.visible) {
        this.variable = variable;
      }
    }
  }

  @Mutation
  setGeoJson(geoJson) {
    console.log("datasetStore.setGeoJson");
    this.geoJson = geoJson;
  }

  @Mutation
  clearGeoJson() {
    this.geoJson = null;
  }

  @Mutation
  setTimeSeries({ timeSeries, numberOfCells, totalCellArea }) {
    this.hasData = true;
    this.timeSeries = timeSeries;
    this.numberOfCells = numberOfCells;
    this.totalCellArea = totalCellArea;
  }

  @Mutation
  clearTimeSeries() {
    this.hasData = false;
    this.timeSeries = {
      x: [],
      y: [],
    };
    this.numberOfCells = 0;
    this.totalCellArea = 0;
  }
}

export { Dataset };
