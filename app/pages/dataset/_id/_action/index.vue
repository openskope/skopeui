<template>
  <v-row>
    <h1>action</h1>
    <Metadata v-if="isMetadata($route.params.action)" />
  </v-row>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
import Metadata from '@/components/action/Metadata.vue'

@Component({
  layout: 'BaseDataset',
  components: {
    Metadata,
  },
})
class Action extends Vue {
  async created() {
    console.log(this.$route.params.action)
  }

  isMetadata(slug) {
    return slug == 'metadata'
  }
}
export default Action
</script>

<style scoped></style>
