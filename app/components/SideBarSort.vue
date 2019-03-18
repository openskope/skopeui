<template>
  <div class="container">
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
    <v-spacer />
    <v-subheader>Variables</v-subheader>
    <v-list
      v-for="variable of variables"
      :key="variable.name"
      dense
    >
      <v-checkbox
        v-model="variable.checked"
        value="variable.name"
        :label="variable.name"
      />
    </v-list>
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
      bounds: [1, 2019],
      variables: [
        { name: 'variable1', checked: false },
        { name: 'variable2', checked: false },
        { name: 'variable3', checked: false }
      ],
      radioSelect: 1
    }
  }
}
</script>
<style scoped>
</style>
