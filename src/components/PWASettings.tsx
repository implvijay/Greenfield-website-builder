import React, { useState, useEffect } from 'react';
import {
  isPWASupported,
  isAppInstalled,
  getPWAStatus,
  requestNotificationPermission,
  getNotificationPermission,
  registerServiceWorker,
  unregisterServiceWorker,
  showNotification,
  getPWAConfig,
  savePWAConfig,
  generateManifest,
  generateServiceWorker
} from '../services/pwaService';
import { Smartphone, Download, Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const PWASettings: React.FC = () => {
  const [pwaStatus, setPwaStatus] = useState(getPWAStatus());
  const [config, setConfig] = useState(getPWAConfig());
  const [isEditing, setIsEditing] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // Check for install prompt
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    // Update status periodically
    const interval = setInterval(() => {
      setPwaStatus(getPWAStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        setPwaStatus(getPWAStatus());
      }
    }
  };

  const handleRequestNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    setPwaStatus(getPWAStatus());
  };

  const handleShowTestNotification = () => {
    showNotification('Test Notification', {
      body: 'This is a test notification from GREENFIELD',
      icon: '/icons/icon-192x192.png'
    });
  };

  const handleRegisterServiceWorker = async () => {
    await registerServiceWorker();
    setPwaStatus(getPWAStatus());
  };

  const handleUnregisterServiceWorker = async () => {
    await unregisterServiceWorker();
    setPwaStatus(getPWAStatus());
  };

  const handleSaveConfig = () => {
    savePWAConfig(config);
    setIsEditing(false);
  };

  const handleDownloadManifest = () => {
    const manifest = generateManifest(config);
    const blob = new Blob([manifest], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadServiceWorker = () => {
    const sw = generateServiceWorker();
    const blob = new Blob([sw], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sw.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Smartphone className="w-8 h-8" />
          Progressive Web App Settings
        </h1>
        <p className="text-gray-600">Configure PWA features and install the app</p>
      </div>

      {/* PWA Status */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">PWA Supported</div>
              {pwaStatus.supported ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {pwaStatus.supported ? 'Yes' : 'No'}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">App Installed</div>
              {pwaStatus.installed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {pwaStatus.installed ? 'Yes' : 'No'}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Service Worker</div>
              {pwaStatus.serviceWorkerRegistered ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {pwaStatus.serviceWorkerRegistered ? 'Registered' : 'Not Registered'}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Notifications</div>
              {pwaStatus.notificationPermission === 'granted' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div className="text-lg font-semibold text-gray-900 capitalize">
              {pwaStatus.notificationPermission}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Online Status</div>
              {pwaStatus.online ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {pwaStatus.online ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Install Button */}
      {installPrompt && !pwaStatus.installed && (
        <div className="mb-8">
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Install App
          </button>
        </div>
      )}

      {/* Notification Settings */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notifications
        </h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Permission Status: <span className="capitalize">{pwaStatus.notificationPermission}</span>
              </div>
              {pwaStatus.notificationPermission !== 'granted' && (
                <button
                  onClick={handleRequestNotificationPermission}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request Permission
                </button>
              )}
              {pwaStatus.notificationPermission === 'granted' && (
                <button
                  onClick={handleShowTestNotification}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Send Test Notification
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Service Worker Settings */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Worker</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Status: {pwaStatus.serviceWorkerRegistered ? 'Registered' : 'Not Registered'}
              </div>
              <div className="flex gap-2">
                {!pwaStatus.serviceWorkerRegistered && (
                  <button
                    onClick={handleRegisterServiceWorker}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register Service Worker
                  </button>
                )}
                {pwaStatus.serviceWorkerRegistered && (
                  <button
                    onClick={handleUnregisterServiceWorker}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Unregister Service Worker
                  </button>
                )}
                <button
                  onClick={handleDownloadServiceWorker}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Download sw.js
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PWA Configuration */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Configuration</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Configuration
            </button>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Name
                </label>
                <input
                  type="text"
                  value={config.shortName}
                  onChange={(e) => setConfig({ ...config, shortName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Color
                </label>
                <input
                  type="color"
                  value={config.themeColor}
                  onChange={(e) => setConfig({ ...config, themeColor: e.target.value })}
                  className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                  className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Configuration
                </button>
                <button
                  onClick={() => {
                    setConfig(getPWAConfig());
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">App Name</div>
                <div className="text-gray-900">{config.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Short Name</div>
                <div className="text-gray-900">{config.shortName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Description</div>
                <div className="text-gray-900">{config.description}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Theme Color</div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: config.themeColor }}
                  />
                  <span className="text-gray-900">{config.themeColor}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Background Color</div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: config.backgroundColor }}
                  />
                  <span className="text-gray-900">{config.backgroundColor}</span>
                </div>
              </div>
              <button
                onClick={handleDownloadManifest}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Download manifest.json
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
