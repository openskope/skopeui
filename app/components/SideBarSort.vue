<template>
  <div>
    <ul
      v-for="variable in variables"
      :key="variable">
      <v-checkbox
        v-model="variable.checked"
        value="variable.name"
        :label="variable.name"
      />
    </ul>
  </div>
</template>
<script>
export default {
  name: 'SideBarSort',
  data() {
    return {
      variables: [
        { name: 'variable1', checked: false },
        { name: 'variable2', checked: false },
        { name: 'variable3', checked: false }
      ]
    }
  }
}
</script>
<style scoped>
</style>
