<template>
  <div>
    This is a test.
    <h1>Dataset: {{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    title: String,
    description: String,
    variables: Array,
    id: String,
    url: String,
    lowerBound: Object,
    upperBound: Object
  }
})
export default class Dataset extends Vue {}
</script>
