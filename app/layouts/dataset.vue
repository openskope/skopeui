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
import Footer from '@/components/Footer'
import Header from '@/components/Header'
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
