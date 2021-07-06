<template>
  <v-app-bar extended extension-height="25" color="primary" app>
    <v-row align="end" align-content="space-between">
      <v-col class="d-flex ma-0 pa-0" md="2">
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
      <v-col v-if="!isMdAndDown" lg="7">
        <Navigation />
      </v-col>
      <v-col v-else class="text-center" lg="7">
        <h1 offset-y style="color: white">
          <span style="border-bottom: #ee6c4d solid" class="pb-2">
            <v-icon large color="white" class="mx-2">{{
              steps[currentStepIndex].icon
            }}</v-icon>
            {{ currentStepName }}
          </span>
        </h1>
      </v-col>
      <v-col v-if="!isMdAndDown" md="3" class="text-right">
        <LoadAnalysis></LoadAnalysis>
      </v-col>
    </v-row>
  </v-app-bar>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import LoadAnalysis from "@/components/global/LoadAnalysis.vue";
import Navigation from "@/components/global/Navigation.vue";
import _ from "lodash";

@Component({
  components: {
    LoadAnalysis,
    Navigation,
  },
})
class Header extends Vue {
  stepNames = _.clone(this.$api().app.stepNames);
  steps = _.clone(this.$api().app.steps);

  // --------- GETTERS ---------
  get drawer() {
    return this.$api().app.isVisible;
  }

  get isMdAndDown() {
    return this.$vuetify.breakpoint.mdAndDown;
  }

  get currentStepName() {
    return this.steps[this.currentStepIndex].label;
  }

  get currentStepIndex() {
    return this.stepNames.findIndex((x) => x === this.$route.name);
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
.skope-title {
  text-decoration: none;
  color: white;
  font-family: "Roboto", serif;
  font-weight: bold;
  font-size: 2em;
}
</style>
