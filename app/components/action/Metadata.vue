<template>
  <!--  <v-card>-->
  <!--    <v-card-title class="accent text&#45;&#45;white">-->
  <!--      Metadata-->
  <!--      <v-spacer></v-spacer>-->
  <!--      <v-btn icon @click="dialog = false">-->
  <!--        <v-icon color="white">fas fa-window-close</v-icon>-->
  <!--      </v-btn>-->
  <!--    </v-card-title>-->
  <!--    <v-card-text class="my-3">-->
  <v-card-text>
    <v-row class="mb-4">
      <v-list dense flat>
        <v-list-item-title><strong>Variables:</strong></v-list-item-title>
        <v-list-item
          v-for="(variable, index) in selectedDataset.variables"
          :key="index"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-chip small label color="secondary" text-color="black">
                <v-icon>view_column</v-icon>
                {{ variable.class }}
              </v-chip>
              {{ variable.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-row>
    <v-row>
      <div v-for="(label, attr) in metadataAttributes" :key="attr" class="py-0">
        <span class="font-weight-bold"> {{ label }}: </span>
        <div v-html="$md.render(selectedDataset[attr])"></div>
      </div>
    </v-row>
  </v-card-text>
  <!--    </v-card-text>-->
  <!--    <v-card-actions>-->
  <!--      <v-spacer></v-spacer>-->
  <!--      <v-btn text @click="dialog = false">Close</v-btn>-->
  <!--    </v-card-actions>-->
  <!--  </v-card>-->
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'

@Component({
  name: 'Metadata',
})
class Metadata extends Vue {
  get selectedDataset() {
    return this.$api().datasets.selectedDataset
  }

  get metadataAttributes() {
    return {
      originator: 'Originator',
      uncertainty: 'Uncertainty',
      methodSummary: 'Method Summary',
      references: 'References',
      contactInformation: 'Contact Information',
    }
  }
}

export default Metadata
</script>

<style scoped></style>
