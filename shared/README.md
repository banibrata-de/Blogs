# Shared blog telemetry

This folder contains reusable client-side components for blog pages.

## Azure Application Insights

`app-insights.js` provides a minimal, reusable telemetry hook for blog pages.

### What it tracks

- one page view on load
- click events for elements marked with `data-telemetry-event`

### What it does not do

- no cookies
- no user IDs
- no session replay
- no custom profiling beyond the minimal page/click events

### Configuration

Each blog page should set a global config before loading the shared script:

```html
<script>
  window.BLOG_TELEMETRY_CONFIG = {
    connectionString: 'APPLICATIONINSIGHTS_CONNECTION_STRING',
    blogSlug: 'uplift',
    blogTitle: 'Uplift — Making Teen Learning Visible',
    environment: 'production'
  };
</script>
<script src="../shared/app-insights.js"></script>
```

### Notes

- Azure Application Insights will derive geography from the request/IP on the backend side.
- The connection string should be replaced with your real App Insights value before publishing.
- For local development, you can leave the placeholder empty to disable telemetry entirely.
