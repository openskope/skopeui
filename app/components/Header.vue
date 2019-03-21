<template>
  <v-toolbar
    :clipped-left="clipped"
    app
    fixed
  >
    <v-toolbar-title>
      <nuxt-link class="display-1 skope-title" to="/">
        SKOPE: Synthesizing Knowledge of Past Environments
      </nuxt-link>
    </v-toolbar-title>
    <v-spacer />
    <v-toolbar-items class="hidden-sm-and-down">
      <v-btn flat to="/">
        Datasets
      </v-btn>
      <v-btn flat to="/map">
        Interactive Map
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>
<script>
export default {
  name: 'Header',
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false
    }
  }
}
</script>
<style scoped>
.skope-title {
  text-decoration: none !important;
  font-family: 'Source Sans Pro', Helvetica, sans-serif;
}
</style>
