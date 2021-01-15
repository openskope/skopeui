<template>
  <v-row>
    <h1>Export a time series</h1>
  </v-row>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'

@Component({
  layout: 'BaseDataset',
})
class Export extends Vue {
  async created() {
    console.log(this.$route.params.action)
  }
}
export default Export
</script>

<style scoped></style>
