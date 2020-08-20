<template>
  <v-navigation-drawer fixed permanent app>
    <section class="pt-3">
      <div class="container">
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
export default {
  name: 'DiscoverSideBar',
  data() {
    const currentYear = new Date().getFullYear()
    return {
      search: '',
      startYear: 1,
      endYear: currentYear,
      selectedVariableClasses: [],
      minYear: 1,
      maxYear: currentYear,
    }
  },
  computed: {
    startYearRules() {
      return [
        (v) =>
          v >= this.minYear ||
          `Please enter a valid start year after ${this.minYear}`,
        (v) =>
          v <= this.endYear ||
          `Please enter a valid start year before ${this.endYear}`,
      ]
    },
    endYearRules() {
      return [
        (v) =>
          v >= this.startYear ||
          `Please enter a valid end year after ${this.startYear}`,
        (v) =>
          v <= this.maxYear ||
          `Please enter a valid end year before ${this.maxYear}`,
      ]
    },
    variableClasses() {
      const datasets = this.$store.state.datasets.all
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
    },
  },
  created() {
    this.$store.dispatch('datasets/load')
  },
  // mounted() {},
  methods: {
    filterDatasets() {
      // update the store with the selected variable classes, year range, and optional
      // keyword query which will be applied as a filter across the available datasets
      this.$store.dispatch('datasets/filter', {
        selectedVariableClasses: this.selectedVariableClasses,
        yearStart: this.startYear,
        yearEnd: this.endYear,
        query: this.search,
      })
    },
  },
}
</script>
<style scoped></style>
