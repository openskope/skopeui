<template>
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
            placeholder="Search datatsets"
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
    <v-subheader>Variables</v-subheader>
    <v-list
      v-for="(variable, index) in variables"
      :key="index"
      dense
    >
      <v-checkbox
        v-model="variable.checked"
        value="variable.name"
        :label="variable.name"
        :change="getFilteredDatasets"
      />
    </v-list>
    <!-- end variable checkbox selector -->

    <!-- spacing between sorting methods -->
    <v-spacer />
    <v-divider />
    <v-spacer />
    <!-- end spacing between sorting methods -->
    <v-subheader>Radio Button</v-subheader>
    <v-radio-group v-model="radioSelect">
      <v-radio
        v-for="i in 5"
        :key="i"
        :label="`Radio ${ i }`"
        :value="i"
      />
    </v-radio-group>
    <!-- spacing between sorting methods -->
    <v-spacer />
    <v-divider />
    <v-spacer />
    <!-- end spacing between sorting methods -->
  </div>
</template>
<script>
export default {
  name: 'SideBarSort',
  data() {
    return {
      filteredDatasets: [],
      filteredByVariables: [],
      datasets: [],
      search: '',
      bounds: [1, 2019],
      variables: [
        // populate this programmatically
        { name: 'variable1', checked: false },
        { name: 'variable2', checked: false },
        { name: 'variable3', checked: false }
      ],
      radioSelect: 1
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
    defaultDataset() {
      return this.$store.datasets
    }
  },
  mounted() {
    this.setVariablesArray()
  },
  methods: {
    getFilteredDatasets() {
      // filter checked variable filters
      if (this.selectedVariableFilters.length > 0) {
        this.filteredByVariables = this.filteredDatasets.filter(obj =>
          this.selectedVariableFilters.every(
            val => obj.variable.indexOf(val) >= 0
          )
        )
        this.filteredDatasets = this.filteredByVariables
      }
    },
    setVariablesArray() {
      this.variables = []
      this.datasets = this.defaultDataset
      for (let i = 0; i < this.datasets.length; i++) {
        this.variables.push({
          name: this.datasets.variables.name,
          checked: false
        })
      }
      return this.variables
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
