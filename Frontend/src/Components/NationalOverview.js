import React, { useEffect, useState } from "react";
import { TrendingUp, Activity, AlertCircle, Calendar, BarChart3, LineChart, Users, Globe } from "lucide-react";

const NationalOverview = () => {
  const [summary, setSummary] = useState(null);
  const [plots, setPlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch national summary and plots concurrently
        const [summaryRes, plotsRes] = await Promise.all([
          fetch("http://localhost:8002/api/national/summary"),
          fetch("http://localhost:8002/api/national/plots")
        ]);

        if (!summaryRes.ok || !plotsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const summaryData = await summaryRes.json();
        const plotsData = await plotsRes.json();

        setSummary(summaryData);

        const formattedPlots = {};
        for (const key in plotsData) {
          formattedPlots[key] = `data:image/png;base64,${plotsData[key]}`;
        }
        setPlots(formattedPlots);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const plotTitles = {
    new_cases_bar: "Daily New COVID-19 Cases (Last 30 Days)",
    total_vs_new: "Total vs New Cases Over Time",
    total_cases_line: "Cumulative Total COVID-19 Cases",
    new_cases_line: "Daily New COVID-19 Cases Over Time"
  };

  const plotIcons = {
    new_cases_bar: BarChart3,
    total_vs_new: Activity,
    total_cases_line: TrendingUp,
    new_cases_line: LineChart
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getChangeIndicator = (newCases) => {
    if (!newCases || newCases === 0) return { color: 'text-gray-500', trend: 'stable' };
    return newCases > 0 
      ? { color: 'text-red-500', trend: 'increasing' }
      : { color: 'text-green-500', trend: 'decreasing' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ml-80 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded-lg w-80 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="h-6 bg-gray-300 rounded w-2/3 mb-4"></div>
                  <div className="h-64 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ml-80 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const changeIndicator = summary ? getChangeIndicator(summary.new_cases) : { color: 'text-gray-500', trend: 'stable' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ml-80 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">National COVID-19 Dashboard</h1>
          </div>
          <p className="text-gray-600 text-lg">Real-time monitoring and analytics</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Country</h3>
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{summary.country}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Cases</h3>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{formatNumber(summary.total_cases)}</p>
              <p className="text-xs text-gray-500 mt-1">{(summary.total_cases ?? 0).toLocaleString()} total</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">New Cases</h3>
                <TrendingUp className={`w-5 h-5 ${changeIndicator.color}`} />
              </div>
              <p className={`text-2xl font-bold ${changeIndicator.color}`}>
                {summary.new_cases > 0 ? '+' : ''}{formatNumber(summary.new_cases)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Trend: {changeIndicator.trend}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Last Updated</h3>
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {summary.last_updated ? 
                  new Date(summary.last_updated).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 
                  'Unknown'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.last_updated ? 
                  new Date(summary.last_updated).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  'No timestamp'
                }
              </p>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.keys(plots).map((plotKey) => {
            const IconComponent = plotIcons[plotKey] || BarChart3;
            return (
              <div key={plotKey} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {plotTitles[plotKey] || plotKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="relative group">
                    <img
                      src={plots[plotKey]}
                      alt={`Chart: ${plotTitles[plotKey] || plotKey}`}
                      className="w-full h-auto rounded-lg border border-gray-200 group-hover:border-indigo-300 transition-colors"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="text-sm text-gray-600">
              Data refreshed automatically • Last update: {summary?.last_updated ? new Date(summary.last_updated).toLocaleString() : 'Unknown'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NationalOverview;