<template>
  <v-row>
    <h1>This is a page for the action</h1>
    <h2>An action can be study / visualize / analyze / metadata</h2>
  </v-row>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'

@Component({
  layout: 'BaseDataset',
})
class Action extends Vue {
  async created() {
    console.log(this.$route.params.action)
  }
}
export default Action
</script>

<style scoped></style>
