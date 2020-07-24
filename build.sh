#!/usr/bin/env bash

# invoke via `./build.sh (dev|staging|prod)`

set -o errexit
set -o pipefail
set -o nounset

# Adapted from http://lukeswart.net/2016/03/lets-deploy-part-1/

function clean()
{
    cat "${SECRETS_INI}"; 
    cp "${SECRETS_INI}" "${BACKUP_CONFIG_INI}";
    echo "Delete all docker data in ./docker/shared/ as you will probably be unable to access it"
}

DEPLOY=${1:-"dev"} # allowed values: (dev | staging | prod)
CONFIG_INI_TEMPLATE=./conf/config.ini.template
SECRETS_DIR=./secrets
SECRETS_INI=${SECRETS_DIR}/config.ini
# MONGO_TEMPLATE=./conf/mongo.env.template
# MONGO_ENV=${SECRETS_DIR}/mongo.env
OAUTH_TEMPLATE=./conf/oauth.env.template
OAUTH_ENV=${SECRETS_DIR}/oauth.env
BACKUP_CONFIG_INI=/tmp/skope.${RANDOM}.ini

set -a

if [[ -f "${SECRETS_INI}" ]]; then
    echo "Existing ${SECRETS_INI} will be overwritten and all existing containerized data will be removed. Continue?"
    select response in "Yes" "No"; do
        case "${response}" in
            Yes) echo "Copying existing config.ini to ${BACKUP_CONFIG_INI} and then overwriting"; clean; break;;
            No) echo "Aborting build."; exit;;
        esac
    done
fi
DB_PASSWORD=$(head /dev/urandom | tr -dc '[:alnum:]' | head -c60)
SECRET_KEY=$(head /dev/urandom | base64 | head -c60)
# MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME:-"root"}
# MONGO_INITDB_ROOT_PASSWORD=$(head /dev/urandom | tr -dc '[:alnum:]' | head -c60)

# echo "Running mongo env substitution for ${MONGO_INITDB_ROOT_USERNAME} ${MONGO_INITDB_ROOT_PASSWORD}"

mkdir -p ${SECRETS_DIR}
# echo ${DB_PASSWORD} > ${SECRETS_DIR}/postgres-passwd
cat "${CONFIG_INI_TEMPLATE}" | envsubst > "${SECRETS_INI}"
# cat "${MONGO_TEMPLATE}" | envsubst > "${MONGO_ENV}"
cat "${OAUTH_TEMPLATE}" | envsubst > "${OAUTH_ENV}"
./compose ${DEPLOY}

docker-compose build --pull web
