/**
 * shared/app-insights.js — lightweight telemetry proxy client.
 *
 * Sends page_view and cta_click events to the telemetry-ingest proxy
 * (Azure Function) instead of loading the full App Insights SDK client-side.
 * The AI connection string lives only in the proxy's Azure app settings.
 *
 * Configuration (set before this script loads):
 *
 *   window.BLOG_TELEMETRY_CONFIG = {
 *     proxyUrl:    'https://<fn>.azurewebsites.net/api/track',  // required
 *     blogSlug:    'uplift',
 *     blogTitle:   'Uplift — Making Teen Learning Visible',
 *     environment: 'production'
 *   };
 *
 * Tracked events: page_view (on load), cta_click (elements with
 * data-telemetry-event="cta_click").  No cookies, no storage, no SDK.
 */
(function initSharedBlogTelemetry(window, document) {
  'use strict';

  var config = window.BLOG_TELEMETRY_CONFIG || {};
  var proxyUrl = config.proxyUrl;

  // Telemetry is opt-in: do nothing if no proxy URL is configured.
  if (!proxyUrl) {
    return;
  }

  var blogSlug    = String(config.blogSlug    || 'unknown').slice(0, 64);
  var blogTitle   = String(config.blogTitle   || document.title).slice(0, 128);
  var environment = String(config.environment || 'production').slice(0, 32);

  function send(eventName, extra) {
    var payload = {
      event_name:  eventName,
      blog_slug:   blogSlug,
      blog_title:  blogTitle,
      environment: environment,
      referrer:    (document.referrer || '').slice(0, 256),
      page_url:    window.location.href.slice(0, 512),
      page_path:   window.location.pathname.slice(0, 256)
    };

    if (extra) {
      var keys = Object.keys(extra);
      for (var i = 0; i < keys.length; i++) {
        payload[keys[i]] = extra[keys[i]];
      }
    }

    // fetch with keepalive survives page-unload (equivalent to sendBeacon
    // for fire-and-forget telemetry).  Errors are intentionally swallowed.
    try {
      window.fetch(proxyUrl, {
        method:    'POST',
        headers:   { 'Content-Type': 'application/json' },
        body:      JSON.stringify(payload),
        keepalive: true
      });
    } catch (_) { /* silent — telemetry must never break the page */ }
  }

  // Track initial page view.
  send('page_view');

  // Track clicks on CTA elements annotated with data-telemetry-event.
  document.addEventListener('click', function (event) {
    var el = event.target.closest('[data-telemetry-event]');
    if (!el) { return; }

    var evtName = el.getAttribute('data-telemetry-event');
    if (evtName !== 'cta_click') { return; }

    send('cta_click', {
      link_text: (el.textContent || '').trim().slice(0, 128),
      href:      (el.getAttribute('href') || '').slice(0, 512),
      section:   (el.getAttribute('data-telemetry-section') || '').slice(0, 64)
    });
  });

})(window, document);
