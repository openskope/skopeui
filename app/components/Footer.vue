<template>
  <!-- footer -->
  <v-footer light height="auto" app absolute class="indigo lighten-1">
    <v-card
      elevation="0"
      text
      tile
      class="indigo lighten-1 mx-auto white--text text-xs-center"
    >
      <v-card-text class="white--text">
        <div>
          This material is based upon work supported by the National Science
          Foundation under Grant Nos. SMA 1439591 and 1637189 to Arizona State
          University, SMA 1439603 and 1637155 to the University of Illinois at
          Urbana-Champaign, and SMA 1439516 and 1637171 to Washington State
          University.
        </div>
      </v-card-text>
      <v-divider />
      <v-card-text class="white--text text-center">
        <v-btn class="white--text" icon :href="github.url">
          <v-icon size="24px" class="mx-3">{{ github.icon }}</v-icon>
        </v-btn>
        <v-btn class="white--text" text :href="skope.url">
          SKOPE
        </v-btn>
        &copy; 2016 - {{ year }}
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
      year: new Date().getFullYear(),
      github: {
        icon: 'fab fa-github',
        url: 'https://github.com/openskope/skopeui'
      },
      skope: {
        url: 'https://www.openskope.org'
      }
    }
  }
}
</script>
