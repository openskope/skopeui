<template>
  <v-app-bar extended extension-height="25" color="primary" app>
    <v-app-bar-nav-icon
      plain
      color="white"
      @click="toggleDrawer(!drawer)"
    ></v-app-bar-nav-icon>
    <v-toolbar-title class="mr-10">
      <nuxt-link class="skope-title" to="/">skope</nuxt-link>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <Navigation class="mt-2 flex-grow-1" />
    <v-spacer></v-spacer>
    <Links></Links>
  </v-app-bar>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import Navigation from "@/components/global/Navigation.vue";
import Links from "@/components/global/Links.vue";
import { Prop, Watch } from "vue-property-decorator";

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

  // --------- METHODS ---------

  toggleDrawer(drawer) {
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
