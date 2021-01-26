<template>
  <v-app-bar src="/header.png" shrink-on-scroll dense flat app>
    <v-app-bar-nav-icon
      @disabled="isDisabled"
      @click="toggleDrawer"
    ></v-app-bar-nav-icon>
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
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-btn icon :href="github.url">
        <v-icon size="24px" class="mx-3">{{ github.icon }}</v-icon>
      </v-btn>
      <v-btn text><v-icon left dark>help</v-icon>Help</v-btn>
      <v-btn text href="https://www.comses.net/about/contact/" target="_blank">
        <v-icon left dark>email</v-icon>
        Contact
      </v-btn>
    </v-toolbar-items>
    <template v-slot:extension>
      <Navigation class="flex-grow-1" />
    </template>
  </v-app-bar>
</template>
<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
import Navigation from '@/components/global/Navigation.vue'
import { Prop, Watch } from 'vue-property-decorator'

@Component({
  components: {
    Navigation,
  },
})
class Header extends Vue {
  github = {
    icon: 'fab fa-github',
    url: 'https://github.com/openskope/skopeui',
  }
  // --------- GETTERS ---------

  get isDisabled() {
    return this.$api().app.isDisabled
  }

  get currentStep() {
    return this.$api().app.currentStep
  }

  get isVisible() {
    return this.$api().app.isVisible
  }

  // --------- METHODS ---------

  toggleDrawer() {
    var drawerVisible = 0
    if (!this.isDisabled) {
      drawerVisible = this.isVisible
      if (this.isVisible) {
        drawerVisible -= 1
      } else {
        drawerVisible += 1
      }
    }
    console.debug('visible =  %i', drawerVisible)
    this.$api().app.toggleDrawer(drawerVisible)
  }
}
export default Header
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
