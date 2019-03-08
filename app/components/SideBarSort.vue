<template>
  <div class="container">
    <v-list
      dense
      :class="{fix: fix, closer: closer}"
      v-for="variable in variables"
      :key="variable">
      <v-checkbox
        v-model="variable.checked"
        value="variable.name"
        :label="variable.name"
      />
    </v-list>
    <!-- spacing between sorting methods -->
    <v-spacer />
    <v-divider />
    <v-spacer />
    <!-- end spacing between sorting methods -->
    <v-radio-group v-model="radioSelect">
      <v-radio
        v-for="i in 5"
        :key="i"
        :label="`Radio ${ i } `"
        :value="i"
      />
    </v-radio-group>
    <!-- spacing between sorting methods -->
    <v-spacer />
    <v-divider />
    <v-spacer />
    <!-- end spacing between sorting methods -->
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
      ],
      radioSelect: 1
    }
  }
}
</script>
<style scoped>
</style>
