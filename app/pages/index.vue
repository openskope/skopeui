<template>
  <v-layout
    column
    justify-center
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <v-card>
        <v-responsive :aspect-ratio="16/9">
          <v-card-title>
            <v-icon left>
              sd_card
            </v-icon>
            <span class="title">
              Datasets
            </span>
          </v-card-title>
          <v-list>
            <template
              v-for="dataset in datasets"
              router
              exact
            >
              <dataset :key="dataset.id" v-bind="dataset" />
            </template>
          </v-list>
        </v-responsive>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Dataset from '~/components/Dataset.vue'
/*
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'

export default {
  components: {
    Logo,
    VuetifyLogo
  }
}
*/
export default {
  components: {
    Dataset
  },
  data() {
    return {
      datasets: [
        {
          title: 'Living Blended Drought Atlas (LBDA) Version 2',
          description:
            'A recalibrated reconstruction of United States Summer PMDI over the last 2000 years. Updated half degree gridded Jun-Aug PMDI reconstructions from Cook et al. (2010).',
          type: 'dataset',
          status: 'Published',
          revised: '2017-08-03',
          region: {
            resolution: '.5 degree',
            name: 'Continental U.S. at .5 degree',
            extents: [-124.5, 24, -67, 49]
          },
          timespan: {
            name: '1-2017CE annually',
            resolution: 'year',
            period: {
              gte: '0001',
              lte: '2017'
            }
          },
          variables: [],
          url: '/datasets/lbda'
        },
        {
          title: 'SRTM',
          description:
            'Digital elevation data at 3 arc second (approx. 90m) horizontal resolution and less than 16m vertical resolution. The data are provided by the NASA Shuttle Radar Topographic Mission (SRTM) and the International Centre for Tropical Agriculture (CIAT), and are currently distributed free of charge by USGS and available for download through CGIAR at http://srtm.csi.cgiar.org/.',
          url: '/datasets/srtm',
          type: 'dataset',
          status: 'Published',
          revised: '2009-06-14',

          region: {
            resolution: '250m',
            name: 'Continental US at 250m',
            extents: [-125, 25, -65, 50]
          },

          timespan: {
            name: 'version 4.1',
            resolution: 'year',
            period: {
              gte: '2009',
              lte: '2009'
            }
          },

          variables: [
            {
              class: 'Elevation',
              name: 'Elevation (m)'
            }
          ]
        },
        {
          title: 'PaleoCAR',
          id: '1',
          description:
            'High spatial resolution (30 arc-second, ~800 m) Southwestern United States tree-ring reconstructions of ' +
            ' May-Sept growing degree days (GDD), net water-year precipitation (previous Oct–Sept), and the direct precipitation maize ' +
            ' farming niche (>= 1800 growing Season F GDD & >= 300 mm water-year precipitation).',
          url: '/datasets/paleocar',
          type: 'dataset',
          status: 'Published',
          revised: '2016-04-01',

          region: {
            resolution: '800m',
            name: 'Southwestern USA at 800m',
            extents: [-115, 31, -102, 43]
          },

          timespan: {
            name: '1-2000CE annually',
            resolution: 'year',
            period: {
              gte: '0001',
              lte: '2000'
            }
          },

          variables: [
            {
              class: 'Temperature',
              name: 'Growing Degree Days (F, May-Sept)'
            },
            {
              class: 'Precipitation',
              name: 'Water-year (Oct-Sept) Precipitation (mm)'
            },
            {
              class: 'Crop Niche',
              name: 'Maize Farming Niche (Direct Precip.)'
            }
          ]
        }
      ]
    }
  }
}
</script>
