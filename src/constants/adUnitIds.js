import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

// IMPORTANT
// -------------------------------------------------------------------
// Google's official TEST ad unit IDs are used whenever __DEV__ is true,
// so you can build and test this app safely without risking your
// AdMob account (serving/clicking real ads on a dev build can get an
// account flagged). Replace the production IDs below with the REAL
// ad unit IDs from your own AdMob console before publishing, and also
// update the App IDs in app.json (androidAppId / iosAppId / iOS Info.plist).
// -------------------------------------------------------------------

const PRODUCTION_BANNER_ID = Platform.select({
  ios: "ca-app-pub-XXXXXXXXXXXXXXXX/BANNER_IOS_UNIT_ID",
  android: "ca-app-pub-XXXXXXXXXXXXXXXX/BANNER_ANDROID_UNIT_ID",
});

const PRODUCTION_INTERSTITIAL_ID = Platform.select({
  ios: "ca-app-pub-XXXXXXXXXXXXXXXX/INTERSTITIAL_IOS_UNIT_ID",
  android: "ca-app-pub-XXXXXXXXXXXXXXXX/INTERSTITIAL_ANDROID_UNIT_ID",
});

export const BANNER_AD_UNIT_ID = __DEV__ ? TestIds.BANNER : PRODUCTION_BANNER_ID;
export const INTERSTITIAL_AD_UNIT_ID = __DEV__ ? TestIds.INTERSTITIAL : PRODUCTION_INTERSTITIAL_ID;
