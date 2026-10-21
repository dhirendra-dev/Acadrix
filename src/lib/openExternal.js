// Opens a URL in the external browser, even inside an Android WebView (e.g. the /app APK).
// On a real browser, lets the native anchor target="_blank" handle it (new tab).
// On an Android WebView, intercepts and uses an intent:// URL to launch the system browser,
// because Google Drive's PDF viewer hangs on large files inside a WebView.
export function openExternal(url, event) {
  if (!url) return;
  const ua = navigator.userAgent || "";
  const isAndroid = /android/i.test(ua);
  // "; wv)" is the standard Android WebView UA marker; "webview" covers some OEM shells
  const isWebView = /; wv\)/i.test(ua) || /webview/i.test(ua);

  if (isAndroid && isWebView) {
    if (event) event.preventDefault();
    // intent:// scheme tells Android to launch the default handler (external browser / Drive app)
    try {
      const intentUrl =
        url.replace(/^https?:\/\//, "intent://") +
        "#Intent;scheme=https;action=android.intent.action.VIEW;end;";
      window.location.href = intentUrl;
      return;
    } catch (e) {
      /* fall through to standard open */
    }
    try {
      window.open(url, "_blank");
    } catch (e) {
      window.location.href = url;
    }
  }
  // Otherwise: do nothing — the anchor's target="_blank" opens a normal new tab.
}