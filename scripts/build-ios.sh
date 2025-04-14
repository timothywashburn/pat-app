#!/bin/bash

set -e

rm -f ios-build.ipa

eas build \
  --platform=ios \
  --output=build-ios.ipa \
  --local \
  --non-interactive

eas submit \
  --platform=ios \
  --path=build-ios.ipa \
  --non-interactive