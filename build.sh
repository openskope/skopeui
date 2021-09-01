#!/usr/bin/env bash

# invoke via `./build.sh (dev|staging|prod)`

set -o errexit
set -o pipefail
set -o nounset

# Adapted from http://lukeswart.net/2016/03/lets-deploy-part-1/

CONFIG_INI_TEMPLATE=./conf/config.ini.template
SECRETS_DIR=./secrets
SECRETS_INI=${SECRETS_DIR}/config.ini
OAUTH_TEMPLATE=./conf/oauth.env.template
OAUTH_ENV=${SECRETS_DIR}/oauth.env
BACKUP_CONFIG_INI=/tmp/skope.${RANDOM}.ini

function clean()
{
  if [[ -f "${SECRETS_INI}" ]]; then
    echo "Existing ${SECRETS_INI} will be overwritten and all existing containerized data will be removed. Continue?"
    select response in "Yes" "No"; do
        case "${response}" in
            Yes) echo "Copying existing config.ini to ${BACKUP_CONFIG_INI} and then overwriting"; clean; break;;
            No) echo "Aborting build."; exit;;
        esac
    done
  fi

  cat "${SECRETS_INI}";
  cp "${SECRETS_INI}" "${BACKUP_CONFIG_INI}";
  echo "Delete all docker data in ./docker/shared/ as you will probably be unable to access it"
}

set -a

# echo "Running mongo env substitution for ${MONGO_INITDB_ROOT_USERNAME} ${MONGO_INITDB_ROOT_PASSWORD}"

function build()
{
  mkdir -p ${SECRETS_DIR}
  cat "${CONFIG_INI_TEMPLATE}" | envsubst > "${SECRETS_INI}"
  cat "${OAUTH_TEMPLATE}" | envsubst > "${OAUTH_ENV}"
}

case "$1" in
  build) build;;
  clean) clean;;
  *) echo "must select either build or clean"; exit 1;;
esac