<template>
  <v-row>
    <Analyze v-if="isAnalyze($route.params.action)" />
    <Visualize v-if="isVisualize($route.params.action)" />
    <Metadata v-if="isMetadata($route.params.action)" />
  </v-row>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
import Analyze from '@/components/action/Analyze.vue'
import Metadata from '@/components/action/Metadata.vue'
import Visualize from '@/components/action/Visualize.vue'

@Component({
  layout: 'BaseDataset',
  components: {
    Analyze,
    Metadata,
    Visualize,
  },
})
class Action extends Vue {
  async created() {
    console.log(this.$route.params.action)
  }

  isVisualize(slug) {
    return slug == 'visualize'
  }

  isAnalyze(slug) {
    return slug == 'analyze'
  }

  isMetadata(slug) {
    return slug == 'metadata'
  }
}
export default Action
</script>

<style scoped></style>
