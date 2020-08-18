<template>
  <v-navigation-drawer fixed permanent app>
    <section class="pt-3">
      <div class="container">
        <h2 class="headline font-weight-black">Filter Datasets</h2>
        <!-- search form -->
        <form @submit.prevent>
          <div class="input-group pb-2">
            <span class="input-group-btn">
              <v-text-field
                id="search"
                v-model="search"
                data-toggle="hideseek"
                label="Search datasets"
                append-icon="fas fa-search"
                @keydown.enter="filterDatasets"
              />
            </span>
          </div>
        </form>
        <!-- end search form -->
        <!-- time range slider -->
        <h3 class="title py-3">Year Range</h3>
        <v-range-slider
          v-model="bounds"
          class="align-center"
          :value="bounds"
          :max="yearEnd"
          :min="0"
          :step="1"
          @change="filterDatasets"
        >
          <template v-slot:prepend>
            <v-text-field
              v-model="bounds[0]"
              class="mt-0 pt-0"
              style="width: 50px;"
              dense
              hide-details
              single-line
              type="number"
              @keydown.enter="filterDatasets"
            >
            </v-text-field>
          </template>
          <template v-slot:append>
            <v-text-field
              v-model="bounds[1]"
              class="mt-0 pt-0"
              style="width: 50px;"
              hide-details
              single-line
              type="number"
              @keydown.enter="filterDatasets"
            >
            </v-text-field>
          </template>
        </v-range-slider>
        <!-- end year range slider -->
        <v-divider class="mb-3" />
        <!-- variable checkbox selector -->
        <h3 class="title py-3">Variables</h3>
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
            class="py-0 my-0"
            @change="filterDatasets"
          >
            <template v-slot:label>
              <v-chip
                small
                label
                class="ma-1"
                color="indigo"
                text-color="white"
              >
                <v-icon>view_column</v-icon>
                {{ variable.name }}
              </v-chip>
            </template>
          </v-checkbox>
        </v-list>
        <!-- end variable checkbox selector -->
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
      bounds: [1, currentYear],
      selectedVariableClasses: [],
      yearStart: 1,
      yearEnd: currentYear,
    }
  },
  computed: {
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
        yearStart: this.bounds[0],
        yearEnd: this.bounds[1],
        query: this.search,
      })
    },
  },
}
</script>
<style scoped></style>
