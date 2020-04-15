<template>
  <v-app-bar src="/header.png" shrink-on-scroll prominent app>
    <v-toolbar-title>
      <nuxt-link class="skope-title" to="/">
        <v-img
          class="mb-n10"
          alt="SKOPE"
          position="left center"
          height="120"
          max-height="120"
          src="/logo-640x360.png"
          contain
        >
        </v-img>
      </nuxt-link>
    </v-toolbar-title>
    <v-spacer />
    <v-toolbar-items>
      <v-btn text><v-icon left dark>help</v-icon> Help</v-btn>
      <v-btn text href="https://www.comses.net/about/contact/" target="_blank">
        <v-icon left dark>email</v-icon>
        Contact
      </v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>
<script>
export default {
  name: 'Header'
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
