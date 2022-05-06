# Synthesizing Knowledge of Past Environments

[![DOI](https://zenodo.org/badge/159711888.svg)](https://zenodo.org/badge/latestdoi/159711888)
[![Build/Test Docker Image CI](https://github.com/openskope/skopeui/actions/workflows/docker-ci.yml/badge.svg)](https://github.com/openskope/skopeui/actions/workflows/docker-ci.yml)

This codebase provides a new user interface for the [NSF supported](https://www.openskope.org/skope-nsf-proposal) [Synthesizing Knowledge of Past Environments](https://www.openskope.org/) project.

The UI was developed using [Nuxt](https://nuxtjs.org/), [VueJS](https://vuejs.org/), [Leaflet](https://leafletjs.com/), and [Plotly JS](https://plotly.com/javascript/). 

The application has a simple [Makefile](https://www.gnu.org/software/make/) for configuration and deployment. In order to set up a development environment you'll need to have a recent version of Docker and docker-compose installed.

Running `make` for the first time will generate a `config.mk` file that you can customize by setting the `DEPLOY_ENVIRONMENT` or the remote timeseries API and geoserver API urls. Running `make deploy` will then redeploy the application with those settings in place, listening by default on port 3000.
