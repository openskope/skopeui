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
      return this.$store.state.datasets.all.find(
        dataset => dataset.id === this.id
      )
    }
  }
}
</script>
