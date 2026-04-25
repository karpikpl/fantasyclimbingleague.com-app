# fantasyclimbingleague.com-app

iPhone (React Native) app for [fantasyclimbingleague.com](https://fantasyclimbingleague.com).

This app wraps the Fantasy Climbing League website in a native iOS shell, enabling App Store distribution. It uses GitHub Actions with macOS runners so you can build and publish **without a Mac**.

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

### One-time Setup

#### 1. Apple Developer Account
- Enroll at [developer.apple.com](https://developer.apple.com)
- Create an App ID: `com.fantasyclimbingleague.app`
- Create the app record in [App Store Connect](https://appstoreconnect.apple.com)

#### 2. App Store Connect API Key
Generate an API key at **App Store Connect → Users and Access → Keys**:
- Role: **App Manager** (or Admin)
- Download the `.p8` file — you can only download it once

#### 3. Fastlane Match (Code Signing)
[Match](https://docs.fastlane.tools/actions/match/) manages certificates and provisioning profiles in a private Git repository.

```bash
# Create a private Git repo for certificates (e.g., github.com/yourorg/certificates)
# Then initialize match:
bundle exec fastlane match init
bundle exec fastlane match appstore
```

#### 4. GitHub Secrets
Add the following secrets to your repository (**Settings → Secrets and variables → Actions**):

| Secret | Description |
|--------|-------------|
| `APPLE_ID` | Your Apple ID email |
| `APPLE_APP_ID` | App Store Connect numeric App ID |
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `ITC_TEAM_ID` | App Store Connect Team ID |
| `MATCH_GIT_URL` | SSH URL of your certificates repo |
| `MATCH_SSH_PRIVATE_KEY` | SSH private key with access to certificates repo |
| `MATCH_PASSWORD` | Password used to encrypt Match certificates |
| `APP_STORE_CONNECT_API_KEY_ID` | Key ID from step 2 |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID from step 2 |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | Contents of the `.p8` file |

#### 5. GitHub Environment
Create a GitHub environment named **`appstore`** (**Settings → Environments**) and add the secrets there for extra protection.

---

## CI/CD Workflows

### `ios-ci.yml` — Continuous Integration
Runs on every push and pull request to `main`:
- Runs Jest tests
- Runs ESLint
- Builds the iOS app on a macOS runner (unsigned, for validation)

### `ios-release.yml` — Release to App Store
Runs when:
- A tag matching `v*` is pushed (e.g., `git tag v1.0.0 && git push --tags`)
- Manually triggered via **Actions → iOS Release to App Store → Run workflow**

Available lanes:
- **`beta`** — uploads to TestFlight
- **`release`** — uploads to App Store for review

### Deploying a New Version

```bash
# Bump version in Xcode project, then tag and push:
git tag v1.0.0
git push origin v1.0.0
```

Or trigger manually from GitHub Actions UI and select `beta` or `release`.

---

## Project Structure

```
.
├── App.tsx                  # Root component (WebView)
├── index.js                 # Entry point
├── ios/                     # Xcode project
│   ├── Podfile
│   └── FantasyClimbingLeague/
├── fastlane/
│   ├── Fastfile             # Lane definitions
│   ├── Appfile              # App metadata
│   └── Matchfile            # Code signing config
├── .github/workflows/
│   ├── ios-ci.yml           # CI workflow
│   └── ios-release.yml      # Release workflow
└── __tests__/
    └── App.test.tsx
```

---

## Tech Stack

- **React Native** 0.85 — cross-platform mobile framework
- **react-native-webview** — renders the fantasyclimbingleague.com website
- **Fastlane** — automates building, signing, and publishing
- **Fastlane Match** — manages iOS certificates and provisioning profiles
- **GitHub Actions** (macOS runner) — builds the app without needing a Mac locally
