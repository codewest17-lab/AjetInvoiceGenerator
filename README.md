# AjetInvoiceGenerator

A complete cross-platform (iOS + Android) invoice generator built with Expo /
React Native. Create invoices, pick from multiple visual templates, export
polished PDFs, and monetize free users with AdMob banner + interstitial ads —
with a Premium plan that unlocks extra templates and removes ads.

## Features

- Create, edit, save, and delete invoices (stored locally with AsyncStorage)
- Line items with live subtotal / discount / tax / total calculations
- 6 invoice templates — 3 free (Classic, Minimal, Modern), 3 premium
  (Elegant, Bold, Corporate)
- In-app HTML preview + one-tap PDF export & share (`expo-print` + `expo-sharing`)
- Premium plan screen (monthly/yearly) that unlocks premium templates and
  removes all ads
- AdMob **banner ads** on every main screen (hidden automatically for
  Premium users)
- AdMob **interstitial ads** shown at natural checkpoints (every 3rd
  save/export), skipped entirely for Premium users
- Dashboard with outstanding vs. paid totals

## Project structure

```
App.js                          entry point, AdMob SDK init, providers
app.json                        Expo config incl. AdMob app IDs
src/
  constants/                    colors, ad unit IDs
  context/                      PremiumContext, InvoiceContext
  templates/                    template registry + HTML/CSS renderers
  utils/                        storage, currency, totals math, PDF export
  components/AdBanner.js        reusable banner ad (auto-hidden for premium)
  ads/InterstitialAdManager.js  preload/show logic for interstitials
  navigation/AppNavigator.js
  screens/                      Home, InvoiceEditor, TemplateSelect,
                                 Preview, Premium, Settings
```

## Getting started

```bash
npm install
npx expo prebuild        # generates native ios/ and android/ projects
npx expo run:android     # or: npx expo run:ios
```

AdMob and in-app purchases require **native** builds — they will not work in
Expo Go or a web preview. Use `expo run:android` / `expo run:ios`, or build
with EAS (`eas build`).

## CI: building the APK on GitHub Actions

`.github/workflows/build-apk.yml` builds a real Android APK on every push/PR
to `main`, and on demand via **Actions → Build Android APK → Run workflow**
(you can pick `assembleRelease` or `assembleDebug`).

To keep the build from silently shipping something broken, it runs in
layers, each of which fails the job with a clear error if something's wrong,
*before* the expensive native compile step runs:

1. **`expo config` validation** — catches a malformed `app.json` or plugin
   config (e.g. a bad AdMob plugin entry) immediately.
2. **JS bundle validation** (`react-native bundle`) — actually bundles your
   JS with Metro. This is what catches the #1 cause of "build succeeds but
   app crashes on launch": a syntax error, bad import, or missing module
   that native `gradlew` compilation alone would never notice.
3. **`expo prebuild`** — regenerates the native `android/` project fresh
   each run, so stale native config can't cause a mismatch with `app.json`.
4. **`gradlew assembleRelease`** — compiles the actual APK, with Gradle
   caching so repeat builds are fast.
5. **APK integrity check** — runs `aapt dump badging` against the produced
   APK to confirm it's a valid, parseable, correctly packaged Android
   binary (not a truncated/corrupt file) before uploading it. This is what
   would otherwise show up as "installs then instantly crashes" on a device.
6. **Upload artifact** — download the signed APK from the workflow run's
   **Artifacts** section (`AjetInvoiceGenerator-apk`).

Notes:
- The generated project signs the `release` build with the Android
  **debug keystore** by default (standard for Expo bare/prebuild projects),
  so `assembleRelease` works in CI with zero secrets. This APK is fine for
  internal testing/sideloading but is **not** what you upload to the Play
  Store — for that, generate your own upload keystore and wire it into
  `android/app/build.gradle` + GitHub Actions secrets before release.
- AdMob will serve Google's **test ads** in this CI-built APK, since
  `__DEV__` is false in a release JS bundle but the workflow doesn't set
  production ad unit IDs — replace the placeholders in
  `src/constants/adUnitIds.js` (see below) once you have real ones, and the
  CI build will pick them up automatically.
- If you'd rather use EAS Build (Expo's hosted build service) instead of
  this self-contained Gradle workflow, that only needs 3 changes: add an
  `EXPO_TOKEN` repo secret, replace the Gradle steps with
  `npx eas-cli build --platform android --profile preview --non-interactive`,
  and add an `eas.json` build profile.

## Before you publish: required changes

1. **Create an AdMob account** and register your app to get a real
   App ID, then a Banner ad unit ID and an Interstitial ad unit ID.
2. Replace the placeholders in `app.json` (`androidAppId`, `iosAppId`, and
   the iOS `GADApplicationIdentifier`) with your real AdMob **App IDs**.
3. Replace `PRODUCTION_BANNER_ID` / `PRODUCTION_INTERSTITIAL_ID` in
   `src/constants/adUnitIds.js` with your real **ad unit IDs**. The app
   automatically uses Google's official test IDs whenever `__DEV__` is
   true, so you never accidentally serve/click real ads during development.
4. **Wire up real payments** for the Premium plan. `PremiumScreen.js`
   currently uses a mock purchase (a timeout that just flips a local flag)
   so the app runs immediately. For a real release, integrate
   `expo-in-app-purchases` or `react-native-iap`:
   - Create matching "monthly" / "yearly" subscription products in
     App Store Connect and Google Play Console.
   - On a successful purchase callback, call `unlockPremium()` from
     `PremiumContext`.
   - On app launch, call your IAP library's restore-purchases method and
     call `unlockPremium()` if an active entitlement is found (also add a
     visible "Restore Purchases" button).
5. Add real `assets/icon.png`, `assets/splash.png`, and
   `assets/adaptive-icon.png` (referenced in `app.json`).
6. Update `com.ajet.invoicegenerator` in `app.json` to your own bundle
   identifier / package name.
7. Review AdMob and App Store / Play Store policies around ad placement
   frequency and IAP subscription disclosures before submitting.

## How the ad-free Premium flag works

`PremiumContext` stores a single boolean (`isPremium`) in AsyncStorage.
- `AdBanner` reads it and renders `null` instead of a `<BannerAd>` when true.
- `interstitialManager.showIfReady({ isPremium })` no-ops immediately when
  true, so no interstitial is ever loaded/shown for premium users.
- `TemplateSelectScreen` locks the 3 premium templates behind the same flag
  and redirects to `PremiumScreen` if a free user taps one.

## Customizing templates

All templates live in `src/templates/htmlTemplates.js` as HTML/CSS string
generators (used for both the in-app WebView preview and the exported PDF,
via `expo-print`). To add a new template:

1. Write a new render function following the existing pattern.
2. Register it in `TEMPLATE_RENDERERS` in `htmlTemplates.js`.
3. Add its metadata (name, description, `premium: true/false`, swatch
   colors) to `TEMPLATES` in `src/templates/templateRegistry.js`.
