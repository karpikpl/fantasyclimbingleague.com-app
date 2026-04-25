# fantasyclimbingleague.com-app

iPhone (React Native) app for [fantasyclimbingleague.com](https://fantasyclimbingleague.com).

This is a **native iOS app** with a WebView core, giving you native platform features (Face ID, push notifications) while serving the full website. It uses GitHub Actions with macOS runners so you can build and publish **without a Mac**.

---

## Native Features

| Feature | Status | Details |
|---------|--------|---------|
| **Face ID / Touch ID** | ✅ | Biometric authentication gate on every app launch |
| **Push Notifications** | ✅ | APNs registration, foreground/background delivery |
| **Swipe navigation** | ✅ | Back/forward gestures (iOS native feel) |
| **Safe area** | ✅ | Respects notch and home indicator |
| **Cookie persistence** | ✅ | Stays logged in between sessions |
| **Inline video** | ✅ | Plays video content without fullscreen |

### Face ID / Touch ID
On launch the app presents a biometric authentication prompt (Face ID on Face ID devices, Touch ID on older iPhones). If the device has no biometrics the user goes straight to the app. If the user cancels they see a lock screen with an "Unlock" button to retry.

### Push Notifications
The app requests notification permission after the first successful authentication. The APNs device token is logged to the console — wire it up to your notification server (Firebase, OneSignal, etc.) to send notifications like "New competition added!" or "Your score has been updated!".

---

## Prerequisites

- **Node.js** 22+
- **Ruby** 3.3+ (for Fastlane)
- **Xcode** 16+ (only on macOS / CI runner)
- **Apple Developer account** (for App Store publishing)

---

## Local Development

```bash
# Install JS dependencies
npm install

# Run tests
npm test

# Lint
npm run lint
```

> **Note:** Building and running on a real iOS device or simulator requires macOS with Xcode.

---

## App Store Publishing (No Mac Required)

Publishing is fully automated via **GitHub Actions** + **Fastlane**. The macOS runner in GitHub Actions takes care of all macOS/Xcode operations.

### Step-by-step Guide

#### Step 1 — Apple Developer Account
1. Enroll at [developer.apple.com](https://developer.apple.com) ($99/year)
2. Open [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Fantasy Climbing  *(the user-facing display name — `CFBundleDisplayName` in Info.plist)*
   - **Primary Language**: English
   - **Bundle ID**: `com.fantasyclimbingleague.app`
   - **SKU**: any unique string (e.g. `fantasy-climbing-001`)
4. Note your **Apple App ID** (numeric, shown in the URL)

#### Step 2 — App Store Connect API Key
1. Go to **App Store Connect → Users and Access → Integrations → API Keys**
2. Click **+** → set name "CI" → role **App Manager**
3. Download the `.p8` file (you can only download it **once**)
4. Note the **Key ID** and **Issuer ID** shown on the page

#### Step 3 — Fastlane Match (Code Signing)
[Match](https://docs.fastlane.tools/actions/match/) stores certificates in a private Git repo so any machine (including CI) can sign your app.

```bash
# 1. Create a PRIVATE GitHub repo for certificates, e.g. github.com/you/certs

# 2. On any Mac (or the first CI run), initialize match:
bundle exec fastlane match init
# → enter your private cert repo SSH URL when prompted

# 3. Generate App Store certificates and profiles:
bundle exec fastlane match appstore
# → set a strong passphrase when prompted (save it as MATCH_PASSWORD secret)
```

#### Step 4 — GitHub Repository Secrets

Go to **GitHub repo → Settings → Environments** and create an environment named **`appstore`**. Then add these secrets inside that environment:

| Secret | Where to find it |
|--------|-----------------|
| `APPLE_ID` | Your Apple ID email address |
| `APPLE_APP_ID` | Numeric App ID from Step 1 |
| `APPLE_TEAM_ID` | [developer.apple.com/account](https://developer.apple.com/account) → Membership → Team ID |
| `ITC_TEAM_ID` | App Store Connect → Users and Access → your team number |
| `MATCH_GIT_URL` | SSH URL of your certificates repo (e.g. `git@github.com:you/certs.git`) |
| `MATCH_SSH_PRIVATE_KEY` | SSH private key that has read access to the certs repo |
| `MATCH_PASSWORD` | The passphrase you set in Step 3 |
| `APP_STORE_CONNECT_API_KEY_ID` | Key ID from Step 2 |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID from Step 2 |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | Full contents of the `.p8` file from Step 2 |

#### Step 5 — Enable Push Notifications Capability
In [developer.apple.com](https://developer.apple.com) → **Certificates, IDs & Profiles** → **Identifiers** → select `com.fantasyclimbingleague.app`:
- Enable **Push Notifications**
- Then re-run `bundle exec fastlane match appstore` to regenerate the provisioning profile

#### Step 6 — Deploy!

**Option A — Tag-based release:**
```bash
git tag v1.0.0
git push origin v1.0.0
# → GitHub Actions builds and uploads to TestFlight automatically
```

**Option B — Manual trigger:**
- GitHub → **Actions** → **iOS Release to App Store** → **Run workflow**
- Choose lane: `beta` (TestFlight) or `release` (App Store)

**Option C — Submit for App Store review** (after TestFlight testing):
- Run with lane `release`, or in App Store Connect click **Submit for Review**

---

## CI/CD Workflows

### `ios-ci.yml` — Continuous Integration
Runs on every push and pull request to `main`:
- Runs Jest tests
- Runs ESLint
- Builds the iOS app on a macOS runner (unsigned, for validation)

### `ios-release.yml` — Release to App Store
Triggered by `v*` tag push or manually:
- **`beta`** lane → uploads to TestFlight
- **`release`** lane → uploads to App Store for review

---

## Project Structure

```
.
├── App.tsx                              # Root component (biometric auth + WebView)
├── index.js                             # Entry point
├── ios/
│   ├── Podfile
│   └── FantasyClimbingLeague/
│       ├── AppDelegate.swift            # Push notification callbacks
│       ├── FantasyClimbingLeague-Bridging-Header.h  # ObjC bridge for push notifications
│       ├── FantasyClimbingLeague.entitlements       # Push notification entitlement
│       └── Info.plist                   # Face ID usage description + background modes
├── fastlane/
│   ├── Fastfile                         # beta / release lanes
│   ├── Appfile                          # App metadata
│   └── Matchfile                        # Code signing config
├── .github/workflows/
│   ├── ios-ci.yml                       # CI workflow
│   └── ios-release.yml                  # Release workflow
└── __tests__/
    └── App.test.tsx
```

---

## Tech Stack

- **React Native** 0.85 — native iOS framework
- **react-native-webview** — renders the fantasyclimbingleague.com website
- **react-native-biometrics** — Face ID / Touch ID authentication
- **@react-native-community/push-notification-ios** — APNs push notifications
- **Fastlane** — automates building, signing, and publishing
- **Fastlane Match** — manages iOS certificates and provisioning profiles
- **GitHub Actions** (macOS runner) — builds the app without needing a Mac locally
