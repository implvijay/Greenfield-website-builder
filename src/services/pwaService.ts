// PWA (Progressive Web App) service

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  startUrl: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  backgroundColor: string;
  themeColor: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
}

export interface PWAInstallPrompt {
  prompt: () => Promise<boolean>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'greenfield_pwa_config';

// Default PWA configuration
const DEFAULT_PWA_CONFIG: PWAConfig = {
  name: 'GREENFIELD Website Factory',
  shortName: 'GREENFIELD',
  description: 'Professional website builder for creating modern, responsive websites',
  startUrl: '/',
  display: 'standalone',
  backgroundColor: '#ffffff',
  themeColor: '#3b82f6',
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ]
};

// Get PWA configuration
export function getPWAConfig(): PWAConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_PWA_CONFIG;
  } catch (error) {
    console.error('Failed to load PWA config:', error);
    return DEFAULT_PWA_CONFIG;
  }
}

// Save PWA configuration
export function savePWAConfig(config: PWAConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save PWA config:', error);
  }
}

// Generate manifest.json content
export function generateManifest(config: PWAConfig = getPWAConfig()): string {
  const manifest = {
    name: config.name,
    short_name: config.shortName,
    description: config.description,
    start_url: config.startUrl,
    display: config.display,
    background_color: config.backgroundColor,
    theme_color: config.themeColor,
    icons: config.icons
  };
  
  return JSON.stringify(manifest, null, 2);
}

// Generate service worker content
export function generateServiceWorker(): string {
  return `
// GREENFIELD Service Worker
const CACHE_NAME = 'greenfield-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
`;
}

// Check if PWA is supported
export function isPWASupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Check if app is installed
export function isAppInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

// Unregister service worker
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    return true;
  } catch (error) {
    console.error('Service worker unregistration failed:', error);
    return false;
  }
}

// Setup install prompt
export function setupInstallPrompt(): Promise<PWAInstallPrompt | null> {
  return new Promise((resolve) => {
    let deferredPrompt: any;
    
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      resolve({
        prompt: () => {
          deferredPrompt.prompt();
          return deferredPrompt.userChoice;
        },
        userChoice: deferredPrompt?.userChoice || Promise.resolve({ outcome: 'dismissed' })
      });
    });
    
    // Timeout after 5 seconds if no prompt
    setTimeout(() => resolve(null), 5000);
  });
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported');
    return 'denied';
  }
  
  return await Notification.requestPermission();
}

// Check notification permission
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// Show notification
export function showNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported');
    return;
  }
  
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, options);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

// Enable offline mode
export function enableOfflineMode(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({ type: 'ENABLE_OFFLINE_MODE' });
    });
  }
}

// Disable offline mode
export function disableOfflineMode(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({ type: 'DISABLE_OFFLINE_MODE' });
    });
  }
}

// Check online status
export function isOnline(): boolean {
  return navigator.onLine;
}

// Setup online/offline listeners
export function setupOnlineOfflineListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

// Get PWA installation status
export function getPWAStatus(): {
  supported: boolean;
  installed: boolean;
  serviceWorkerRegistered: boolean;
  notificationPermission: NotificationPermission;
  online: boolean;
} {
  return {
    supported: isPWASupported(),
    installed: isAppInstalled(),
    serviceWorkerRegistered: 'serviceWorker' in navigator,
    notificationPermission: getNotificationPermission(),
    online: isOnline()
  };
}

// Initialize PWA
export async function initializePWA(): Promise<void> {
  if (!isPWASupported()) {
    console.warn('PWA is not supported in this browser');
    return;
  }
  
  // Register service worker
  await registerServiceWorker();
  
  // Setup offline listeners
  setupOnlineOfflineListeners(
    () => console.log('App is online'),
    () => console.log('App is offline')
  );
}
