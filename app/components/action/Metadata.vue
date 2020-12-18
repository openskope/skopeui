<template>
  <v-container fill-width fluid>
    <v-row>
      <h1>Metadata</h1>
    </v-row>
    <v-row>
      <div v-for="(label, attr) in metadataAttributes" :key="attr" class="py-0">
        <span class="font-weight-bold"> {{ label }}: </span>
        <div v-html="$md.render(selectedDataset[attr])"></div>
      </div>
    </v-row>
  </v-container>
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
