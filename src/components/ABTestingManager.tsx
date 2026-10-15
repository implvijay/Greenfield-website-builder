import React, { useState, useEffect } from 'react';
import { 
  getABTests, 
  createABTest, 
  updateABTest, 
  deleteABTest, 
  startABTest, 
  pauseABTest, 
  completeABTest,
  getABTestAnalysis,
  ABTest 
} from '../services/abTesting';
import { FlaskConical, Play, Pause, CheckCircle, Trash2, Edit2, BarChart3 } from 'lucide-react';

export const ABTestingManager: React.FC = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTest, setEditingTest] = useState<ABTest | null>(null);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      const testAnalysis = getABTestAnalysis(selectedTest.id);
      setAnalysis(testAnalysis);
    }
  }, [selectedTest]);

  const loadTests = () => {
    const loadedTests = getABTests();
    setTests(loadedTests);
  };

  const handleCreateTest = (testData: any) => {
    createABTest(
      testData.name,
      testData.description,
      testData.hypothesis,
      testData.primaryMetric,
      testData.variants
    );
    loadTests();
    setShowCreateModal(false);
  };

  const handleUpdateTest = (testId: string, updates: any) => {
    updateABTest(testId, updates);
    loadTests();
    setEditingTest(null);
  };

  const handleDeleteTest = (testId: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      deleteABTest(testId);
      loadTests();
      if (selectedTest?.id === testId) {
        setSelectedTest(null);
      }
    }
  };

  const handleStartTest = (testId: string) => {
    startABTest(testId);
    loadTests();
  };

  const handlePauseTest = (testId: string) => {
    pauseABTest(testId);
    loadTests();
  };

  const handleCompleteTest = (testId: string) => {
    completeABTest(testId);
    loadTests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit2 className="w-4 h-4" />;
      case 'running':
        return <Play className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">A/B Testing Manager</h1>
          <p className="text-gray-600">Create and manage experiments to optimize your website</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FlaskConical className="w-5 h-5" />
          Create Test
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tests List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Tests ({tests.length})</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {tests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No tests created yet</p>
                </div>
              ) : (
                tests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedTest?.id === test.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                    <div className="flex items-center gap-2">
                      {test.status === 'draft' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTest(test.id);
                          }}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Start
                        </button>
                      )}
                      {test.status === 'running' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePauseTest(test.id);
                          }}
                          className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-1"
                        >
                          <Pause className="w-3 h-3" />
                          Pause
                        </button>
                      )}
                      {test.status === 'paused' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTest(test.id);
                          }}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Resume
                        </button>
                      )}
                      {test.status === 'running' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteTest(test.id);
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTest(test.id);
                        }}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Test Details */}
        <div className="lg:col-span-2">
          {selectedTest ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTest.name}</h2>
                    <p className="text-gray-600">{selectedTest.description}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(selectedTest.status)}`}>
                    {selectedTest.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Hypothesis</div>
                    <div className="text-gray-900">{selectedTest.hypothesis}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Primary Metric</div>
                    <div className="text-gray-900">{selectedTest.primaryMetric}</div>
                  </div>
                  {selectedTest.startDate && (
                    <div>
                      <div className="text-gray-600 mb-1">Start Date</div>
                      <div className="text-gray-900">{new Date(selectedTest.startDate).toLocaleDateString()}</div>
                    </div>
                  )}
                  {selectedTest.endDate && (
                    <div>
                      <div className="text-gray-600 mb-1">End Date</div>
                      <div className="text-gray-900">{new Date(selectedTest.endDate).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Variants */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Variants</h3>
                <div className="space-y-3">
                  {selectedTest.variants.map((variant, index) => {
                    const result = analysis?.results.find((r: any) => r.variantId === variant.id);
                    const isWinner = analysis?.winner?.id === variant.id;
                    
                    return (
                      <div
                        key={variant.id}
                        className={`p-4 rounded-lg border-2 ${
                          isWinner ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{variant.name}</h4>
                            {index === 0 && (
                              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                                Control
                              </span>
                            )}
                            {isWinner && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Winner
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            Weight: {variant.weight}%
                          </div>
                        </div>
                        {result && (
                          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Impressions</div>
                              <div className="text-lg font-semibold text-gray-900">
                                {result.impressions.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Conversions</div>
                              <div className="text-lg font-semibold text-gray-900">
                                {result.conversions.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Conversion Rate</div>
                              <div className="text-lg font-semibold text-gray-900">
                                {result.conversionRate.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Analysis */}
              {analysis && analysis.confidence && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analysis
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-700">Statistical Confidence</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.confidence.toFixed(1)}%
                      </div>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${analysis.confidence}%` }}
                      />
                    </div>
                    {analysis.winner && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Winner:</span> {analysis.winner.name}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Test</h3>
              <p className="text-gray-600">Choose a test from the list to view details and analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTest) && (
        <ABTestModal
          test={editingTest}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTest(null);
          }}
          onSave={(testData: any) => {
            if (editingTest) {
              handleUpdateTest(editingTest.id, testData);
            } else {
              handleCreateTest(testData);
            }
          }}
        />
      )}
    </div>
  );
};

// A/B Test Modal Component
interface ABTestModalProps {
  test: ABTest | null;
  onClose: () => void;
  onSave: (testData: any) => void;
}

const ABTestModal: React.FC<ABTestModalProps> = ({ test, onClose, onSave }) => {
  const [name, setName] = useState(test?.name || '');
  const [description, setDescription] = useState(test?.description || '');
  const [hypothesis, setHypothesis] = useState(test?.hypothesis || '');
  const [primaryMetric, setPrimaryMetric] = useState(test?.primaryMetric || 'conversion_rate');
  const [variants, setVariants] = useState(test?.variants || [
    { id: '1', name: 'Control', weight: 50, config: {} },
    { id: '2', name: 'Variant A', weight: 50, config: {} }
  ]);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now().toString(), name: `Variant ${variants.length}`, weight: 0, config: {} }
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);

  const handleSubmit = () => {
    onSave({
      name,
      description,
      hypothesis,
      primaryMetric,
      variants
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {test ? 'Edit Test' : 'Create New Test'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter test name"
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
              placeholder="Describe what this test is about"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hypothesis *
            </label>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="What do you expect to happen?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Metric *
            </label>
            <select
              value={primaryMetric}
              onChange={(e) => setPrimaryMetric(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="conversion_rate">Conversion Rate</option>
              <option value="click_through_rate">Click-Through Rate</option>
              <option value="engagement_time">Engagement Time</option>
              <option value="bounce_rate">Bounce Rate</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Variants *
              </label>
              <button
                onClick={handleAddVariant}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Variant
              </button>
            </div>
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={variant.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      placeholder="Variant name"
                    />
                    {index > 0 && (
                      <button
                        onClick={() => handleRemoveVariant(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Traffic Weight (%)
                    </label>
                    <input
                      type="number"
                      value={variant.weight}
                      onChange={(e) => handleVariantChange(index, 'weight', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
            {totalWeight !== 100 && (
              <div className="mt-2 text-sm text-red-600">
                Total weight must equal 100% (currently {totalWeight}%)
              </div>
            )}
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
            disabled={!name || !description || !hypothesis || totalWeight !== 100}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {test ? 'Update Test' : 'Create Test'}
          </button>
        </div>
      </div>
    </div>
  );
};
