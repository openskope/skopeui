<template>
  <v-toolbar :clipped-left="clipped" app fixed>
    <v-toolbar-title>
      <nuxt-link class="pl-3 skope-title" to="/">
        SKOPE
      </nuxt-link>
      Synthesizing Knowledge of Past Environments
    </v-toolbar-title>
    <v-spacer />
    <v-toolbar-items>
      <v-btn text><v-icon left dark>help</v-icon> Help</v-btn>
      <v-btn text href="https://www.comses.net/about/contact/" target="_blank">
        <v-icon left dark>email</v-icon>
        Contact
      </v-btn>
      <v-btn text tile><v-icon left dark>account_box</v-icon> Sign In</v-btn>
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
  text-decoration: none;
  color: rgb(128, 0, 0);
  font-family: Bitter, serif;
  font-weight: bold;
  font-size: 1.6em;
}
</style>
