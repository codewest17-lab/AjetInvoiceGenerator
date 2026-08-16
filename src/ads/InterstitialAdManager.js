import { InterstitialAd, AdEventType } from "react-native-google-mobile-ads";
import { INTERSTITIAL_AD_UNIT_ID } from "../constants/adUnitIds";

// Simple singleton wrapper around a single InterstitialAd instance.
// Usage pattern (see InvoiceEditorScreen / PreviewScreen for real calls):
//
//   import { interstitialManager } from "../ads/InterstitialAdManager";
//   useEffect(() => { interstitialManager.load(); }, []);
//   interstitialManager.showIfReady(() => navigation.goBack());
//
// showIfReady is a no-op (just calls onDone immediately) whenever the
// caller passes isPremium=true, so premium users never see interstitials.

class InterstitialAdManager {
  constructor() {
    this.ad = null;
    this.isLoaded = false;
    this.actionCount = 0;
    // Show an interstitial roughly every N "trigger" actions
    // (e.g. every 3rd PDF export / save) rather than every single time,
    // which keeps the app usable while still monetizing free users.
    this.frequency = 3;
  }

  load() {
    if (this.ad) return;
    this.ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });
    this.isLoaded = false;

    const unsubscribeLoaded = this.ad.addAdEventListener(AdEventType.LOADED, () => {
      this.isLoaded = true;
    });
    const unsubscribeClosed = this.ad.addAdEventListener(AdEventType.CLOSED, () => {
      this.isLoaded = false;
      this.ad = null;
      // Preload the next one immediately so it's ready next time.
      this.load();
    });
    const unsubscribeError = this.ad.addAdEventListener(AdEventType.ERROR, () => {
      this.isLoaded = false;
      this.ad = null;
    });

    this.ad.load();
    this._unsubs = [unsubscribeLoaded, unsubscribeClosed, unsubscribeError];
  }

  // Call this at a "checkpoint" (e.g. after saving or exporting an
  // invoice). onDone always fires — either after the ad closes, or
  // immediately if no ad is shown.
  showIfReady({ isPremium = false, onDone = () => {} } = {}) {
    this.actionCount += 1;

    if (isPremium) {
      onDone();
      return;
    }

    const shouldShow = this.isLoaded && this.actionCount % this.frequency === 0;

    if (shouldShow && this.ad) {
      const unsubscribeClosed = this.ad.addAdEventListener(AdEventType.CLOSED, () => {
        unsubscribeClosed();
        onDone();
      });
      this.ad.show();
    } else {
      onDone();
    }
  }
}

export const interstitialManager = new InterstitialAdManager();
