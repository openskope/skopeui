<template>
  <v-footer
    light
    height="auto"
    app
    absolute
  >
    <v-card flat tile class="flex indigo lighten-1 white--text text-xs-center">
      <v-card-text>
        <v-btn v-for="icon in icons" :key="icon" class="mx-3 white--text" icon>
          <v-icon size="24px">
            {{ icon }}
          </v-icon>
        </v-btn>
      </v-card-text>
      <v-divider />
      <v-card-text class="white--text">
        <div>&copy; 2016 - {{ year }}</div>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      year: new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
</style>
