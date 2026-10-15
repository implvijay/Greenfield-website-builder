import React, { useState, useEffect } from 'react';
import {
  getCollaborators,
  getOnlineCollaborators,
  getRecentCollaborationEvents,
  getCollaborationStatistics,
  simulateUserJoin,
  simulateUserLeave,
  CollaboratorUser,
  CollaborationEvent
} from '../services/collaboration';
import { Users, UserCheck, UserX, Activity } from 'lucide-react';

interface CollaborationPanelProps {
  currentPageId?: string;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ currentPageId }) => {
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
  const [events, setEvents] = useState<CollaborationEvent[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setCollaborators(getCollaborators());
    setEvents(getRecentCollaborationEvents(20));
    setStatistics(getCollaborationStatistics());
  };

  const handleSimulateJoin = (userId: string) => {
    simulateUserJoin(userId);
    loadData();
  };

  const handleSimulateLeave = (userId: string) => {
    simulateUserLeave(userId);
    loadData();
  };

  const onlineCollaborators = getOnlineCollaborators();

  const getEventTypeIcon = (type: string): string => {
    switch (type) {
      case 'user_joined': return '🟢';
      case 'user_left': return '🔴';
      case 'page_viewing': return '👁️';
      case 'page_editing': return '✏️';
      case 'section_editing': return '📝';
      default: return '⚡';
    }
  };

  const formatEventTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Collaboration</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              {onlineCollaborators.length} Online
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          See who's working on this project in real-time
        </p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.totalCollaborators}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {statistics.onlineCollaborators}
              </div>
              <div className="text-sm text-gray-600">Online Now</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.totalEvents}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(statistics.eventsByType).length}
              </div>
              <div className="text-sm text-gray-600">Event Types</div>
            </div>
          </div>
        </div>
      )}

      {/* Online Collaborators */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-green-600" />
          Online Now ({onlineCollaborators.length})
        </h3>
        {onlineCollaborators.length === 0 ? (
          <p className="text-sm text-gray-500">No collaborators online</p>
        ) : (
          <div className="space-y-2">
            {onlineCollaborators.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-600">{user.email}</div>
                    {user.currentPageId && (
                      <div className="text-xs text-green-600 mt-1">
                        Viewing page
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleSimulateLeave(user.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Simulate Leave
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offline Collaborators */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <UserX className="w-4 h-4 text-gray-400" />
          Offline ({collaborators.length - onlineCollaborators.length})
        </h3>
        <div className="space-y-2">
          {collaborators
            .filter(c => !c.isOnline)
            .map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium opacity-50"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">{user.name}</div>
                    <div className="text-xs text-gray-500">
                      Last seen {formatEventTime(user.lastSeen)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleSimulateJoin(user.id)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Simulate Join
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Recent Activity
        </h3>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-xl">{getEventTypeIcon(event.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">
                    <span className="font-medium">{event.userName}</span>
                    {' '}
                    {event.type === 'user_joined' && 'joined the session'}
                    {event.type === 'user_left' && 'left the session'}
                    {event.type === 'page_viewing' && 'is viewing a page'}
                    {event.type === 'page_editing' && 'is editing a page'}
                    {event.type === 'section_editing' && 'is editing a section'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatEventTime(event.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-6 border-t border-gray-200 bg-blue-50">
        <div className="text-xs text-blue-800">
          <strong>Note:</strong> This is a simulated collaboration system for demonstration purposes. 
          In a production environment, this would use WebSockets for real-time updates and actual user authentication.
        </div>
      </div>
    </div>
  );
};
