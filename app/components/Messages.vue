<template>
  <v-row>
    <v-col>
      <v-alert
        v-for="(alert, index) in messages"
        :key="index"
        prominent
        :type="alert.type"
        color="warning"
      >
        {{ alert.message }}
        <v-btn icon class="float-right" @click="dismiss(index)"
          ><v-icon>fas fa-times-circle</v-icon></v-btn
        >
      </v-alert>
    </v-col>
  </v-row>
</template>

<script>
import { Component } from "nuxt-property-decorator";
import Vue from "vue";

@Component()
class Messages extends Vue {
  // --------- GETTERS ---------

  get messages() {
    return this.$api().messages.messages;
  }

  // --------- METHODS ---------

  dismiss(index) {
    this.$api().messages.dismiss(index);
  }
}

export default Messages;
</script>
