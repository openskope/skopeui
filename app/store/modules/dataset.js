import _ from "lodash";
import { ALL_DATA } from "@/store/data";
import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import area from "@turf/area";

@Module({ stateFactory: true, name: "dataset", namespaced: true })
class Dataset extends VuexModule {
  timeseries = {
    x: [],
    y: [],
  };
  metadata = null;
  isLoadingData = false;
  hasData = false;
  geoJson = null;
  selectedAreaInSquareMeters = 0;
  variable = null;

  @Action
  async loadDefaultVariable(metadataId) {
    if (_.isNull(this.metadata)) {
      await this.context.dispatch("loadMetadata", metadataId);
    }
    if (_.isNull(this.variable)) {
      this.context.commit("setVariable", this.metadata.variables[0].id);
    }
  }

  @Action
  loadMetadata(id) {
    if (_.isNull(this.metadata) || this.metadata.id !== id) {
      const metadata = ALL_DATA.find((m) => m.id === id);
      if (metadata) {
        this.context.commit("setMetadata", metadata);
        console.log({ variables: metadata.variables });
        if (metadata.variables.length > 0) {
          this.context.commit("setVariable", metadata.variables[0].id);
        }
      }
    }
  }

  get hasGeoJson() {
    return this.geoJson !== null;
  }

  get geoJsonKey() {
    if (this.metadata === null) {
      return "skope:geometry";
    }
    return `geojson:${this.metadata.id}`;
  }

  get canHandleTimeSeriesRequest() {
    return (
      !_.isNull(this.metadata) && this.hasGeoJson && !_.isNull(this.variable)
    );
  }

  get timeZero() {
    if (this.metadata) {
      return this.metadata.timespan.period.timeZero || 0;
    }
    return 0;
  }

  get timespan() {
    if (this.metadata) {
      return [
        this.metadata.timespan.period.gte,
        this.metadata.timespan.period.lte,
      ];
    }
    console.log("No selected dataset, returning default year range");
    return [1, new Date().getFullYear()];
  }

  @Mutation
  setMetadata(metadata) {
    this.metadata = metadata;
  }

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
  setIsLoading(value) {
    this.isLoadingData = value;
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
  setTimeSeries(timeseries) {
    this.hasData = true;
    this.timeseries = timeseries;
  }

  @Mutation
  clearTimeSeries() {
    this.hasData = false;
    this.timeseries = {
      x: [],
      y: [],
    };
  }
}

export { Dataset };
