import React, { useState, useEffect } from 'react';
import { 
  getConversionGoals, 
  createConversionGoal, 
  updateConversionGoal, 
  deleteConversionGoal,
  getConversionStatistics,
  ConversionGoal 
} from '../services/conversionTracking';
import { Target, Plus, Edit2, Trash2, DollarSign } from 'lucide-react';

export const ConversionTracking: React.FC = () => {
  const [goals, setGoals] = useState<ConversionGoal[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ConversionGoal | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadGoals();
    loadStatistics();
  }, []);

  const loadGoals = () => {
    const loadedGoals = getConversionGoals();
    setGoals(loadedGoals);
  };

  const loadStatistics = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    
    const stats = getConversionStatistics(startDate.toISOString(), endDate.toISOString());
    setStatistics(stats);
  };

  const handleCreateGoal = (goalData: any) => {
    createConversionGoal(
      goalData.name,
      goalData.description,
      goalData.type,
      goalData.condition,
      goalData.value,
      goalData.currency
    );
    loadGoals();
    setShowCreateModal(false);
  };

  const handleUpdateGoal = (goalId: string, updates: any) => {
    updateConversionGoal(goalId, updates);
    loadGoals();
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteConversionGoal(goalId);
      loadGoals();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page_view':
        return '👁️';
      case 'click':
        return '👆';
      case 'form_submit':
        return '📝';
      case 'purchase':
        return '💰';
      case 'signup':
        return '👤';
      case 'custom':
        return '⚙️';
      default:
        return '🎯';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conversion Tracking</h1>
          <p className="text-gray-600">Define and track conversion goals to measure success</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Goal
        </button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">Total Conversions</div>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {statistics.totalConversions.toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">Total Value</div>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${statistics.totalValue.toFixed(2)}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">Average Value</div>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${statistics.averageValue.toFixed(2)}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">Active Goals</div>
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {goals.length}
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Conversion Goals</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {goals.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Created</h3>
              <p className="text-gray-600 mb-4">Create your first conversion goal to start tracking</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Goal
              </button>
            </div>
          ) : (
            goals.map((goal) => {
              const conversions = statistics?.conversionsByGoal[goal.id] || 0;
              
              return (
                <div key={goal.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{getTypeIcon(goal.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {goal.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {goal.type.replace('_', ' ')}
                          </span>
                          {goal.value && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                              ${goal.value} {goal.currency || 'USD'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingGoal(goal)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Conversions (30 days)</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {conversions.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Condition</div>
                      <div className="text-sm text-gray-900">
                        {goal.condition.pageId && `Page: ${goal.condition.pageId}`}
                        {goal.condition.elementId && `Element: ${goal.condition.elementId}`}
                        {goal.condition.eventType && `Event: ${goal.condition.eventType}`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingGoal) && (
        <ConversionGoalModal
          goal={editingGoal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingGoal(null);
          }}
          onSave={(goalData: any) => {
            if (editingGoal) {
              handleUpdateGoal(editingGoal.id, goalData);
            } else {
              handleCreateGoal(goalData);
            }
          }}
        />
      )}
    </div>
  );
};

// Conversion Goal Modal Component
interface ConversionGoalModalProps {
  goal: ConversionGoal | null;
  onClose: () => void;
  onSave: (goalData: any) => void;
}

const ConversionGoalModal: React.FC<ConversionGoalModalProps> = ({ goal, onClose, onSave }) => {
  const [name, setName] = useState(goal?.name || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [type, setType] = useState(goal?.type || 'page_view');
  const [pageId, setPageId] = useState(goal?.condition.pageId || '');
  const [elementId, setElementId] = useState(goal?.condition.elementId || '');
  const [eventType, setEventType] = useState(goal?.condition.eventType || '');
  const [value, setValue] = useState(goal?.value || 0);
  const [currency, setCurrency] = useState(goal?.currency || 'USD');

  const handleSubmit = () => {
    onSave({
      name,
      description,
      type,
      condition: {
        pageId: pageId || undefined,
        elementId: elementId || undefined,
        eventType: eventType || undefined
      },
      value: value || undefined,
      currency: currency || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {goal ? 'Edit Goal' : 'Create New Goal'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter goal name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this goal tracks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="page_view">Page View</option>
              <option value="click">Click</option>
              <option value="form_submit">Form Submit</option>
              <option value="purchase">Purchase</option>
              <option value="signup">Signup</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page ID (optional)
            </label>
            <input
              type="text"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Specific page ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Element ID (optional)
            </label>
            <input
              type="text"
              value={elementId}
              onChange={(e) => setElementId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Specific element ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type (optional)
            </label>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Custom event type"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value (optional)
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || !description}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {goal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
};
