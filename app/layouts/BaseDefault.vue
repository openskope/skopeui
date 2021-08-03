<template>
  <v-app light>
    <Header />
    <v-main>
      <v-container fluid>
        <ResponsiveNavigation />
        <Messages />
        <nuxt />
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import Header from "@/components/Header";
import ResponsiveNavigation from "@/components/ResponsiveNavigation";
import Messages from "@/components/Messages";
import Footer from "@/components/Footer";

@Component({
  components: {
    Header,
    ResponsiveNavigation,
    Messages,
    Footer,
  },
})
class BaseDefault extends Vue {
  get isMdAndDown() {
    return this.$vuetify.breakpoint.mdAndDown;
  }
}
export default BaseDefault;
</script>
