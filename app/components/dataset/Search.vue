<template>
  <v-form @submit.prevent>
    <v-row align="center">
      <!-- filter by variable -->
      <v-col cols="3">
        <v-combobox
          v-model="selectedVariableClasses"
          no-filter
          :items="variableClasses"
          label="Filter by variable"
          multiple
          small-chips
          outlined
          @change="filterDatasets"
          @blur="filterDatasets"
        >
          <template
            #selection="{ attrs, item: variableClass, selected, parent }"
          >
            <v-chip
              v-bind="attrs"
              color="info"
              style="color: black"
              :input-value="selected"
              label
              small
            >
              <span class="pr-2">
                {{ variableClass }}
              </span>
              <v-icon small @click="parent.selectItem(variableClass)">
                $delete
              </v-icon>
            </v-chip>
          </template>
          <template #item="{ item: variableClass }">
            <v-chip color="info" dark label small style="color: black">
              {{ variableClass }}
            </v-chip>
          </template>
        </v-combobox>
      </v-col>
      <!-- search by keyword -->
      <v-col cols="5">
        <!-- keyword search -->
        <v-text-field
          id="keywordQuery"
          v-model="keywordSearchQuery"
          clearable
          outlined
          data-toggle="hideseek"
          label="Keyword search"
          append-icon="search"
          @change="filterDatasets"
          @click:clear="clearSearchQuery"
          @click:append="filterDatasets"
        >
        </v-text-field>
      </v-col>
      <v-col cols="2">
        <v-text-field
          v-model="startYear"
          outlined
          label="Start Year"
          :rules="startYearRules"
          type="number"
          @change="filterDatasets"
          @blur="filterDatasets"
        >
        </v-text-field>
      </v-col>
      <v-col cols="2">
        <v-text-field
          v-model="endYear"
          outlined
          :rules="endYearRules"
          label="End Year"
          type="number"
          @change="filterDatasets"
        >
        </v-text-field>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import { filterDatasetMetadata } from "@/store/actions";

@Component({})
class Search extends Vue {
  currentYear = new Date().getFullYear();
  keywordSearchQuery = "";
  startYear = 1;
  endYear = this.currentYear;
  selectedVariableClasses = [];
  minYear = 1;
  maxYear = this.currentYear;

  get datasets() {
    return this.$api().metadata.filteredDatasets;
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
    const datasets = this.$api().metadata.allDatasetMetadata;
    const variableClassSet = new Set();
    // use a Set to dedupe the variable classes
    for (const dataset of datasets) {
      for (const variable of dataset.variables) {
        variableClassSet.add(variable.class);
      }
    }
    return Array.from(variableClassSet);
  }

  filterDatasets() {
    // update the store with the selected variable classes, year range, and optional
    // keyword query which will be applied as a filter across the available datasets
    const criteria = {
      selectedVariableClasses: this.selectedVariableClasses,
      yearStart: this.startYear,
      yearEnd: this.endYear,
      query: this.keywordSearchQuery,
    };
    console.log("filtering datasets with criteria: ", criteria);
    filterDatasetMetadata(this.$api(), criteria);
  }

  clearSearchQuery() {
    this.keywordSearchQuery = "";
    this.filterDatasets();
  }
}

export default Search;
</script>

<style scoped></style>
