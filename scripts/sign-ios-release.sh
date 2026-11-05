#!/usr/bin/env bash
set -euo pipefail
set +x
umask 077
: "${IOS_DISTRIBUTION_P12_BASE64:?Missing distribution identity}" "${IOS_DISTRIBUTION_P12_PASSWORD:?Missing P12 password}" "${IOS_APPSTORE_PROFILE_BASE64:?Missing distribution profile}"
team=7N8G738TDU
bundle=vn.siscom.ductcheckerpro
tmp=$(mktemp -d "$RUNNER_TEMP/duct-sign.XXXXXXXX")
kc="$tmp/sign.keychain-db"
profile_path=''
old_keychains=()
while IFS= read -r line; do
  old_keychains+=("$(printf '%s' "$line" | sed 's/^ *"//;s/"$//')")
done < <(security list-keychains -d user)
cleanup() {
  set +e
  security list-keychains -d user -s "${old_keychains[@]}"
  security delete-keychain "$kc" 2>/dev/null
  if [[ -n "$profile_path" ]]; then rm -f "$profile_path"; fi
  rm -rf "$tmp"
}
trap cleanup EXIT
trap 'exit 1' INT TERM
printf '%s' "$IOS_DISTRIBUTION_P12_BASE64" | base64 -D > "$tmp/identity.p12"
printf '%s' "$IOS_APPSTORE_PROFILE_BASE64" | base64 -D > "$tmp/profile"
security cms -D -i "$tmp/profile" > "$tmp/profile.plist"
uuid=$(python3 scripts/verify-ios-export.py profile "$tmp/profile.plist")
pass=$(openssl rand -hex 32)
security create-keychain -p "$pass" "$kc"
security set-keychain-settings -lut 1800 "$kc"
security unlock-keychain -p "$pass" "$kc"
security import "$tmp/identity.p12" -k "$kc" -P "$IOS_DISTRIBUTION_P12_PASSWORD" -T /usr/bin/codesign >/dev/null
unset IOS_DISTRIBUTION_P12_BASE64 IOS_DISTRIBUTION_P12_PASSWORD IOS_APPSTORE_PROFILE_BASE64
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$pass" "$kc" >/dev/null
security list-keychains -d user -s "$kc" "${old_keychains[@]}"
identity=$(security find-identity -v -p codesigning "$kc" | awk '/"Apple Distribution:/{print $2}')
python3 scripts/verify-ios-export.py identity "$tmp/profile.plist" "$identity"
profiles="$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles"
mkdir -p "$profiles"
[[ ! -e "$profiles/$uuid.mobileprovision" ]]
profile_path="$profiles/$uuid.mobileprovision"
cp "$tmp/profile" "$profile_path"
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -archivePath "$tmp/App.xcarchive" CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM="$team" CODE_SIGN_IDENTITY="$identity" PROVISIONING_PROFILE_SPECIFIER="$uuid" archive
python3 scripts/verify-ios-export.py options "$tmp/options.plist" "$uuid" "$identity"
xcodebuild -exportArchive -archivePath "$tmp/App.xcarchive" -exportPath "$tmp/export" -exportOptionsPlist "$tmp/options.plist"
ipas=("$tmp/export/"*.ipa)
[[ ${#ipas[@]} == 1 && -f "${ipas[0]}" ]]
ditto -x -k "${ipas[0]}" "$tmp/unpacked"
apps=("$tmp/unpacked/Payload/"*.app)
[[ ${#apps[@]} == 1 ]]
app="${apps[0]}"
codesign --verify --deep --strict "$app"
codesign -d --extract-certificates="$tmp/signer" "$app"
codesign -d --entitlements :- "$app" > "$tmp/entitlements.plist"
security cms -D -i "$app/embedded.mobileprovision" > "$tmp/embedded.plist"
[[ "$(python3 scripts/verify-ios-export.py profile "$tmp/embedded.plist")" == "$uuid" ]]
python3 scripts/verify-ios-export.py exported "$app/Info.plist" "$tmp/entitlements.plist" "$tmp/signer0" "$identity" "$tmp/embedded.plist"
mkdir -p artifacts/signed
cp "${ipas[0]}" artifacts/signed/DuctCheckerPro-5.2.0.ipa
