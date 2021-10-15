<template>
  <v-list dense class="pa-0 ma-0">
    <v-subheader class="text-h6 ma-0 pa-0">Variables</v-subheader>
    <v-list-item v-for="(variable, index) in variables" :key="index">
      <v-list-item-icon>
        <v-chip small label dark color="primary">
          {{ variable.class }}
        </v-chip>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>
          {{ variable.name }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import Vue from "vue";
import { Component, Prop } from "nuxt-property-decorator";

@Component({
  name: "VariableList",
})
class VariableList extends Vue {
  @Prop()
  variables;
}

export default VariableList;
</script>
