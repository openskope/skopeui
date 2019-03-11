<template>
  <v-layout
    column
    justify-center
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <v-card>
        <v-responsive :aspect-ratio="16/9">
          <v-card-title>
            <v-icon left>
              sd_card
            </v-icon>
            <span class="title">
              Datasets
            </span>
          </v-card-title>
          <v-list>
            <template
              v-for="dataset in datasets"
              router
              exact
            >
              <Dataset :key="dataset.url" v-bind="dataset" />
            </template>
          </v-list>
        </v-responsive>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Dataset from '~/components/Dataset.vue'
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
  components: {
    Dataset
  },
  computed: {
    datasets() {
      return this.$store.state.datasets.list
    }
  },
  created() {
    this.$store.dispatch('datasets/load')
  }
}
</script>
