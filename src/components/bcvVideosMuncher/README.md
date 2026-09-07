# pankosmia-bcv_videos-muncher

`pankosmia-bcv-videos-muncher` provides reusable BCV-flavored muncher components for the Pankosmia ecosystem.

This package contains a set of focused UI tools that can be integrated into Pankosmia clients when BCV editing or visualization capabilities are needed.

> **Note:** This package does not contain everything available inside `pankosmia/core-contenthandler-bcv_videos`. It only exposes reusable components that may or may not be used by other Pankosmia clients.

## Component

### `BCVVideosViewerMuncher`

A component that allows users to view an BCV document.

It is intended for read-only visualization use cases where editing capabilities are not required.

---

## Scope

This package contains only reusable BCV-related components.

Included:

- BCV viewing components

Not included:

- The complete `pankosmia/core-contenthandler-bcv_videos` application
- Application-specific features
- Internal tools that are not intended for reuse

The goal of this package is to provide lightweight, reusable building blocks for BCV features across the Pankosmia ecosystem.

## Testing

To test the Muncher components locally:

1. Start the development server:

```bash
pnpm run dev
```

2. Navigate to:
   `/#/MuncherTest`

## Publishing

To publish this package to npm, use the following command:

```bash
npm run publish
```
