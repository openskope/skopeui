<template>
  <div class="container">
    <article>
      <h1>This is a title for a given dataset</h1>
      <p>This is a description for a given dataset</p>
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
        dataset => dataset.title === this.title
      )
    }
  }
}
</script>
