#!/bin/bash
set -

npm run migrate up

exec "$@"