<template>
  <!-- display info and error messages -->
  <div>
    <v-alert
      v-for="(alert, index) in messages"
      :key="index"
      prominent
      :type="alert.type"
    >
      <v-row align="center">
        <v-col class="grow">
          {{ alert.message }}
        </v-col>
        <v-col class="shrink">
          <v-btn icon class="float-right" @click="dismiss(index)"
            ><v-icon>fas fa-times-circle</v-icon></v-btn
          >
        </v-col>
      </v-row>
    </v-alert>
  </div>
  <!-- end footer -->
</template>

<script>
import { Component } from 'nuxt-property-decorator';
import Vue from 'vue';

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
