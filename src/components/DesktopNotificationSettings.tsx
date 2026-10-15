import React, { useState, useEffect } from 'react';
import {
  isNotificationSupported,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  testNotification,
  areNotificationsEnabled
} from '../services/desktopNotifications';
import { Bell, BellOff, Check, AlertCircle } from 'lucide-react';

export const DesktopNotificationSettings: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = () => {
    const supported = isNotificationSupported();
    setIsSupported(supported);
    
    if (supported) {
      const status = getNotificationPermissionStatus();
      setPermission(status);
      setIsEnabled(areNotificationsEnabled());
    } else {
      setPermission('unsupported');
      setIsEnabled(false);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    checkNotificationStatus();
    
    if (granted) {
      // Show a test notification
      setTimeout(() => {
        testNotification();
      }, 500);
    }
  };

  const handleTestNotification = () => {
    testNotification();
  };

  const getStatusIcon = () => {
    if (!isSupported) {
      return <BellOff className="w-6 h-6 text-gray-400" />;
    }
    
    switch (permission) {
      case 'granted':
        return <Check className="w-6 h-6 text-green-600" />;
      case 'denied':
        return <BellOff className="w-6 h-6 text-red-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    if (!isSupported) {
      return 'Desktop notifications are not supported in your browser';
    }
    
    switch (permission) {
      case 'granted':
        return 'Desktop notifications are enabled';
      case 'denied':
        return 'Desktop notifications are blocked. Please enable them in your browser settings.';
      case 'default':
        return 'Desktop notifications are not yet enabled';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    if (!isSupported) {
      return 'bg-gray-50 border-gray-200';
    }
    
    switch (permission) {
      case 'granted':
        return 'bg-green-50 border-green-200';
      case 'denied':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-6 h-6 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Desktop Notifications</h2>
        </div>
        <p className="text-sm text-gray-600">
          Get real-time notifications about important events even when the tab is not active
        </p>
      </div>

      {/* Status */}
      <div className="p-6">
        <div className={`p-4 rounded-lg border ${getStatusColor()} mb-6`}>
          <div className="flex items-start gap-3">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-1">
                {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not Enabled'}
              </div>
              <div className="text-sm text-gray-700">
                {getStatusMessage()}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {!isSupported && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-900 mb-1">
                    Browser Not Supported
                  </div>
                  <div className="text-sm text-yellow-800">
                    Your browser does not support desktop notifications. Try using Chrome, Firefox, Safari, or Edge.
                  </div>
                </div>
              </div>
            </div>
          )}

          {isSupported && permission === 'default' && (
            <div>
              <button
                onClick={handleRequestPermission}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Enable Desktop Notifications
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                You'll be asked to allow notifications in your browser
              </p>
            </div>
          )}

          {isSupported && permission === 'denied' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="font-medium text-red-900 mb-2">
                How to Enable Notifications
              </div>
              <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                <li>Click the lock/info icon in your browser's address bar</li>
                <li>Find "Notifications" in the site settings</li>
                <li>Change the setting to "Allow"</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}

          {isSupported && permission === 'granted' && (
            <div>
              <button
                onClick={handleTestNotification}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Send Test Notification
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                A test notification will appear to confirm everything is working
              </p>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">About Desktop Notifications</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Get notified about scheduled page publications and expirations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Receive workflow state change notifications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Stay updated on collaboration activities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Works even when the browser tab is not active</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Click notifications to quickly navigate to relevant pages</span>
            </li>
          </ul>
        </div>

        {/* Privacy Note */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-800">
            <strong>Privacy Note:</strong> Desktop notifications are handled entirely by your browser. 
            No data is sent to external servers. You can disable notifications at any time through your browser settings.
          </div>
        </div>
      </div>
    </div>
  );
};
