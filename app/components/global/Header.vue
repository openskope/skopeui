<template>
  <v-app-bar extended extension-height="25" color="primary" app>
    <v-row align="end" align-content="space-between">
      <v-col class="d-flex ma-0 pa-0 shrink" md="2" align-self="end">
        <v-app-bar-nav-icon
          v-if="isMdAndDown"
          class="my-auto"
          color="white"
          @click.stop="toggleDrawer(!drawer)"
        >
        </v-app-bar-nav-icon>
        <v-toolbar-title>
          <nuxt-link class="skope-title ma-0 pa-0" to="/">
            SKOPE
            <p
              v-if="!isMdAndDown"
              class="subtitle-2 ma-0 pa-0"
              style="color: white; font-size: 1rem"
            >
              Synthesizing Knowledge of Past Environments
            </p></nuxt-link
          >
        </v-toolbar-title>
      </v-col>
      <v-col v-if="!isMdAndDown" md="7" class="grow">
        <Navigation />
      </v-col>
      <v-col v-else align-self="center" class="grow text-right mx-2">
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
