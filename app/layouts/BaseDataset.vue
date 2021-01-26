<template>
  <v-app light>
    <Header />
    <v-main>
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

export default {
  name: 'SKOPE',
  title: 'SKOPE',
  components: {
    Footer,
    Header,
    Messages,
  },
}
</script>
