<template>
  <v-app light>
    <Header />
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
import Footer from '@/components/global/Footer'
import Messages from '@/components/Messages'
import Navigation from '@/components/global/Navigation'

export default {
  name: 'SKOPE',
  title: 'SKOPE',
  components: {
    Footer,
    Header,
    Messages,
    Navigation,
  },
}
</script>
