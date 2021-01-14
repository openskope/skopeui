<template>
  <v-container fill-width fluid>
    <v-row>
      <h2 class="mx-5">Analyze Data</h2>
      <v-dialog v-model="dialog" persistent max-width="600px">
        <template #activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on">
            View Metadata
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline"> Metadata </v-card-title>
          <v-card-text><Metadata /></v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="dialog = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
import Metadata from '@/components/action/Metadata.vue'

@Component({
  components: {
    Metadata,
  },
})
class Analyze extends Vue {
  dialog = false
}
export default Analyze
</script>

<style scoped></style>
