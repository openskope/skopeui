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
    <Navigation class="mt-2 flex-grow-1" />
    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <v-btn
          plain
          color="white"
          large
          icon
          v-bind="attrs"
          class="mt-3 mx-3 button"
          :href="github.url"
          v-on="on"
        >
          <v-icon large color="white">{{ github.icon }}</v-icon>
        </v-btn>
      </template>
      <span>GitHub</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <v-btn
          plain
          color="white"
          large
          icon
          class="mt-3 mx-3 button"
          v-bind="attrs"
          v-on="on"
          ><v-icon large color="white">help</v-icon></v-btn
        >
      </template>
      <span>Help</span>
    </v-tooltip>

    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <v-btn
          plain
          color="white"
          icon
          large
          href="https://www.comses.net/about/contact/"
          target="_blank"
          v-bind="attrs"
          class="mt-3 mx-3 button"
          v-on="on"
        >
          <v-icon large color="white">email</v-icon>
        </v-btn>
      </template>
      <span>Email us</span>
    </v-tooltip>
  </v-app-bar>
</template>
<script>
import Vue from 'vue';
import { Component } from 'nuxt-property-decorator';
import Navigation from '@/components/global/Navigation.vue';
import { Prop, Watch } from 'vue-property-decorator';

@Component({
  components: {
    Navigation,
  },
})
class Header extends Vue {
  github = {
    icon: 'fab fa-github',
    url: 'https://github.com/openskope/skopeui',
  };

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
  background: rgb(73, 190, 131);
  background: linear-gradient(
    90deg,
    rgba(73, 190, 131, 1) 0%,
    rgba(81, 192, 139, 1) 50%,
    rgba(88, 193, 145, 1) 100%
  );
}

.skope-title {
  text-decoration: none;
  color: white;
  font-family: 'Roboto', serif;
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
