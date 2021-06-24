<template>
  <v-app-bar extended extension-height="25" color="primary" app>
    <v-row align="end" align-content="space-between">
      <v-col class="d-flex ma-0 pa-0">
        <v-app-bar-nav-icon
          v-if="isMdAndDown"
          color="white"
          @click.stop="toggleDrawer(!drawer)"
        >
        </v-app-bar-nav-icon>
        <v-toolbar-title class="mx-2">
          <nuxt-link class="skope-title" to="/">skope</nuxt-link>
        </v-toolbar-title>
      </v-col>
      <v-col md="7">
        <Navigation />
      </v-col>
      <v-col v-if="!isMdAndDown" md="3" class="text-right">
        <Links></Links>
      </v-col>
    </v-row>
  </v-app-bar>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import Navigation from "@/components/global/Navigation.vue";
import Links from "@/components/global/Links.vue";

@Component({
  components: {
    Navigation,
    Links,
  },
})
class Header extends Vue {
  // --------- GETTERS ---------
  get drawer() {
    return this.$api().app.isVisible;
  }

  get isMdAndDown() {
    return this.$vuetify.breakpoint.mdAndDown;
  }

  // --------- METHODS ---------

  toggleDrawer(drawer) {
    console.log("drawer: ", drawer);
    this.$api().app.toggleDrawer(drawer);
  }
}
export default Header;
</script>
<style scoped>
.v-app-bar {
  background: #457b9d;
}

.skope-title {
  text-decoration: none;
  color: white;
  font-family: "Roboto", serif;
  font-weight: bold;
  font-size: 2em;
}

.button {
  /*background: rgb(9, 172, 254);*/
  /*background: linear-gradient(*/
  /*  90deg,*/
  /*  rgba(9, 172, 254, 1) 0%,*/
  /*  rgba(67, 191, 255, 1) 50%*/
  /*);*/
  letter-spacing: 0.05em;
  outline: none;
  font: 1.25em Raleway, sans-serif;
}
</style>
