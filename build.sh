#!/usr/bin/env bash

# invoke via `DEPLOY=prod ./build.sh`

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

DEPLOY=${DEPLOY:-"dev"} # allowed values: (dev | staging | prod)
CONFIG_INI_TEMPLATE=./conf/config.ini.template
SECRETS_DIR=./secrets
SECRETS_INI=${SECRETS_DIR}/config.ini
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
DJANGO_SECRET_KEY=$(head /dev/urandom | base64 | head -c60)

echo "Running env substitution for DB_PASSWORD ${DB_PASSWORD} and DJANGO_SECRET_KEY ${DJANGO_SECRET_KEY}"

mkdir -p ${SECRETS_DIR}
echo ${DB_PASSWORD} > ${SECRETS_DIR}/postgres-passwd
cat "${CONFIG_INI_TEMPLATE}" | envsubst > "${SECRETS_INI}"
./compose ${DEPLOY}

docker-compose build --pull --force-rm --no-cache
