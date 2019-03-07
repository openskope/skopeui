#!/bin/bash

CLEAN_DATABASE=${CLEAN_DATABASE:-"false"}
DJANGO_SETTINGS_MODULE="skope.settings.dev"

chmod a+x /code/docker/run/*.sh

initdb() {
    if [ "$CLEAN_DATABASE" = "true" ]; then
        echo "Destroying and initializing database from scratch"
        /code/docker/run/wait-for-it.sh db:5432 -- /usr/local/bin/invoke -r /code initdb --clean
    else
        echo "Using existing db schema"
        /code/docker/run/wait-for-it.sh db:5432 -- /usr/local/bin/invoke -r /code initdb
    fi
}
initdb
exec /code/manage.py runserver 0.0.0.0:8000
