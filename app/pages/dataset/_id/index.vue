<template>
  <div class="container">
    <article>
      <h1>{{ dataset.title }}</h1>
      <p>Description: {{ dataset.description }}</p>
      <p>Status: {{ dataset.status }}</p>
      <p>Revised: {{ dataset.revised }}</p>
    </article>
  </div>
</template>

<script>
export default {
  computed: {
    dataset() {
      // accesses store, navigates to state, goes to datasets module, get all datasets
      // that live in "all" property
      const id = this.$route.params.id
      return this.$store.state.datasets.list.find(dataset => dataset.id === id)
    }
  },
  created() {
    this.$store.dispatch('datasets/load')
  },
  validate({ params }) {
    return /^\w+$/.test(params.id)
  }
}
</script>
