fjkfjkdjtjklfjjtjfndkljt<template>
  <div class="container">
    <!-- search form -->
    <form id="searchForm" class="sidebar-form" @submit.prevent>
      <div id="searchContainer" class="input-group">
        <span class="input-group-btn">
          <input
            id="search"
            type="text"
            name="search"
            class="search form-control"
            data-toggle="hideseek"
            placeholder="Search datasets"
            data-list=".sidebar-menu"
            @keydown.enter="search"
          >
          <button id="search-btn" type="submit" name="search" class="btn btn-flat" @click="search">
            <i class="fa fa-search" />
          </button>
        </span>
      </div>
    </form>
    <!-- end search form -->
    <v-spacer />
    <v-divider />
    <v-spacer />
    <!-- time range slider -->
    <v-subheader>Range Slider</v-subheader>
    <v-layout row>
      <v-flex
        shrink
        style="width: 60px"
      >
        <v-text-field
          v-model="bounds[0]"
          style="width: 50px"
          hide-details
          single-line
          type="number"
        />
      </v-flex>
      <v-spacer />
      <v-flex class="px-3">
        <v-range-slider
          v-model="bounds"
          :max="2019"
          :min="1"
          :step="1"
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
    <v-spacer />
    <v-divider />
    <v-spacer />

    <!-- variable checkbox selector -->
    <v-subheader>Variable Classes</v-subheader>
    <v-list
      v-for="(variable, index) in variableClasses"
      :key="index"
    >
      <v-checkbox
        v-model="variable.checked"
        value="variable.name"
        :label="variable.name"
        :change="filterDatasets"
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
      bounds: [1, 2019]
    }
  },
  computed: {
    selectedVariableFilters() {
      let checkedVariableFilters = []
      const variableFilters = []
      checkedVariableFilters = this.variables.filter(obj => obj.checked)
      checkedVariableFilters.forEach(element => {
        variableFilters.push(element.name)
      })
      return variableFilters
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
          checked: false
        })
      }
      return variableClasses
    }
  },
  created() {
    this.$store.dispatch('datasets/load')
  },
  mounted() {},
  methods: {
    filterDatasets() {
      // FIXME: something magical happens to the store
      // based on the criteria / parameterizations set on this component,
      // update the store so that pages/index.vue can properly filter its datasets
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
</style>
