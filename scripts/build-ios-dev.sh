#!/bin/bash

set -e

rm -f ios-build-dev.ipa

eas build \
  --platform=ios \
  --output=build-ios-dev.ipa \
  --profile=development \
  --local \
  --non-interactive

#eas submit \
#  --platform=ios \
#  --path=build-ios.ipa \
#  --non-interactive