<template>
  <!-- footer -->
  <v-footer app absolute dark padless>
    <v-card color="indigo" class="flex darken-1 p-2">
      <v-card-text class="text-center">
        This material is based upon work supported by the National Science
        Foundation under Grant Nos. SMA 1439591 and 1637189 to Arizona State
        University, SMA 1439603 and 1637155 to the University of Illinois at
        Urbana-Champaign, and SMA 1439516 and 1637171 to Washington State
        University.
      </v-card-text>
      <v-divider></v-divider>
      <v-card-text class="text-center">
        <v-btn icon :href="github.url">
          <v-icon size="24px" class="mx-3">{{ github.icon }}</v-icon>
        </v-btn>
        <v-btn text href="https://www.openskope.org">openskope.org</v-btn>
        &copy; 2016 - {{ new Date().getFullYear() }}
      </v-card-text>
    </v-card>
  </v-footer>
  <!-- end footer -->
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      github: {
        icon: 'fab fa-github',
        url: 'https://github.com/openskope/skopeui',
      },
    }
  },
}
</script>
