<template>
  <v-row align="center" justify="center">
    <v-col>
      <v-progress-circular size="150" width="15"> Loading </v-progress-circular>
    </v-col>
  </v-row>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'

@Component({})
class LoadingSpinner extends Vue {}

export default LoadingSpinner
</script>
