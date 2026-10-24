// XCamera / xhey ad config cleaner for Loon
// Adapted from ZenmoFeiShi/Qx xhey-ad-clean.js
// Only modify known advertising flags; leave other configuration untouched.
(function () {
  try {
    if (!$response || !$response.body) {
      $done({});
      return;
    }
    var config = JSON.parse($response.body);
    if (!config || typeof config !== "object" || Array.isArray(config)) {
      $done({});
      return;
    }
    config.enableAppStoreOpt = 0;
    config.adWindowEnable = 0;
    config.splashShowType = 0;
    config.interstitialShowType = 0;
    config.rewardShowType = 0;
    $done({ body: JSON.stringify(config) });
  } catch (e) {
    $done({});
  }
})();
