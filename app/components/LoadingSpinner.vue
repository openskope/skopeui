<template>
  <v-row
    class="text-center"
    align-content="center"
    justify="center"
    style="height: 100%; width: 100%"
  >
    <v-col>
      <v-progress-circular
        :size="100"
        :width="5"
        color="secondary"
        indeterminate
      >
      </v-progress-circular>
    </v-col>
  </v-row>
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";

@Component({})
class LoadingSpinner extends Vue {}

export default LoadingSpinner;
</script>
