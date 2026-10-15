import React, { useState } from 'react';
import { Page } from '../types';
import { 
  schedulePagePublish, 
  schedulePageExpire, 
  clearAllSchedules,
  getPageScheduleStatus,
  formatTimeUntil,
  getUpcomingScheduledPages
} from '../services/pageScheduling';
import { Calendar, Clock, X } from 'lucide-react';

interface PageScheduleManagerProps {
  pages: Page[];
  onUpdatePages: (pages: Page[]) => void;
}

export const PageScheduleManager: React.FC<PageScheduleManagerProps> = ({
  pages,
  onUpdatePages,
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [publishDate, setPublishDate] = useState('');
  const [publishTime, setPublishTime] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [expireTime, setExpireTime] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(false);

  const selectedPage = pages.find(p => p.id === selectedPageId);
  const scheduleStatus = selectedPage ? getPageScheduleStatus(selectedPage) : null;
  const upcomingPages = getUpcomingScheduledPages(pages, 5);

  const handleSchedulePublish = () => {
    if (!selectedPageId || !publishDate || !publishTime) return;

    const dateTime = `${publishDate}T${publishTime}:00`;
    const updatedPages = schedulePagePublish(pages, selectedPageId, dateTime);
    onUpdatePages(updatedPages);
    setPublishDate('');
    setPublishTime('');
  };

  const handleScheduleExpire = () => {
    if (!selectedPageId || !expireDate || !expireTime) return;

    const dateTime = `${expireDate}T${expireTime}:00`;
    const updatedPages = schedulePageExpire(pages, selectedPageId, dateTime);
    onUpdatePages(updatedPages);
    setExpireDate('');
    setExpireTime('');
  };

  const handleClearSchedules = () => {
    if (!selectedPageId) return;

    const updatedPages = clearAllSchedules(pages, selectedPageId);
    onUpdatePages(updatedPages);
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    };
  };

  const minDateTime = getMinDateTime();

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Page Scheduling</h3>
        </div>
        <button
          onClick={() => setShowUpcoming(!showUpcoming)}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          {showUpcoming ? 'Hide Upcoming' : 'Show Upcoming'}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Page Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Page
          </label>
          <select
            value={selectedPageId || ''}
            onChange={(e) => {
              setSelectedPageId(e.target.value || null);
              setPublishDate('');
              setPublishTime('');
              setExpireDate('');
              setExpireTime('');
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Choose a page...</option>
            {pages.map(page => (
              <option key={page.id} value={page.id}>
                {page.title} ({page.status})
              </option>
            ))}
          </select>
        </div>

        {/* Current Schedule Status */}
        {selectedPage && scheduleStatus && (
          <div className="p-3 bg-slate-50 rounded space-y-2">
            <div className="text-sm font-medium text-slate-900">Current Schedule</div>
            
            {scheduleStatus.hasPublishSchedule && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-slate-700">
                  Publish: {new Date(selectedPage.scheduledPublishAt!).toLocaleString()}
                  {scheduleStatus.publishStatus === 'scheduled' && scheduleStatus.timeUntilPublish && (
                    <span className="text-green-600 ml-2">
                      (in {formatTimeUntil(scheduleStatus.timeUntilPublish)})
                    </span>
                  )}
                </span>
              </div>
            )}
            
            {scheduleStatus.hasExpireSchedule && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-slate-700">
                  Expire: {new Date(selectedPage.scheduledExpireAt!).toLocaleString()}
                  {scheduleStatus.expireStatus === 'scheduled' && scheduleStatus.timeUntilExpire && (
                    <span className="text-orange-600 ml-2">
                      (in {formatTimeUntil(scheduleStatus.timeUntilExpire)})
                    </span>
                  )}
                </span>
              </div>
            )}

            {!scheduleStatus.hasPublishSchedule && !scheduleStatus.hasExpireSchedule && (
              <div className="text-sm text-slate-500">No schedules set</div>
            )}

            {(scheduleStatus.hasPublishSchedule || scheduleStatus.hasExpireSchedule) && (
              <button
                onClick={handleClearSchedules}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear All Schedules
              </button>
            )}
          </div>
        )}

        {/* Schedule Publish */}
        {selectedPage && selectedPage.status === 'draft' && (
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Schedule Publication
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  value={publishDate}
                  min={minDateTime.date}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Time</label>
                <input
                  type="time"
                  value={publishTime}
                  onChange={(e) => setPublishTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={handleSchedulePublish}
              disabled={!publishDate || !publishTime}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule Publish
            </button>
          </div>
        )}

        {/* Schedule Expire */}
        {selectedPage && selectedPage.status === 'published' && (
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Schedule Expiration
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  value={expireDate}
                  min={minDateTime.date}
                  onChange={(e) => setExpireDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Time</label>
                <input
                  type="time"
                  value={expireTime}
                  onChange={(e) => setExpireTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={handleScheduleExpire}
              disabled={!expireDate || !expireTime}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule Expiration
            </button>
          </div>
        )}

        {/* Upcoming Scheduled Pages */}
        {showUpcoming && upcomingPages.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upcoming Scheduled Pages
            </label>
            <div className="space-y-2">
              {upcomingPages.map(page => {
                const status = getPageScheduleStatus(page);
                return (
                  <div
                    key={page.id}
                    className="p-2 bg-slate-50 rounded text-sm"
                  >
                    <div className="font-medium text-slate-900">{page.title}</div>
                    {status.hasPublishSchedule && status.timeUntilPublish && (
                      <div className="text-xs text-green-600">
                        Publishes in {formatTimeUntil(status.timeUntilPublish)}
                      </div>
                    )}
                    {status.hasExpireSchedule && status.timeUntilExpire && (
                      <div className="text-xs text-orange-600">
                        Expires in {formatTimeUntil(status.timeUntilExpire)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
