<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <v-card min-width='900px'>
        <v-toolbar color="cyan" dark>
          <v-toolbar-side-icon />
          <v-toolbar-title>Datasets</v-toolbar-title>
          <v-spacer />
          <v-btn icon>
            <v-icon>search</v-icon>
          </v-btn>
        </v-toolbar>
        <v-list>
          <template
            v-for="dataset in datasets"
            :to="dataset.to"
            router
            exact
          >
            <v-list-tile :key="dataset.title">
              <v-list-tile-content>
                <v-list-tile-title v-html="dataset.title" />
                <v-list-tile-text v-text="dataset.description" />
              </v-list-tile-content>
              <v-btn
                color="primary"
                flat
                nuxt
                to="/model"
              >
                Continue
              </v-btn>
            </v-list-tile>
          </template>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
/*
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'

export default {
  components: {
    Logo,
    VuetifyLogo
  }
}
*/
export default {
  data() {
    return {
      datasets: [
        {
          title: 'LBDA V2',
          description: 'A recalibrated reconstruction.',
          to: '/datasets/lbda'
        },
        {
          title: 'SRTM',
          description: 'Digital elevation data',
          to: '/datasets/srtm'
        },
        {
          title: 'PaleoCAR',
          description: 'High spatial resolution',
          to: '/datasets/paleocar'
        }
      ]
    }
  }
}
</script>
