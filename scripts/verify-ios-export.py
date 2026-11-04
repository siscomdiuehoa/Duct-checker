"""Check public signing metadata without logging credential contents."""
import datetime
import hashlib
import plistlib
import sys
import uuid
from pathlib import Path

TEAM = "7N8G738TDU"
BUNDLE = "vn.siscom.ductcheckerpro"


def read(path):
    return plistlib.loads(Path(path).read_bytes())


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def app_identifier(profile):
    return profile["ApplicationIdentifierPrefix"][0] + "." + BUNDLE


def verify_profile(profile):
    ent = profile["Entitlements"]
    require(TEAM in profile["TeamIdentifier"] and ent["com.apple.developer.team-identifier"] == TEAM, "Wrong profile team")
    require(ent["application-identifier"] == app_identifier(profile), "Wrong profile app ID")
    require(profile["ExpirationDate"] > datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None), "Expired profile")
    require(not ent.get("get-task-allow") and ent.get("beta-reports-active") and "ProvisionedDevices" not in profile and not profile.get("ProvisionsAllDevices"), "App Store distribution profile required")
    uuid.UUID(profile["UUID"])


def verify_identity(profile, identity):
    hashes = {hashlib.sha1(cert).hexdigest().upper() for cert in profile["DeveloperCertificates"]}
    require(identity.upper() in hashes, "Profile does not authorize imported Apple Distribution identity")


def main(mode, args):
    if mode == "profile":
        profile = read(args[0])
        verify_profile(profile)
        print(profile["UUID"])
    elif mode == "identity":
        verify_identity(read(args[0]), args[1])
    elif mode == "options":
        path, profile, identity = args
        options = dict(method="app-store-connect", destination="export", signingStyle="manual", signingCertificate=identity, teamID=TEAM, provisioningProfiles={BUNDLE: profile}, manageAppVersionAndBuildNumber=False)
        Path(path).write_bytes(plistlib.dumps(options))
    elif mode == "exported":
        info, ent = map(read, args[:2])
        identity, profile = args[3], read(args[4])
        verify_profile(profile)
        verify_identity(profile, identity)
        require(hashlib.sha1(Path(args[2]).read_bytes()).hexdigest().upper() == identity.upper(), "Exported signer mismatch")
        require((info["CFBundleIdentifier"], info["CFBundleShortVersionString"], info["CFBundleVersion"]) == (BUNDLE, "5.2.0", "50300"), "IPA version or ID mismatch")
        require(ent["application-identifier"] == app_identifier(profile) and ent["com.apple.developer.team-identifier"] == TEAM and not ent.get("get-task-allow"), "Invalid distribution entitlements")
    else:
        raise SystemExit("Unknown verification mode")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
