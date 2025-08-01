import React, { useEffect, useState } from "react";
import { 
  MapPin, 
  Activity, 
  AlertCircle, 
  Calendar, 
  BarChart3, 
  LineChart, 
  Users, 
  Building2,
  TrendingUp,
  Heart,
  UserCheck,
  Stethoscope
} from "lucide-react";

const DistrictOverview = () => {
  const [plots, setPlots] = useState({});
  const [districtSummary, setDistrictSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch district plots and summary concurrently
        const [plotsRes, summaryRes] = await Promise.all([
          fetch("http://localhost:8002/api/district/bangalore/plots"),
          fetch("http://localhost:8002/api/district/bangalore/summary")
        ]);

        if (!plotsRes.ok || !summaryRes.ok) {
          throw new Error('Failed to fetch district data');
        }

        const plotsData = await plotsRes.json();
        const summaryData = await summaryRes.json();

        setPlots(plotsData);
        setDistrictSummary(summaryData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching district data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enhanced plot titles mapping
  const plotTitles = {
    daily_cases: "Daily COVID-19 Cases",
    cumulative_cases: "Cumulative Cases Over Time",
    recovery_rate: "Recovery Rate Trend",
    active_cases: "Active Cases Timeline",
    hospitalization_trend: "Hospitalization Trends",
    age_distribution: "Age Distribution of Cases",
    weekly_summary: "Weekly Summary",
    mortality_rate: "Mortality Rate Analysis"
  };

  const plotIcons = {
    daily_cases: BarChart3,
    cumulative_cases: TrendingUp,
    recovery_rate: Heart,
    active_cases: Activity,
    hospitalization_trend: Stethoscope,
    age_distribution: Users,
    weekly_summary: Calendar,
    mortality_rate: AlertCircle
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getHealthStatus = (hospitalized) => {
    if (!hospitalized || hospitalized === 0) return { color: 'text-green-600', status: 'Low', bgColor: 'bg-green-50', borderColor: 'border-green-500' };
    if (hospitalized < 100) return { color: 'text-yellow-600', status: 'Moderate', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-500' };
    return { color: 'text-red-600', status: 'High', bgColor: 'bg-red-50', borderColor: 'border-red-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 ml-80 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded-lg w-96 mb-8"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 ml-80 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading District Data</h3>
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

  const healthStatus = districtSummary ? getHealthStatus(districtSummary.hospitalized) : { color: 'text-gray-500', status: 'Unknown', bgColor: 'bg-gray-50', borderColor: 'border-gray-500' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 ml-80 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-8 h-8 text-teal-600" />
            <h1 className="text-4xl font-bold text-gray-800">Bangalore Urban District</h1>
          </div>
          <p className="text-gray-600 text-lg">COVID-19 monitoring and health analytics</p>
          <div className="flex items-center gap-2 mt-2">
            <Building2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Karnataka, India</span>
          </div>
        </div>

        {/* Summary Cards */}
        {districtSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 ${healthStatus.borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Hospitalized Today</h3>
                <Stethoscope className={`w-5 h-5 ${healthStatus.color}`} />
              </div>
              <p className={`text-2xl font-bold ${healthStatus.color}`}>
                {formatNumber(districtSummary.hospitalized)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${healthStatus.bgColor} ${healthStatus.color}`}>
                  {healthStatus.status} Risk
                </div>
              </div>
            </div>
          </div>

        )}

        {/* District Health Status Banner */}
        {districtSummary && (
          <div className={`${healthStatus.bgColor} border ${healthStatus.borderColor.replace('border-', 'border-')} rounded-xl p-6 mb-8`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${healthStatus.bgColor}`}>
                <UserCheck className={`w-6 h-6 ${healthStatus.color}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${healthStatus.color}`}>
                  District Health Status: {healthStatus.status}
                </h3>
                <p className="text-gray-600 text-sm">
                  Current hospitalization levels indicate {healthStatus.status.toLowerCase()} risk. 
                  {districtSummary.hospitalized > 0 && ` ${districtSummary.hospitalized} patients currently hospitalized.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        {Object.keys(plots).length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Object.keys(plots).map((plotKey) => {
              const IconComponent = plotIcons[plotKey] || BarChart3;
              const title = plotTitles[plotKey] || plotKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              
              return (
                <div key={plotKey} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <IconComponent className="w-5 h-5 text-teal-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="relative group">
                      <img
                        src={`data:image/png;base64,${plots[plotKey]}`}
                        alt={`Chart: ${title}`}
                        className="w-full h-auto rounded-lg border border-gray-200 group-hover:border-teal-300 transition-colors"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Chart Data Available</h3>
            <p className="text-gray-500">Charts will appear here when data becomes available.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span className="text-sm text-gray-600">
              Bangalore Urban District • Data updated in real-time
            </span>
          </div>
        </div>
      </div>
   </div>
  );
};

export default DistrictOverview;