import React, { useState, useEffect } from 'react';
import { 
  getConversionFunnels, 
  createConversionFunnel, 
  updateConversionFunnel, 
  deleteConversionFunnel,
  analyzeConversionFunnel,
  ConversionFunnel 
} from '../services/conversionTracking';
import { getConversionGoals, ConversionGoal } from '../services/conversionTracking';
import { GitBranch, Plus, Edit2, Trash2, TrendingDown } from 'lucide-react';

export const FunnelAnalyzer: React.FC = () => {
  const [funnels, setFunnels] = useState<ConversionFunnel[]>([]);
  const [goals, setGoals] = useState<ConversionGoal[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<ConversionFunnel | null>(null);
  const [selectedFunnel, setSelectedFunnel] = useState<ConversionFunnel | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFunnel) {
      const funnelAnalysis = analyzeConversionFunnel(
        selectedFunnel.id,
        dateRange.start,
        dateRange.end
      );
      setAnalysis(funnelAnalysis);
    }
  }, [selectedFunnel, dateRange]);

  const loadData = () => {
    const loadedFunnels = getConversionFunnels();
    setFunnels(loadedFunnels);
    
    const loadedGoals = getConversionGoals();
    setGoals(loadedGoals);
  };

  const handleCreateFunnel = (funnelData: any) => {
    createConversionFunnel(
      funnelData.name,
      funnelData.description,
      funnelData.steps
    );
    loadData();
    setShowCreateModal(false);
  };

  const handleUpdateFunnel = (funnelId: string, updates: any) => {
    updateConversionFunnel(funnelId, updates);
    loadData();
    setEditingFunnel(null);
  };

  const handleDeleteFunnel = (funnelId: string) => {
    if (confirm('Are you sure you want to delete this funnel?')) {
      deleteConversionFunnel(funnelId);
      loadData();
      if (selectedFunnel?.id === funnelId) {
        setSelectedFunnel(null);
      }
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Funnel Analyzer</h1>
          <p className="text-gray-600">Visualize and optimize your conversion funnels</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Funnel
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnels List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Funnels ({funnels.length})</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {funnels.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <GitBranch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No funnels created yet</p>
                </div>
              ) : (
                funnels.map((funnel) => (
                  <div
                    key={funnel.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedFunnel?.id === funnel.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedFunnel(funnel)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{funnel.name}</h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFunnel(funnel);
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFunnel(funnel.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{funnel.description}</p>
                    <div className="text-xs text-gray-500">
                      {funnel.steps.length} steps
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="lg:col-span-2">
          {selectedFunnel && analysis ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedFunnel.name}</h2>
                <p className="text-gray-600">{selectedFunnel.description}</p>
              </div>

              {/* Overall Conversion Rate */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Overall Conversion Rate</div>
                    <div className="text-4xl font-bold text-blue-600">
                      {analysis.overallConversionRate.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Entries</div>
                    <div className="text-4xl font-bold text-gray-900">
                      {analysis.totalEntries.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Funnel Steps */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Funnel Steps</h3>
                <div className="space-y-4">
                  {analysis.stepData.map((step: any, index: number) => {
                    const width = analysis.totalEntries > 0 
                      ? (step.users / analysis.totalEntries) * 100 
                      : 0;
                    
                    return (
                      <div key={step.stepId}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{step.stepName}</div>
                              <div className="text-sm text-gray-600">
                                {step.users.toLocaleString()} users
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {step.conversionRate.toFixed(1)}%
                            </div>
                            {index > 0 && (
                              <div className="text-sm text-red-600 flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                {step.dropOffRate.toFixed(1)}% drop-off
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-8">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                              style={{ width: `${width}%` }}
                            >
                              {width > 10 && (
                                <span className="text-white text-sm font-medium">
                                  {step.users.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drop-off Analysis */}
              {analysis.stepData.some((step: any) => step.dropOffRate > 30) && (
                <div className="p-6 border-t border-gray-200 bg-yellow-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-yellow-600" />
                    High Drop-off Points
                  </h3>
                  <div className="space-y-2">
                    {analysis.stepData
                      .filter((step: any) => step.dropOffRate > 30)
                      .map((step: any) => (
                        <div key={step.stepId} className="bg-white p-3 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{step.stepName}</div>
                            <div className="text-red-600 font-bold">
                              {step.dropOffRate.toFixed(1)}% drop-off
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Consider optimizing this step to reduce friction
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <GitBranch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Funnel</h3>
              <p className="text-gray-600">Choose a funnel from the list to view analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingFunnel) && (
        <FunnelModal
          funnel={editingFunnel}
          goals={goals}
          onClose={() => {
            setShowCreateModal(false);
            setEditingFunnel(null);
          }}
          onSave={(funnelData: any) => {
            if (editingFunnel) {
              handleUpdateFunnel(editingFunnel.id, funnelData);
            } else {
              handleCreateFunnel(funnelData);
            }
          }}
        />
      )}
    </div>
  );
};

// Funnel Modal Component
interface FunnelModalProps {
  funnel: ConversionFunnel | null;
  goals: ConversionGoal[];
  onClose: () => void;
  onSave: (funnelData: any) => void;
}

const FunnelModal: React.FC<FunnelModalProps> = ({ funnel, goals, onClose, onSave }) => {
  const [name, setName] = useState(funnel?.name || '');
  const [description, setDescription] = useState(funnel?.description || '');
  const [steps, setSteps] = useState(
    funnel?.steps || [{ id: '1', name: 'Step 1', goalId: '', order: 0 }]
  );

  const handleAddStep = () => {
    setSteps([
      ...steps,
      { id: Date.now().toString(), name: `Step ${steps.length + 1}`, goalId: '', order: steps.length }
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, field: string, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSubmit = () => {
    onSave({
      name,
      description,
      steps: steps.map((step, index) => ({
        ...step,
        order: index
      }))
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {funnel ? 'Edit Funnel' : 'Create New Funnel'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funnel Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter funnel name"
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
              placeholder="Describe this conversion funnel"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Funnel Steps *
              </label>
              <button
                onClick={handleAddStep}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Step
              </button>
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      placeholder="Step name"
                    />
                    {steps.length > 1 && (
                      <button
                        onClick={() => handleRemoveStep(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Conversion Goal
                    </label>
                    <select
                      value={step.goalId}
                      onChange={(e) => handleStepChange(index, 'goalId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Select a goal...</option>
                      {goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
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
            disabled={!name || !description || steps.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {funnel ? 'Update Funnel' : 'Create Funnel'}
          </button>
        </div>
      </div>
    </div>
  );
};
