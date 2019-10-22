<template>
  <!-- footer -->
  <v-footer light height="auto" app absolute class="indigo lighten-1">
    <v-card
      elevation="0"
      text
      tile
      class="indigo lighten-1 mx-auto white--text text-xs-center"
    >
      <v-card-text>
        <v-btn icon :href="github.url">
          <v-icon size="24px" class="mx-3 white--text">{{
            github.icon
          }}</v-icon>
        </v-btn>
        <v-btn text class="white--text" :href="skope.url">
          Skope
        </v-btn>
      </v-card-text>
      <v-divider />
      <v-card-text class="white--text">
        <div>&copy; 2016 - {{ year }}</div>
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

<style scoped></style>
