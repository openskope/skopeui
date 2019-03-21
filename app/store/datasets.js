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
        id: 'lbda',
        title: 'Living Blended Drought Atlas (LBDA) Version 2',
        description:
          'A recalibrated reconstruction of United States Summer PMDI over the last 2000 years. Updated half degree gridded Jun-Aug PMDI reconstructions from Cook et al. (2010). LBDA data in netCDF format are available from the [NOAA study page](https://www.ncdc.noaa.gov/paleo-search/study/22454).',
        type: 'dataset',
        status: 'Published',
        revised: '2017-08-03',
        region: {
          zoom: 2,
          center: [36.5, -95.75],
          resolution: '.5 degree (~55.5km)',
          name: 'Continental USA',
          style: { color: 'blue', weight: 2 },
          extents: [[49, -124.5], [24, -67]]
        },
        timespan: {
          resolution: 'annually',
          period: {
            gte: '0001',
            lte: '2017',
            suffix: 'CE'
          }
        },
        uncertainty: 'No uncertainty estimates available.',
        methodSummary:
          'The half degree gridded Jun-Aug PMDI reconstructions from Cook et al. (2010) were recalibrated using the Global Historical Climatology Network (GHCN) 5km grid PMDI data. The 5km data were first upscaled to match the original half-degree grid. The recalibration was performed using a kernel density distribution mapping (KDDM) technique outlined in McGinnis et al. (2015) using an R-package provided by Seth McGinnis. The 50-year recalibration period used was 1929–1978 CE. The author’s also adjusted each grid point’s mean PMDI value for the recalibration period to be zero to avoid importing wet or dry bias into the recalibration. The recalibrated data set covers the continental United States just as the GHCN instrumental data does. Since instrumental data was used for 1979–2005 CE in the Cook dataset, recalibration applied only to the years 0–1978 CE. The 1979–2017 instrumental years were filled in using data from NCEI’s GHCN 5km instrumental PMDI data.',
        references:
          'Cook, E.R., Seager, R., Heim, R.R., Vose, R.S., Herweijer, C., and Woodhouse, C. 2010. Megadroughts in North America: Placing IPCC projections of hydroclimatic change in a long-term paleoclimate context. Journal of Quaternary Science, 25(1), 48-61. [doi: 10.1002/jqs.1303](https://doi.org/10.1002/jqs.1303)',
        contactInformation:
          'DOC/NOAA/NESDIS/NCEI\n    National Centers for Environmental Information, NESDIS, NOAA, U.S. Department of Commerce\n    325 Broadway, E/NE31     \nBoulder, CO 80305-3328\n    USA\n\n    https://www.ncdc.noaa.gov/data-access/paleoclimatology-data\n    email: paleo@noaa.gov\n    phone: 303-497-6280\n    fax: 303-497-6513',
        variables: [
          {
            class: 'Precipitation',
            name: 'Palmer Modified Drought Index',
            description:
              'Palmer’s Modified Drought Index: Jun–Aug.; <=-4.00 extreme drought; -3.00 to-3.99 severe drought; -2.00 to -2.99 moderate dought, -1.99 to 1.99 midrange; 2.00 to 2.99 moderately moist; 3.00 to 3.99 very moist; >=4.00 extremely moist.'
          }
        ],
        sourceUrl: 'https://www.ncdc.noaa.gov/paleo-search/study/22454'
      },
      {
        id: 'srtm',
        title: 'SRTM 90m Digital Elevation Model V4.1',
        description:
          'Digital elevation data at 3 arc second (approx. 90m) horizontal resolution and less than 16m vertical resolution. The data are provided by the NASA Shuttle Radar Topographic Mission (SRTM) and the International Centre for Tropical Agriculture (CIAT), and are currently distributed free of charge by USGS and available for download through CGIAR at http://srtm.csi.cgiar.org/.',
        sourceUrl: 'http://srtm.csi.cgiar.org',
        type: 'dataset',
        status: 'Published',
        revised: '2009-06-14',
        region: {
          zoom: 2,
          center: [37.5, -95],
          resolution: '250m',
          name: 'Continental USA',
          style: { color: 'gray', weight: 2 },
          extents: [[50, -125], [25, -65]]
        },
        timespan: {
          resolution: '',
          period: {
            gte: '2009',
            lte: '2009',
            suffix: 'CE'
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
        id: 'paleocar',
        title: 'PaleoCAR: SW USA Paleoclimatic Reconstruction',
        description:
          'High spatial resolution (30 arc-second, ~800 m) Southwestern United States tree-ring reconstructions of ' +
          ' May-Sept growing degree days (GDD), net water-year precipitation (previous Oct–Sept), and the direct precipitation maize ' +
          ' farming niche (>= 1800 growing Season F GDD & >= 300 mm water-year precipitation).',
        sourceUrl: 'https://www.ncdc.noaa.gov/paleo/study/19783',
        type: 'dataset',
        status: 'Published',
        revised: '2016-04-01',

        region: {
          zoom: 4,
          center: [37, -108.5],
          resolution: '800m',
          name: 'Southwestern USA',
          style: { color: 'red', weight: 1 },
          extents: [[43, -115], [31, -102]]
        },

        timespan: {
          resolution: 'annually',
          period: {
            gte: '0001',
            lte: '2000',
            suffix: 'CE'
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
