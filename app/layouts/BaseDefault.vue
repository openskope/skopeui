<template>
  <v-app light>
    <Header />
    <DiscoverSideBar />
    <v-main>
      <Navigation />
      <v-container fluid>
        <Messages />
        <nuxt />
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import Header from '@/components/global/Header'
import Navigation from '@/components/global/Navigation'
import DiscoverSideBar from '@/components/DiscoverSideBar'
import Messages from '@/components/Messages'
import Footer from '@/components/global/Footer'

export default {
  name: 'SKOPE',
  title: 'SKOPE',
  components: {
    Header,
    Navigation,
    DiscoverSideBar,
    Messages,
    Footer,
  },
}
</script>
