include config.mk

.DEFAULT_GOAL := build
LOG_DATA_PATH=docker/logs
# FIXME: mail api currently unused until we need email from the app
MAIL_API_KEY_PATH=secrets/mail_api_key
BUILD_CONSTANTS_PATH=app/store/modules/_constants.js
BUILD_ID=$(shell git describe --tags --abbrev=1)

.PHONY: $(BUILD_CONSTANTS_PATH)
$(BUILD_CONSTANTS_PATH): app/store/modules/_constants.js.template config.mk
	envsubst < app/store/modules/_constants.js.template > app/store/modules/_constants.js
	@echo 'export const BUILD_ID = "${BUILD_ID}";' >> $(BUILD_CONSTANTS_PATH)

.PHONY: build | secrets
build: docker-compose.yml app/store/modules/_constants.js
	docker-compose build --pull

.PHONY: secrets
secrets: $(SECRETS)
	mkdir -p secrets

.PHONY: clean
clean:
	rm -rf secrets
	rm config.mk $(BUILD_CONSTANTS_PATH)

config.mk:
	@echo 'WARNING: no config.mk found, using default template dev environment'
	SKOPE_DEPLOY_ENVIRONMENT=dev envsubst < config.mk.template > config.mk

$(LOG_DATA_PATH):
	mkdir -p $(LOG_DATA_PATH)

$(MAIL_API_KEY_PATH): | secrets
	touch "$(MAIL_API_KEY_PATH)"

DEPLOY_ENVIRONMENT ?= dev
docker-compose.yml: base.yml config.mk $(DEPLOY_ENVIRONMENT).yml $(LOG_DATA_PATH) $(BUILD_CONSTANTS_PATH)
	@echo "DEPLOY_ENVIRONMENT: $(DEPLOY_ENVIRONMENT)"
	docker-compose -f base.yml -f $(DEPLOY_ENVIRONMENT).yml config > docker-compose.yml

.PHONY: buildprod
buildprod: build
	docker-compose run --rm web yarn build

.PHONY: lint
lint: build
	docker-compose run --rm web yarn lintfix

.PHONY: deploy
deploy: build
	docker-compose up -d 
