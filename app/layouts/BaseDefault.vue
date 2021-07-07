<template>
  <v-app light>
    <Header />
    <v-main>
      <v-container fluid>
        <DiscoverSideBar />
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
import Header from "@/components/global/Header";
import DiscoverSideBar from "@/components/DiscoverSideBar";
import Messages from "@/components/Messages";
import Footer from "@/components/global/Footer";

@Component({
  components: {
    Header,
    DiscoverSideBar,
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
