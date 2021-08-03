<template>
  <v-navigation-drawer v-model="isVisible" temporary app>
    <v-row>
      <v-col cols="12">
        <Navigation></Navigation>
      </v-col>
      <v-col cols="12" class="text-center">
        <LoadAnalysis></LoadAnalysis>
      </v-col>
    </v-row>
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
    this.$api().app.setDrawer(isVisible);
  }
}

export default ResponsiveNavigation;
</script>
<style scoped></style>
