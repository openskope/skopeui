<template>
  <v-app light>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-toolbar flat class="transparent">
        <v-list>
          <v-list-tile-content>
            <v-layout row>
              <v-flex shrink style="width: 45px">
                <v-text-field
                  v-model="value3[0]"
                  hide-details
                  type="number"
                />
              </v-flex>

              <v-flex style="width: 175px">
                <v-range-slider
                  v-model="value3[0]"
                  :max="600"
                  :min="20"
                  :step="1"
                />
              </v-flex>

              <v-flex shrink style="width: 45px">
                <v-text-field
                  v-model="value3[1]"
                  hide-details
                  type="number"
                />
              </v-flex>
            </v-layout>
          </v-list-tile-content>

          <v-divider />

          <v-list-tile-content>
            <v-list-tile-title>Variables</v-list-tile-title>
          </v-list-tile-content>

          <v-list-tile avatar @click="toggle('variable1')">
            <v-list-tile-action>
              <v-checkbox
                v-model="checkedVariables['variable1']"
                :label="`Variable 1`"
              />
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile avatar @click="toggle('variable2')">
            <v-list-tile-action>
              <v-checkbox
                v-model="checkedVariables['variable2']"
                :label="`Variable 2`"
              />
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile avatar @click="toggle('variable3')">
            <v-list-tile-action>
              <v-checkbox
                v-model="checkedVariables['variable3']"
                :label="`Variable 3`"
              />
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile avatar @click="toggle('variable4')">
            <v-list-tile-action>
              <v-checkbox
                v-model="checkedVariables['variable4']"
                :label="`Variable 4`"
              />
            </v-list-tile-action>
          </v-list-tile>

          <v-divider />

          <v-list-tile-content>
            <v-list-tile-title>Radio Selections</v-list-tile-title>
          </v-list-tile-content>

          <v-radio-group v-model="radioGroup">
            <v-radio
              v-for="n in 4"
              :key="n"
              :label="`Radio ${n}`"
              :value="n"
            />
          </v-radio-group>
        </v-list>
      </v-toolbar>
    </v-navigation-drawer>
    <v-toolbar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-toolbar-side-icon @click="drawer = !drawer" />
      <v-toolbar-title>SKOPE</v-toolbar-title>
      <v-spacer />
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn flat to="/">
          Datasets
        </v-btn>
        <v-btn flat to="/inspire">
          Interactive Map
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>
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
        <div>&copy; 2016 - {{ new Date().getFullYear() }}</div>
      </v-card-text>
    </v-card>
  </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      navDrawItems: [
        {
          icon: 'apps',
          title: 'Datasets',
          to: '/'
        },
        {
          icon: 'my_location',
          title: 'Map',
          to: '/inspire'
        }
      ],
      icons: ['fab fa-github', 'fab fa-twitter'],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'SKOPE',
      value3: [1, 440],
      checkedVariables: ['variable1', 'variable2', 'variable3', 'variable4'],
      radioGroup: 1
    }
  },

  methods: {
    toggle: function(name) {
      this.checkVariables[name] = !this.checkedVariables[name]
    }
  }
}
</script>
