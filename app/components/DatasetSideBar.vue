<template>
  <v-navigation-drawer
    fixed
    clipped
    app
  >
    <div class="container">
      <v-subheader class="title">
        Variable(s) to display
      </v-subheader>
      <v-list
        v-for="(variable, index) in variables"
        :key="index"
      >  
        <v-checkbox
          v-model="selectedVariables"
          :value="variable.name"
          :label="variable.name"
        />
      </v-list>
      <v-divider />
      <v-subheader class="title">
        Temporal controls
      </v-subheader>
      <v-subheader>Date range (year)</v-subheader>
      <v-layout row>
        <v-flex
          shrink
          style="width: 60px"
        >
          <v-text-field
            v-model="temporalRange[0]"
            style="width: 50px"
            hide-details
            single-line
            type="number"
          />
        </v-flex>
        <v-flex class="px-3">
          <v-range-slider
            v-model="temporalRange"
            :max="2019"
            :min="1"
            :step="1"
          />
        </v-flex>
        <v-flex>
          <v-text-field
            v-model="temporalRange[1]"
            hide-details
            single-line
            type="number"
          />
        </v-flex>
      </v-layout>
      <v-divider />
      <v-subheader class="title">
        Analytics boundary
      </v-subheader>
      <div class="map">
        Put a map here or rethink the layout
      </div>
    </div>
  </v-navigation-drawer>
</template>
<script>
export default {
  name: 'DatasetControls',
  data: function() {
    return {
      selectedVariables: [],
      temporalRange: [1, 2019]
    }
  },
  computed: {
    variables() {
      return this.$store.state.datasets.selectedDataset.variables
    }
  }
}
</script>

<style scoped>
.sidebar {
  padding-top: 30px;
}
</style>
