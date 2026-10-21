import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// Only register the service worker in production. In dev, unregister any
// stale workers so they can't cache-serve outdated Vite JS chunks (which
// causes React/ReactDOM mismatch errors like "Cannot read properties of null").
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      }).catch(() => {});
      if (caches) {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        }).catch(() => {});
      }
    } else {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  });
}