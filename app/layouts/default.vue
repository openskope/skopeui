<template>
  <div>
    <v-app light />
    <Header />
    <side-bar />
    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>
    <Footer />
  </div>
</template>

<script>
import Header from '../components/Header'
import SideBar from '../components/SideBar'
import Footer from '../components/Footer'

export default {
  components: {
    Header,
    SideBar,
    Footer
  },
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      navDrawItems: [
        {
          icon: 'apps',
          title: 'Datasets',
          to: '/'
        },
        {
          icon: 'my_location',
          title: 'Map',
          to: '/inspire'
        }
      ],
      icons: ['fab fa-github', 'fab fa-twitter'],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'SKOPE',
      value3: [1, 440],
      checkedVariables: ['variable1', 'variable2', 'variable3', 'variable4'],
      radioGroup: 1
    }
  },
  methods: {
    toggle: function(name) {
      this.checkVariables[name] = !this.checkedVariables[name]
    }
  }
}
</script>
