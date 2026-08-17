// Minimal ambient types for the experimental Document Picture-in-Picture API
// (Chrome-only as of writing; not yet part of TS's DOM lib).
// https://developer.chrome.com/docs/web-platform/document-picture-in-picture

type DocumentPictureInPictureOptions = {
  width?: number
  height?: number
}

type DocumentPictureInPicture = {
  requestWindow: (options?: DocumentPictureInPictureOptions) => Promise<Window>
  window: Window | null
}

interface Window {
  documentPictureInPicture?: DocumentPictureInPicture
}
