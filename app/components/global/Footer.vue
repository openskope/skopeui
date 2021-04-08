<template>
  <!-- footer -->
  <v-footer app absolute dark padless>
    <v-card color="secondary" class="flex darken-1 p-2">
      <v-card-text class="text-center">
        This material is based upon work supported by the National Science
        Foundation under Grant Nos. SMA 1439591 and 1637189 to Arizona State
        University, SMA 1439603 and 1637155 to the University of Illinois at
        Urbana-Champaign, and SMA 1439516 and 1637171 to Washington State
        University. &copy; 2016 - {{ new Date().getFullYear() }}
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
    };
  },
};
</script>
