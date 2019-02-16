<template>
  <v-layout class="pb-3" row justify-around>
    <v-flex xs3>
      <div class="pl-3">
        This is a placeholder for the map
      </div>
    </v-flex>
    <v-flex xs9>
      <div class="pr-3">
        <h2>
          <nuxt-link class="pink accent-1" :to="url">
            {{ title }}
          </nuxt-link>
        </h2>
        <p class="font-weight-light">
          {{ region.name }} at {{ region.resolution }}
          |
          {{ timespan.name }}
        </p>
        <vue-markdown>{{ description }}</vue-markdown>
        <div v-if="variables.length > 0">
          <h3>Variables</h3>
          <ul>
            <li v-for="variable in variables" :key="variable.name">
              {{ variable.name }}
            </li>
          </ul>
        </div>
        <div v-else>
          <v-alert :value="true" type="info">
            No variables defined
          </v-alert>
        </div>
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
