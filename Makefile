include config.mk

.DEFAULT_GOAL := build

app/store/modules/_constants.js: app/store/modules/_constants.js.template config.mk
	envsubst < app/store/modules/_constants.js.template > app/store/modules/_constants.js

.PHONY: build | secrets
build: app/store/modules/_constants.js
	docker-compose build --pull

.PHONY: deploy
deploy: build
	docker-compose up -d

.PHONY: clean-secrets
	./secrets clean

secrets:
	echo building secrets...
	./secrets build