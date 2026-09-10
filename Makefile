ENVIRONMENT ?= dev
COMPOSE_PROJECT_NAME ?= skope-ui

API_URL_dev := http://localhost:8001
API_URL_staging := https://staging-api.openskope.org
API_URL_prod := https://api.openskope.org
SKOPE_API_HOST_URL ?= $(API_URL_$(ENVIRONMENT))

COMPOSE = docker compose --project-name $(COMPOSE_PROJECT_NAME) \
	--project-directory . \
	-f base.yml \
	-f $(ENVIRONMENT).yml
TEST_COMPOSE = docker compose --project-name $(COMPOSE_PROJECT_NAME)-test \
	--project-directory . \
	-f base.yml \
	-f dev.yml

BUILD_CONSTANTS_PATH := app/store/modules/_constants.js
BUILD_ID := $(shell git describe --tags --always --dirty)
CITATION_TXT_FILE := _citation.txt
CITATION_BIB_FILE := _citation.bib

.DEFAULT_GOAL := help

.PHONY: help check-environment citations constants config build buildprod deploy \
	deploy-dev deploy-staging deploy-production down restart logs ps lint format \
	test clean

help: ##- Show available targets
	@echo "usage: make [target] [ENVIRONMENT=dev|staging|prod]"
	@echo "targets:"
	@sed -e '/#\{2\}-/!d; s/\\$$//; s/:[^#\t]*/:/; s/#\{2\}- *//' $(MAKEFILE_LIST)

check-environment:
	@case "$(ENVIRONMENT)" in \
	  dev|staging|prod) ;; \
	  *) echo "ENVIRONMENT must be dev, staging, or prod (got '$(ENVIRONMENT)')" 1>&2; exit 2;; \
	esac
	@test -n "$(SKOPE_API_HOST_URL)" || { echo "No API URL configured for $(ENVIRONMENT)" 1>&2; exit 2; }

$(CITATION_TXT_FILE) $(CITATION_BIB_FILE) &: CITATION.cff
	docker run --rm -v $(PWD):/app citationcff/cffconvert -f apalike -o $(CITATION_TXT_FILE)
	docker run --rm -v $(PWD):/app citationcff/cffconvert -f bibtex -o $(CITATION_BIB_FILE)

citations: $(CITATION_TXT_FILE) $(CITATION_BIB_FILE) ##- Generate citation text used by the application

constants: check-environment citations ##- Generate client constants for ENVIRONMENT
	@{ \
		printf 'export const CITATION_TXT = `'; \
		sed 's/\\/\\\\/g; s/`/\\`/g' $(CITATION_TXT_FILE); \
		printf '`;\nexport const CITATION_BIB = `'; \
		sed 's/\\/\\\\/g; s/`/\\`/g' $(CITATION_BIB_FILE); \
		printf '`;\nexport const API_HOST_URL = "%s";\n' "$(SKOPE_API_HOST_URL)"; \
		printf 'export const BUILD_ID = "%s";\n' "$(BUILD_ID)"; \
	} > $(BUILD_CONSTANTS_PATH)
	@echo "Configured $(ENVIRONMENT) API: $(SKOPE_API_HOST_URL)"

config: constants ##- Render and validate the selected Compose configuration
	@$(COMPOSE) config

build: constants ##- Build the selected environment's image
	@$(COMPOSE) config --quiet
	$(COMPOSE) build --pull

# Backwards-compatible alias used by existing CI and deployment notes.
buildprod: override ENVIRONMENT=prod
buildprod: build

deploy: build ##- Deploy ENVIRONMENT (defaults to dev) and wait for a healthy service
	$(COMPOSE) up -d --remove-orphans --wait --wait-timeout 120

deploy-dev: override ENVIRONMENT=dev
deploy-dev: deploy ##- Build and deploy the local development environment

deploy-staging: override ENVIRONMENT=staging
deploy-staging: deploy ##- Build and deploy staging against staging-api.openskope.org

deploy-production: override ENVIRONMENT=prod
deploy-production: deploy ##- Build and deploy production against api.openskope.org

down: check-environment ##- Stop and remove the selected environment's containers
	$(COMPOSE) down

restart: check-environment ##- Restart the selected environment's services
	$(COMPOSE) restart

logs: check-environment ##- Follow logs for the selected environment
	$(COMPOSE) logs --follow --tail=200

ps: check-environment ##- Show service status for the selected environment
	$(COMPOSE) ps

lint: override ENVIRONMENT=dev
lint: build ##- Run ESLint with automatic fixes
	$(COMPOSE) run --rm web npm run lintfix

format: override ENVIRONMENT=dev
format: build ##- Format source files and run ESLint fixes
	$(COMPOSE) run --rm -v $(PWD):/repo web npm run format

test: override ENVIRONMENT=dev
test: constants ##- Build an isolated development image and run the test suite
	@$(TEST_COMPOSE) config --quiet
	$(TEST_COMPOSE) build web
	@trap '$(TEST_COMPOSE) down --remove-orphans' EXIT INT TERM; \
		$(TEST_COMPOSE) run --rm web npm run test

clean: ##- Remove generated local build inputs
	rm -f $(BUILD_CONSTANTS_PATH) $(CITATION_TXT_FILE) $(CITATION_BIB_FILE)
