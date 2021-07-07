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
import DiscoverSideBar from "@/components/DiscoverSideBar";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import Messages from "@/components/Messages";

@Component({
  components: {
    Header,
    DiscoverSideBar,
    Messages,
    Footer,
  },
})
class BaseDataset extends Vue {
  get isMdAndDown() {
    return this.$vuetify.breakpoint.mdAndDown;
  }
}
export default BaseDataset;
</script>
