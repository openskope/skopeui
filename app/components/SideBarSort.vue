<template>
  <v-list>
    <v-list-tile-content>
      <v-layout row>
        <v-flex shrink style="width: 45px">
          <v-text-field
            v-model="value3[0]"
            hide-details
            type="number"
          />
        </v-flex>

        <v-flex style="width: 175px">
          <v-range-slider
            v-model="value3[0]"
            :max="600"
            :min="20"
            :step="1"
          />
        </v-flex>

        <v-flex shrink style="width: 45px">
          <v-text-field
            v-model="value3[1]"
            hide-details
            type="number"
          />
        </v-flex>
      </v-layout>
    </v-list-tile-content>

    <v-divider />

    <v-list-tile-content>
      <v-list-tile-title>Variables</v-list-tile-title>
    </v-list-tile-content>

    <v-list-tile avatar @click="toggle('variable1')">
      <v-list-tile-action>
        <v-checkbox
          v-model="checkedVariables['variable1']"
          :label="`Variable 1`"
        />
      </v-list-tile-action>
    </v-list-tile>

    <v-list-tile avatar @click="toggle('variable2')">
      <v-list-tile-action>
        <v-checkbox
          v-model="checkedVariables['variable2']"
          :label="`Variable 2`"
        />
      </v-list-tile-action>
    </v-list-tile>

    <v-list-tile avatar @click="toggle('variable3')">
      <v-list-tile-action>
        <v-checkbox
          v-model="checkedVariables['variable3']"
          :label="`Variable 3`"
        />
      </v-list-tile-action>
    </v-list-tile>

    <v-list-tile avatar @click="toggle('variable4')">
      <v-list-tile-action>
        <v-checkbox
          v-model="checkedVariables['variable4']"
          :label="`Variable 4`"
        />
      </v-list-tile-action>
    </v-list-tile>

    <v-divider />

    <v-list-tile-content>
      <v-list-tile-title>Radio Selections</v-list-tile-title>
    </v-list-tile-content>

    <v-radio-group v-model="radioGroup">
      <v-radio
        v-for="n in 4"
        :key="n"
        :label="`Radio ${n}`"
        :value="n"
      />
    </v-radio-group>
  </v-list>
</template>
<script>
export default {
  name: 'SideBarSort'
}
</script>
<style scoped>
</style>
