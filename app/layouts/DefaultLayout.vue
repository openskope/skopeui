<template>
  <v-app light>
    <Header />
    <Navigation />
    <v-main>
      <v-container fluid>
        <Messages />
        <nuxt />
      </v-container>
    </v-main>
    <div class="mt-6">
      <Footer />
    </div>
  </v-app>
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Messages from "@/components/Messages";
import Footer from "@/components/Footer";

@Component({
  components: {
    Header,
    Navigation,
    Messages,
    Footer,
  },
})
class DefaultLayout extends Vue {}
export default DefaultLayout;
</script>
