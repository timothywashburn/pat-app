#!/bin/bash

set -e

rm -f ios-build-dev.ipa

eas build \
  --platform=ios \
  --profile=development \
#  --output=build-ios-dev.ipa \
#  --local \
#  --non-interactive

#eas submit \
#  --platform=ios \
#  --path=build-ios.ipa \
#  --non-interactive