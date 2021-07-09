<template>
  <v-form @submit.prevent>
    <v-row>
      <v-col>
        <!-- keyword search -->
        <v-text-field
          id="search"
          v-model="search"
          clearable
          outlined
          filled
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
    </v-row>
    <!-- start and end date range -->
    <v-row>
      <v-col>
        <v-text-field
          v-model="startYear"
          outlined
          dense
          label="Start Year"
          :rules="startYearRules"
          type="number"
          @change="filterDatasets"
        >
          <template #prepend>
            <h3 class="headline">Year range</h3>
          </template>
        </v-text-field>
      </v-col>
      <v-col>
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
    <!-- variable checkbox selector -->
    <h3 class="headline my-3">Variables</h3>
    <v-row>
      <v-list
        v-for="(variable, index) in variableClasses"
        :key="index"
        class="py-0 my-2"
      >
        <v-checkbox
          v-model="selectedVariableClasses"
          :value="variable.name"
          :label="variable.name"
          dense
          hide-details
          class="py-0 my-0"
          @change="filterDatasets"
        >
          <template #label>
            <v-chip
              small
              label
              class="ma-1 width-50"
              color="info"
              text-color="black"
            >
              <v-icon>view_column</v-icon>
              {{ variable.name }}
            </v-chip>
          </template>
        </v-checkbox>
      </v-list>
    </v-row>
  </v-form>
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";

@Component({})
class Search extends Vue {
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
      variableClasses.push({
        name: variableClass,
        checked: false,
      });
    }
    return variableClasses;
  }

  async fetch() {
    this.$api().datasets.retrieveData();
  }

  filterDatasets() {
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

export default Search;
</script>

<style scoped></style>
