<template>
  <v-app-bar src="/header.png" dense light shrink-on-scroll app>
    <template #img="{ props }">
      <v-img v-bind="props" cover></v-img>
    </template>
    <v-app-bar-nav-icon light @click.stop="toggleNavigationDrawer()">
      <v-icon color="primary" x-large>fas fa-bars</v-icon>
    </v-app-bar-nav-icon>
    <v-app-bar-title>
      <a
        class="skope-title pa-0 ma-0"
        href="https://www.openskope.org"
        target="_blank"
      >
        SKOPE
        <div class="skope-subtitle">
          Synthesizing Knowledge of Past Environments
        </div>
      </a>
    </v-app-bar-title>
    <v-spacer />
    <LoadAnalysis />
  </v-app-bar>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import LoadAnalysis from "@/components/dataset/LoadAnalysis.vue";
import _ from "lodash";

@Component({
  components: {
    LoadAnalysis,
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

  toggleNavigationDrawer() {
    this.$api().app.toggleNavigationDrawer();
  }
}
export default Header;
</script>
<style lang="scss" scoped>
.skope-title {
  text-decoration: none;
  color: $skope-title-color;
  font-family: $skope-title-font;
  font-weight: bold;
  font-size: 2.3em;
}

.skope-subtitle {
  color: $skope-dark-blue;
  font-family: $skope-title-font;
  font-size: 1.4rem;
}
</style>
