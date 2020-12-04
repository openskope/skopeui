<template>
  <v-navigation-drawer v-model="isVisible" absolute bottom temporary>
    <section class="pt-3">
      <div class="container">
        <v-btn class="ma-2" color="orange darken-2" dark @click="hideDrawer">
          <v-icon dark left>fas fa-arrow-left</v-icon>Hide Menu
        </v-btn>
        <h2 class="headline font-weight-black">Filter Datasets</h2>
        <v-form @submit.prevent>
          <v-container>
            <v-row>
              <v-col>
                <!-- keyword search -->
                <v-text-field
                  id="search"
                  v-model="search"
                  clearable
                  data-toggle="hideseek"
                  label="Keyword Search"
                  append-icon="fas fa-search"
                  @change="filterDatasets"
                />
              </v-col>
            </v-row>
            <!-- start and end date range -->
            <h3 class="title">Year Range</h3>
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
            <h3 class="title">Variables</h3>
            <v-row>
              <v-list
                v-for="(variable, index) in variableClasses"
                :key="index"
                class="py-0"
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
                  <template v-slot:label>
                    <v-chip
                      small
                      label
                      outlined
                      class="ma-1 width-50"
                      color="indigo"
                    >
                      <v-icon>view_column</v-icon>
                      {{ variable.name }}
                    </v-chip>
                  </template>
                </v-checkbox>
              </v-list>
            </v-row>

            <!-- end variable checkbox selector -->
          </v-container>
        </v-form>
      </div>
    </section>
  </v-navigation-drawer>
</template>
<script>
import { Component } from 'nuxt-property-decorator'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'

@Component()
class DiscoverSideBar extends Vue {
  currentYear = new Date().getFullYear()

  search = ''
  startYear = 1
  endYear = this.currentYear
  selectedVariableClasses = []
  minYear = 1
  maxYear = this.currentYear

  // --------- GETTERS ---------

  get isVisible() {
    // "!!" - converts value to boolean
    return !!this.$api().app.isVisible
  }

  get startYearRules() {
    return [
      (v) =>
        v >= this.minYear ||
        `Please enter a valid start year after ${this.minYear}`,
      (v) =>
        v <= this.endYear ||
        `Please enter a valid start year before ${this.endYear}`,
    ]
  }

  get endYearRules() {
    return [
      (v) =>
        v >= this.startYear ||
        `Please enter a valid end year after ${this.startYear}`,
      (v) =>
        v <= this.maxYear ||
        `Please enter a valid end year before ${this.maxYear}`,
    ]
  }

  get variableClasses() {
    const datasets = this.$api().datasets.all
    const variableClassSet = new Set()
    for (const dataset of datasets) {
      for (const variable of dataset.variables) {
        variableClassSet.add(variable.class)
      }
    }
    const variableClasses = []
    for (const variableClass of variableClassSet) {
      variableClasses.push({
        name: variableClass,
        checked: false,
      })
    }
    return variableClasses
  }

  created() {
    this.$api().datasets.retrieveData()
  }

  // --------- METHODS ---------

  hideDrawer() {
    // hide drawer when visible = 0
    var visible = 0
    this.$api().app.toggleDrawer(visible)
  }

  filterDatasets() {
    // update the store with the selected variable classes, year range, and optional
    // keyword query which will be applied as a filter across the available datasets
    this.$api().datasets.filter({
      selectedVariableClasses: this.selectedVariableClasses,
      yearStart: this.startYear,
      yearEnd: this.endYear,
      query: this.search,
    })
  }
}

export default DiscoverSideBar
</script>
<style scoped></style>
