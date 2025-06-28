#!/bin/bash

set -e

rm -f ios-build-preview.ipa

eas build \
  --platform=ios \
  --profile=preview \
  --output=build-ios-preview.ipa \
  --local \
  --non-interactive