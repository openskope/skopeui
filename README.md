# Synthesizing Knowledge of Past Environments

[![Build Status](https://travis-ci.com/openskope/skopeui.svg?branch=main)](https://travis-ci.com/openskope/skopeui)

This codebase provides a new user interface for the [NSF supported](https://www.openskope.org/skope-nsf-proposal) [Synthesizing Knowledge of Past Environments](https://www.openskope.org/) project.

The UI was developed using [Nuxt](https://nuxtjs.org/), [VueJS](https://vuejs.org/), [Leaflet](https://leafletjs.com/), and [Plotly JS](https://plotly.com/javascript/). 

You can build in development mode with remote timeseries api and geoserserver urls using

```bash
./config dev
make
```

If you want to develop the app with local timeseries api and geoserver urls you can do

```bash
./config dev local
make
```

In staging or production you can use

```bash
./config prod
make
```

To deploy the application just run

```bash
make deploy
```
