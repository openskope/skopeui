<template>
  <div class="container">
    <span class="title">Dataset Filters</span>
    <v-spacer class="spacing" />
    <!-- search form -->
    <form id="searchForm" class="sidebar-form" @submit.prevent>
      <div id="searchContainer" class="input-group">
        <span class="input-group-btn">
          <input
            id="search"
            v-model="search"
            type="text"
            name="search"
            class="search form-control"
            data-toggle="hideseek"
            placeholder="Search datasets"
            data-list=".sidebar-menu"
            @keydown.enter="search"
            @change="filterDatasets"
          />
          <button
            id="search-btn"
            type="submit"
            name="search"
            class="btn btn-flat"
            @click="search"
          >
            <i class="fa fa-search" />
          </button>
        </span>
      </div>
    </form>
    <!-- end search form -->
    <v-divider class="dividerPadding" />
    <!-- time range slider -->
    <v-subheader>Range Slider</v-subheader>
    <v-layout row>
      <v-flex shrink style="width: 60px">
        <v-text-field
          v-model="bounds[0]"
          style="width: 50px"
          hide-details
          single-line
          type="number"
        />
      </v-flex>
      <v-flex class="px-3">
        <v-range-slider
          v-model="bounds"
          :value="bounds"
          :max="2019"
          :min="1"
          :step="1"
          @change="filterDatasets"
        />
      </v-flex>
      <v-flex>
        <v-text-field
          v-model="bounds[1]"
          hide-details
          single-line
          type="number"
        />
      </v-flex>
    </v-layout>
    <!-- end time range slider -->
    <v-divider class="dividerPadding" />
    <!-- variable checkbox selector -->
    <v-subheader>Variables</v-subheader>
    <v-list v-for="(variable, index) in variableClasses" :key="index">
      <v-checkbox
        v-model="selectedVariableClasses"
        :value="variable.name"
        :label="variable.name"
        @change="filterDatasets"
      />
    </v-list>
    <!-- end variable checkbox selector -->
  </div>
</template>
<script>
export default {
  name: 'DiscoverSideBar',
  data() {
    return {
      search: '',
      bounds: [1, 2019],
      selectedVariableClasses: [],
      yearStart: 1,
      yearEnd: 2019
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
          checked: false
        })
      }
      return variableClasses
    }
  },
  created() {
    this.$store.dispatch('datasets/load')
  },
  // mounted() {},
  methods: {
    filterDatasets() {
      // FIXME: something magical happens to the store
      // based on the criteria / parameterizations set on this component,
      // update the store so that pages/index.vue can properly filter its datasets
      console.log(this.selectedVariableClasses)
      this.$store.dispatch('datasets/filter', {
        selectedVariableClasses: this.selectedVariableClasses,
        yearStart: this.bounds[0],
        yearEnd: this.bounds[1],
        query: this.search
      })
    }
  }
}
</script>
<style scoped>
#searchForm {
  padding-left: 0em;
  padding-right: 0em;
}

#searchContainer {
  height: 100%;
  padding-bottom: 15px;
}

#search {
  width: 80%;
  float: right;
}

#search-btn {
  width: 20%;
}

.dividerPadding {
  padding-bottom: 3em;
}

.title {
  font-size: 18px;
}

.spacing {
  padding-bottom: 2em;
}
</style>
