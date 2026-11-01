#!/usr/bin/env bash
set -euo pipefail
mkdir -p artifacts/ios
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -archivePath "$PWD/artifacts/ios/DuctCheckerPro.xcarchive" CODE_SIGNING_ALLOWED=NO archive
(cd artifacts/ios && ditto -c -k --sequesterRsrc --keepParent DuctCheckerPro.xcarchive DuctCheckerPro-5.3.0-unsigned.xcarchive.zip)
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -destination 'generic/platform=iOS Simulator' -derivedDataPath "$PWD/artifacts/ios/DerivedData" CODE_SIGNING_ALLOWED=NO build
ditto -c -k --sequesterRsrc --keepParent artifacts/ios/DerivedData/Build/Products/Debug-iphonesimulator/App.app artifacts/ios/DuctCheckerPro-5.3.0-simulator.app.zip
# This archive is unsigned. Signing/export is done in Xcode Organizer with the owner's team.
