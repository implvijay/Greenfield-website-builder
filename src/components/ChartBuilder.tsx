import React, { useState, useEffect } from 'react';
import {
  ChartConfig,
  getCharts,
  createChart,
  updateChart,
  deleteChart,
  getChartStatistics,
  CHART_COLORS_ARRAY
} from '../services/visualizationService';
import { BarChart3, LineChart, PieChart, Plus, Edit2, Trash2, Download } from 'lucide-react';

interface ChartBuilderProps {
  onDataSelect?: (data: any) => void;
}

export const ChartBuilder: React.FC<ChartBuilderProps> = ({ onDataSelect }) => {
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [selectedChart, setSelectedChart] = useState<ChartConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = () => {
    const loadedCharts = getCharts();
    setCharts(loadedCharts);
    setStatistics(getChartStatistics());
  };

  const handleCreateChart = (chartData: Partial<ChartConfig>) => {
    if (!chartData.type || !chartData.title || !chartData.data) {
      alert('Please fill in all required fields');
      return;
    }

    createChart(
      chartData.type,
      chartData.title,
      chartData.data,
      chartData.options
    );

    loadCharts();
    setIsCreating(false);
  };

  const handleUpdateChart = (chartId: string, updates: Partial<ChartConfig>) => {
    updateChart(chartId, updates);
    loadCharts();
    setEditingChart(null);
  };

  const handleDeleteChart = (chartId: string) => {
    if (confirm('Are you sure you want to delete this chart?')) {
      deleteChart(chartId);
      loadCharts();
      if (selectedChart?.id === chartId) {
        setSelectedChart(null);
      }
    }
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line':
      case 'area':
        return <LineChart className="w-5 h-5" />;
      case 'bar':
        return <BarChart3 className="w-5 h-5" />;
      case 'pie':
      case 'doughnut':
        return <PieChart className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chart Builder</h1>
          <p className="text-gray-600">Create and manage data visualizations</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Chart
        </button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Total Charts</div>
            <div className="text-3xl font-bold text-gray-900">{statistics.totalCharts}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Chart Types</div>
            <div className="text-3xl font-bold text-gray-900">
              {Object.keys(statistics.chartsByType).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Recent Charts</div>
            <div className="text-3xl font-bold text-gray-900">{statistics.recentCharts.length}</div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charts.map((chart) => (
          <div
            key={chart.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedChart(chart)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  {getChartIcon(chart.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{chart.title}</h3>
                  <p className="text-sm text-gray-500 capitalize">{chart.type} chart</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingChart(chart);
                  }}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChart(chart.id);
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chart Preview */}
            <div className="h-40 bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
              <ChartPreview chart={chart} />
            </div>

            <div className="text-xs text-gray-500">
              Created: {new Date(chart.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {charts.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No charts yet</h3>
          <p className="text-gray-600 mb-4">Create your first chart to visualize your data</p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Chart
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingChart) && (
        <ChartModal
          chart={editingChart}
          onClose={() => {
            setIsCreating(false);
            setEditingChart(null);
          }}
          onSave={editingChart 
            ? (chartData: any) => handleUpdateChart(editingChart.id, chartData)
            : handleCreateChart
          }
        />
      )}

      {/* Chart Detail Modal */}
      {selectedChart && (
        <ChartDetailModal
          chart={selectedChart}
          onClose={() => setSelectedChart(null)}
          onUseData={onDataSelect ? () => onDataSelect(selectedChart.data) : undefined}
        />
      )}
    </div>
  );
};

// Chart Preview Component
const ChartPreview: React.FC<{ chart: ChartConfig }> = ({ chart }) => {
  const { data, type } = chart;

  if (!data || !data.datasets || data.datasets.length === 0) {
    return <div className="text-gray-400 text-sm">No data</div>;
  }

  const dataset = data.datasets[0];
  const maxValue = Math.max(...dataset.data);

  if (type === 'pie' || type === 'doughnut') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            {dataset.data.map((value, index) => {
              const percentage = (value / dataset.data.reduce((a, b) => a + b, 0)) * 100;
              const circumference = 2 * Math.PI * 40;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -dataset.data.slice(0, index).reduce((a, b) => a + b, 0) / dataset.data.reduce((a, b) => a + b, 0) * circumference;

              return (
                <circle
                  key={index}
                  cx="64"
                  cy="64"
                  r="40"
                  fill="none"
                  stroke={CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length]}
                  strokeWidth={type === 'doughnut' ? "20" : "40"}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="w-full h-full flex items-end justify-around gap-1 p-2">
        {dataset.data.slice(0, 10).map((value, index) => (
          <div
            key={index}
            className="flex-1 bg-blue-500 rounded-t"
            style={{ height: `${(value / maxValue) * 100}%` }}
          />
        ))}
      </div>
    );
  }

  // Line/Area chart
  return (
    <div className="w-full h-full p-2">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill={type === 'area' ? "rgba(59, 130, 246, 0.2)" : "none"}
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
          points={dataset.data.slice(0, 20).map((value, index) => {
            const x = (index / (dataset.data.length - 1)) * 100;
            const y = 100 - (value / maxValue) * 100;
            return `${x},${y}`;
          }).join(' ')}
        />
      </svg>
    </div>
  );
};

// Chart Modal Component
interface ChartModalProps {
  chart: ChartConfig | null;
  onClose: () => void;
  onSave: (chartIdOrData: string | any, chartData?: any) => void;
}

const ChartModal: React.FC<ChartModalProps> = ({ chart, onClose, onSave }) => {
  const [type, setType] = useState<ChartConfig['type']>(chart?.type || 'bar');
  const [title, setTitle] = useState(chart?.title || '');
  const [labels, setLabels] = useState(chart?.data.labels.join(', ') || '');
  const [dataValues, setDataValues] = useState(chart?.data.datasets[0]?.data.join(', ') || '');
  const [datasetLabel, setDatasetLabel] = useState(chart?.data.datasets[0]?.label || 'Dataset');

  const handleSave = () => {
    const labelsArray = labels.split(',').map(l => l.trim()).filter(l => l);
    const dataArray = dataValues.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (labelsArray.length !== dataArray.length) {
      alert('Number of labels must match number of data values');
      return;
    }

    const chartData = {
      type,
      title,
      data: {
        labels: labelsArray,
        datasets: [{
          label: datasetLabel,
          data: dataArray,
          backgroundColor: CHART_COLORS_ARRAY[0],
          borderColor: CHART_COLORS_ARRAY[0],
          borderWidth: 2
        }]
      },
      options: chart?.options || {}
    };

    if (chart) {
      onSave(chart.id, chartData);
    } else {
      onSave(chartData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {chart ? 'Edit Chart' : 'Create New Chart'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="doughnut">Doughnut Chart</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter chart title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dataset Label
            </label>
            <input
              type="text"
              value={datasetLabel}
              onChange={(e) => setDatasetLabel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Sales, Visitors, Conversions"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labels (comma-separated) *
            </label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Jan, Feb, Mar, Apr, May"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Values (comma-separated) *
            </label>
            <input
              type="text"
              value={dataValues}
              onChange={(e) => setDataValues(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 100, 150, 200, 180, 220"
            />
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
            onClick={handleSave}
            disabled={!title || !labels || !dataValues}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {chart ? 'Update Chart' : 'Create Chart'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Chart Detail Modal Component
interface ChartDetailModalProps {
  chart: ChartConfig;
  onClose: () => void;
  onUseData?: () => void;
}

const ChartDetailModal: React.FC<ChartDetailModalProps> = ({ chart, onClose, onUseData }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{chart.title}</h2>
            <p className="text-gray-600 capitalize">{chart.type} chart</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Full Chart Preview */}
        <div className="h-96 bg-gray-50 rounded-lg mb-6 flex items-center justify-center">
          <ChartPreview chart={chart} />
        </div>

        {/* Chart Data */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Chart Data</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Labels</div>
                <div className="text-sm text-gray-600">
                  {chart.data.labels.join(', ')}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Values</div>
                <div className="text-sm text-gray-600">
                  {chart.data.datasets[0]?.data.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {onUseData && (
            <button
              onClick={onUseData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Use This Data
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
