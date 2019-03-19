// state function returns objet
export const state = () => ({
  // datasets array
  list: [],
  loading: false
})

export const actions = {
  load(context) {
    if (context.state.loading) {
      console.debug('already loading - ignoring request')
    } else {
      context.commit('load')
    }
  }
}

export const mutations = {
  load(state) {
    state.loading = true
    state.list = [
      {
        title: 'Living Blended Drought Atlas (LBDA) Version 2',
        description:
          'A recalibrated reconstruction of United States Summer PMDI over the last 2000 years. Updated half degree gridded Jun-Aug PMDI reconstructions from Cook et al. (2010).',
        type: 'dataset',
        status: 'Published',
        revised: '2017-08-03',
        region: {
          zoom: 2,
          center: [36.5, -95.75],
          resolution: '.5 degree',
          name: 'Continental U.S. at .5 degree',
          style: { color: 'blue', weight: 2 },
          extents: [[49, -124.5], [24, -67]]
        },
        timespan: {
          name: '1-2017CE annually',
          resolution: 'year',
          period: {
            gte: '0001',
            lte: '2017'
          }
        },
        variables: [
          {
            class: 'Precipitation',
            name: 'Palmer Modified Drought Index'
          }
        ],
        absolute_url: '/datasets/lbda'
      },
      {
        title: 'SRTM',
        description:
          'Digital elevation data at 3 arc second (approx. 90m) horizontal resolution and less than 16m vertical resolution. The data are provided by the NASA Shuttle Radar Topographic Mission (SRTM) and the International Centre for Tropical Agriculture (CIAT), and are currently distributed free of charge by USGS and available for download through CGIAR at http://srtm.csi.cgiar.org/.',
        absolute_url: '/datasets/srtm',
        type: 'dataset',
        status: 'Published',
        revised: '2009-06-14',
        region: {
          zoom: 2,
          center: [37.5, -95],
          resolution: '250m',
          name: 'Continental US at 250m',
          style: { color: 'gray', weight: 2 },
          extents: [[50, -125], [25, -65]]
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
        description:
          'High spatial resolution (30 arc-second, ~800 m) Southwestern United States tree-ring reconstructions of ' +
          ' May-Sept growing degree days (GDD), net water-year precipitation (previous Oct–Sept), and the direct precipitation maize ' +
          ' farming niche (>= 1800 growing Season F GDD & >= 300 mm water-year precipitation).',
        absolute_url: '/datasets/paleocar',
        type: 'dataset',
        status: 'Published',
        revised: '2016-04-01',

        region: {
          zoom: 4,
          center: [37, -108.5],
          resolution: '800m',
          name: 'Southwestern USA at 800m',
          style: { color: 'red', weight: 1 },
          extents: [[43, -115], [31, -102]]
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
    state.loading = false
  }
}
/*
export const getters = {
  datasets: state => {
    return state.all
  }
}
*/
