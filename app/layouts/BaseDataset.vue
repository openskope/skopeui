<template>
  <v-app light>
    <Header />
    <DiscoverSideBar />
    <v-main>
      <Messages />
      <nuxt />
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import DiscoverSideBar from "@/components/DiscoverSideBar";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import Messages from "@/components/Messages";

export default {
  name: "SKOPE",
  title: "SKOPE",
  components: {
    DiscoverSideBar,
    Footer,
    Header,
    Messages,
  },
};
</script>
