<template>
  <v-row>
    <h1>Select a study area</h1>
    <v-btn :to="{ name: 'dataset-id-visualize', params: $route.params }"
      >Visualize</v-btn
    >
  </v-row>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'

@Component({
  layout: 'BaseDataset',
})
class StudyArea extends Vue {
  async created() {
    this.$api().datasets.selectDataset(this.$route.params.id)
  }
}
export default StudyArea
</script>

<style scoped></style>
