<template>
  <v-container fluid class="fill-height">
    <v-row>
      <v-col md="12" lg="8" offset-lg="2">
        <v-form @submit.prevent>
          <v-row align="center">
            <!-- filter by variable -->
            <v-col cols="3">
              <v-combobox
                v-model="selectedVariableClasses"
                :items="variableClasses"
                label="Filter by variable"
                multiple
                chips
                dense
                @change="filterDatasets"
              ></v-combobox>
            </v-col>
            <!-- search by keyword -->
            <v-col cols="5">
              <!-- keyword search -->
              <v-text-field
                id="search"
                v-model="search"
                clearable
                outlined
                dense
                data-toggle="hideseek"
                label="Search for a keyword"
                @change="filterDatasets"
              >
                <template #append>
                  <v-btn icon class="align-baseline" @click="filterDatasets">
                    <v-icon>search</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field
                v-model="startYear"
                outlined
                dense
                label="Start Year"
                :rules="startYearRules"
                type="number"
                @change="filterDatasets"
              >
              </v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field
                v-model="endYear"
                outlined
                dense
                :rules="endYearRules"
                label="End Year"
                type="number"
                @change="filterDatasets"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
      <v-col cols="12">
        <h1 class="font-weight-light">Datasets</h1>
        <template v-for="dataset in datasets" router exact>
          <v-card
            :key="dataset.absoluteUrl"
            class="pa-4 my-3"
            elevation="2"
            outlined
          >
            <Dataset
              :key="dataset.absolute_url"
              v-bind="dataset"
              class="my-2"
            />
          </v-card>
        </template>
        <v-alert v-if="datasets.length === 0" type="warning">
          No datasets found, please refine your filter criteria.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Component } from "nuxt-property-decorator";
import Vue from "vue";
import Dataset from "@/components/Dataset.vue";

@Component({
  layout: "BaseDefault",
  components: {
    Dataset,
  },
})
class LandingPage extends Vue {
  currentYear = new Date().getFullYear();
  search = "";
  startYear = 1;
  endYear = this.currentYear;
  selectedVariableClasses = [];
  minYear = 1;
  maxYear = this.currentYear;

  get datasets() {
    return this.$api().datasets.filteredDatasets;
  }

  get startYearRules() {
    return [
      (v) =>
        v >= this.minYear ||
        `Please enter a valid start year after ${this.minYear}`,
      (v) =>
        v <= this.endYear ||
        `Please enter a valid start year before ${this.endYear}`,
    ];
  }

  get endYearRules() {
    return [
      (v) =>
        v >= this.startYear ||
        `Please enter a valid end year after ${this.startYear}`,
      (v) =>
        v <= this.maxYear ||
        `Please enter a valid end year before ${this.maxYear}`,
    ];
  }

  get variableClasses() {
    const datasets = this.$api().datasets.all;
    const variableClassSet = new Set();
    for (const dataset of datasets) {
      for (const variable of dataset.variables) {
        variableClassSet.add(variable.class);
      }
    }
    const variableClasses = [];
    for (const variableClass of variableClassSet) {
      variableClasses.push(variableClass);
    }
    return variableClasses;
  }

  async fetch() {
    this.$api().datasets.retrieveData();
  }

  created() {
    const api = this.$api();
    api.dataset.clearTimeSeries();
    api.dataset.setMetadata(null);
  }

  filterDatasets() {
    console.log("selected variables: ", this.selectedVariableClasses);
    // update the store with the selected variable classes, year range, and optional
    // keyword query which will be applied as a filter across the available datasets
    this.$api().datasets.filter({
      selectedVariableClasses: this.selectedVariableClasses,
      yearStart: this.startYear,
      yearEnd: this.endYear,
      query: this.search,
    });
  }
}
export default LandingPage;
</script>
