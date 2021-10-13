<template>
  <v-navigation-drawer permanent app>
    <Navigation></Navigation>
    <LoadAnalysis></LoadAnalysis>
  </v-navigation-drawer>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import LoadAnalysis from "@/components/dataset/LoadAnalysis.vue";
import Navigation from "@/components/Navigation.vue";

@Component({
  components: {
    LoadAnalysis,
    Navigation,
  },
})
class ResponsiveNavigation extends Vue {
  // --------- GETTERS ---------

  get isVisible() {
    return this.$api().app.isVisible;
  }

  get isMdAndDown() {
    return this.$vuetify.breakpoint.mdAndDown;
  }

  set isVisible(isVisible) {
    this.$api().app.setNavigationVisible(isVisible);
  }
}

export default ResponsiveNavigation;
</script>
<style scoped></style>
