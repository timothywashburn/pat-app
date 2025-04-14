#!/bin/bash

set -e

rm -f build-android.aab

eas build \
  --platform=android \
  --output=build-android.aab \
  --local \
  --non-interactive

eas submit \
  --platform=android \
  --path=build-android.aab \
  --non-interactive