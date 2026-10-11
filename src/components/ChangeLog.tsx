import React, { useState, useEffect } from 'react';
import {
  getChangeLog,
  filterChangeLog,
  getChangeStatistics,
  exportChangeLogToCSV,
  clearChangeLog,
  ChangeRecord,
  ChangeFilter
} from '../services/changeTracking';
import { History, Filter, Download, Trash2, Search } from 'lucide-react';

interface ChangeLogProps {
  currentUserId?: string;
}

export const ChangeLog: React.FC<ChangeLogProps> = ({ currentUserId }) => {
  const [records, setRecords] = useState<ChangeRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ChangeRecord[]>([]);
  const [filter, setFilter] = useState<ChangeFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadChangeLog();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filter, searchQuery]);

  const loadChangeLog = () => {
    const data = getChangeLog();
    setRecords(data);
  };

  const applyFilters = () => {
    let filtered = filterChangeLog(records, filter);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.entityName.toLowerCase().includes(query) ||
        record.userName.toLowerCase().includes(query) ||
        record.action.toLowerCase().includes(query)
      );
    }
    
    setFilteredRecords(filtered);
  };

  const handleExport = () => {
    const csv = exportChangeLogToCSV(filteredRecords);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `change-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the entire change log? This cannot be undone.')) {
      clearChangeLog();
      loadChangeLog();
    }
  };

  const statistics = getChangeStatistics(records);

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'move': return 'bg-purple-100 text-purple-800';
      case 'duplicate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityTypeIcon = (entityType: string): string => {
    switch (entityType) {
      case 'page': return '📄';
      case 'section': return '📦';
      case 'component': return '🧩';
      default: return '📝';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Change Log</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear Log
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{statistics.totalChanges}</div>
            <div className="text-sm text-gray-600">Total Changes</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(statistics.changesByUser).length}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {statistics.changesByAction['create'] || 0}
            </div>
            <div className="text-sm text-gray-600">Creations</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {statistics.changesByAction['update'] || 0}
            </div>
            <div className="text-sm text-gray-600">Updates</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search changes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
              showFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={filter.action || ''}
                  onChange={(e) => setFilter({ ...filter, action: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="move">Move</option>
                  <option value="duplicate">Duplicate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                <select
                  value={filter.entityType || ''}
                  onChange={(e) => setFilter({ ...filter, entityType: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Types</option>
                  <option value="page">Page</option>
                  <option value="section">Section</option>
                  <option value="component">Component</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <input
                  type="date"
                  onChange={(e) => setFilter({
                    ...filter,
                    dateRange: {
                      start: e.target.value,
                      end: filter.dateRange?.end || new Date().toISOString().split('T')[0]
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={() => setFilter({})}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Change List */}
      <div className="p-6">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No changes found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getEntityTypeIcon(record.entityType)}</span>
                    <div>
                      <div className="font-medium text-gray-900">{record.entityName}</div>
                      <div className="text-sm text-gray-500">
                        {record.userName} • {new Date(record.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(record.action)}`}>
                    {record.action}
                  </span>
                </div>
                
                {record.changes.length > 0 && (
                  <div className="mt-3 pl-10 space-y-1">
                    {record.changes.map((change, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        <span className="font-medium">{change.field}:</span>{' '}
                        {change.changeType === 'added' && (
                          <span className="text-green-600">+ {JSON.stringify(change.newValue)}</span>
                        )}
                        {change.changeType === 'removed' && (
                          <span className="text-red-600">- {JSON.stringify(change.oldValue)}</span>
                        )}
                        {change.changeType === 'modified' && (
                          <span>
                            <span className="text-red-600">{JSON.stringify(change.oldValue)}</span>
                            {' → '}
                            <span className="text-green-600">{JSON.stringify(change.newValue)}</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
