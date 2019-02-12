<template>
  <v-layout row justify-space-around align-center>
    <v-flex xs3>
      <div class="item">
        This is a placeholder for the map
      </div>
    </v-flex>
    <v-flex xs9>
      <div class="item">
        <h3>
          <a class="pink accent-1" :href="url">
            {{ title }}
          </a>
        </h3>
        <vue-markdown>{{ description }}</vue-markdown>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'
import VueMarkdown from 'vue-markdown'

@Component({
  props: {
    title: String,
    status: String,
    revised: Date,
    region: Object,
    timespan: Object,
    description: String,
    variables: Array,
    id: String,
    url: String,
    lowerBound: Object,
    upperBound: Object
  },
  components: { VueMarkdown }
})
export default class Dataset extends Vue {}
</script>
