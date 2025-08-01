import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  Activity, 
  Bed, 
  Heart, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Filter,
  Stethoscope,
  UserCheck,
  Zap,
  Wind,
  Shield,
  Clock
} from 'lucide-react';

const HospitalResources = () => {
  const [selectedMetric, setSelectedMetric] = useState('beds');
  const [timeRange, setTimeRange] = useState('7d');
  const [alertsVisible, setAlertsVisible] = useState(true);

  const [currentData, setCurrentData] = useState(null);
  const [trendDataRaw, setTrendDataRaw] = useState([]); // raw API data
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Starting API calls...');
        
        // Fetch latest with better error handling
        const latestResponse = await fetch('http://localhost:8002/api/resources/hospital-resources/latest');
        console.log('Latest response status:', latestResponse.status);
        
        if (!latestResponse.ok) {
          throw new Error(`Latest API failed: ${latestResponse.status} ${latestResponse.statusText}`);
        }
        
        const latestData = await latestResponse.json();
        console.log('Latest data received:', latestData);
        setCurrentData(latestData);

        // Fetch trend (last 30 days)
        const trendResponse = await fetch('http://localhost:8002/api/resources/hospital-resources/trend');
        console.log('Trend response status:', trendResponse.status);
        
        if (!trendResponse.ok) {
          throw new Error(`Trend API failed: ${trendResponse.status} ${trendResponse.statusText}`);
        }
        
        const trendDataResponse = await trendResponse.json();
        console.log('Trend data received:', trendDataResponse);
        
        setTrendDataRaw(trendDataResponse);
        
        // Transform trend data for charting
        const transformed = trendDataResponse.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          bedOccupancy: (item.occupied_beds / item.total_beds) * 100,
          icuOccupancy: (item.occupied_icu_beds / item.icu_beds) * 100,
          ventilatorUsage: (item.used_ventilators / item.total_ventilators) * 100,
          oxygenUsage: (item.used_oxygen_cylinders / item.total_oxygen_cylinders) * 100,
          availableStaff: item.total_doctors + item.total_nurses + item.total_icu_nurses,
          staffReduction: (1 - item.staff_reduction_factor) * 100
        }));
        
        console.log('Transformed data:', transformed);
        setTrendData(transformed);
        
      } catch (error) {
        console.error("API Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ marginLeft: "320px", padding: "2rem"}}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded-lg w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="h-6 bg-gray-300 rounded w-2/3 mb-4"></div>
                  <div className="h-80 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ marginLeft: "320px", padding: "2rem"}}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-red-800 mb-4">Failed to Load Hospital Data</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no data
  if (!currentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ marginLeft: "320px", padding: "2rem"}}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No hospital data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate utilization rates
  const bedUtilization = ((currentData.occupied_beds / currentData.total_beds) * 100).toFixed(1);
  const icuUtilization = ((currentData.occupied_icu_beds / currentData.icu_beds) * 100).toFixed(1);
  const ventilatorUtilization = ((currentData.used_ventilators / currentData.total_ventilators) * 100).toFixed(1);
  const oxygenUtilization = ((currentData.used_oxygen_cylinders / currentData.total_oxygen_cylinders) * 100).toFixed(1);

  // Alert system
  const alerts = [];
  if (bedUtilization > 85) alerts.push({ type: 'critical', message: 'Bed capacity critical', value: `${bedUtilization}%`, icon: Bed });
  if (icuUtilization > 80) alerts.push({ type: 'warning', message: 'ICU capacity high', value: `${icuUtilization}%`, icon: Activity });
  if (ventilatorUtilization > 70) alerts.push({ type: 'warning', message: 'Ventilator usage high', value: `${ventilatorUtilization}%`, icon: Heart });
  if (currentData.staff_reduction_factor < 0.9) alerts.push({ type: 'warning', message: 'Staff shortage detected', value: `${((1 - currentData.staff_reduction_factor) * 100).toFixed(1)}% reduced`, icon: Users });

  // Capacity overview data for pie chart
  const capacityData = [
    { name: 'Available', value: currentData.available_beds, color: '#10B981' },
    { name: 'Occupied', value: currentData.occupied_beds, color: '#EF4444' },
  ];

  const icuCapacityData = [
    { name: 'Available', value: currentData.available_icu_beds, color: '#3B82F6' },
    { name: 'Occupied', value: currentData.occupied_icu_beds, color: '#F59E0B' },
  ];

  const getUtilizationColor = (percentage) => {
    if (percentage >= 85) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBgColor = (percentage) => {
    if (percentage >= 85) return 'border-red-500';
    if (percentage >= 70) return 'border-yellow-500';
    return 'border-green-500';
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, percentage, trend }) => (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 ${getUtilizationBgColor(percentage)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-5 w-5 text-gray-500" />
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className={`text-3xl font-bold ${getUtilizationColor(percentage)} mb-1`}>{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {trend && (
          <div className="text-right">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              percentage >= 85 ? 'bg-red-500' : 
              percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const AlertCard = ({ alert }) => (
    <div className={`p-4 rounded-xl border-l-4 ${
      alert.type === 'critical' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
    } hover:shadow-md transition-shadow`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${alert.type === 'critical' ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <alert.icon className={`h-5 w-5 ${alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />
        </div>
        <div className="ml-3">
          <p className={`text-sm font-semibold ${alert.type === 'critical' ? 'text-red-800' : 'text-yellow-800'}`}>
            {alert.message}
          </p>
          <p className={`text-sm ${alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
            {alert.value}
          </p>
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-600">{entry.name}:</span>
              <span className="text-sm font-medium text-gray-900">
                {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ marginLeft: "320px", padding: "2rem"}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Hospital Resources</h1>
          </div>
          <p className="text-gray-600 text-lg">Real-time monitoring of hospital capacity and resources</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select 
              className="bg-transparent focus:outline-none text-sm font-medium text-gray-700"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
            <Clock className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Alerts */}
        {alertsVisible && alerts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Active Alerts</h2>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {alerts.length}
                </span>
              </div>
              <button 
                onClick={() => setAlertsVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert, index) => (
                <AlertCard key={index} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Bed Occupancy"
            value={`${bedUtilization}%`}
            subtitle={`${currentData.occupied_beds} of ${currentData.total_beds} beds occupied`}
            icon={Bed}
            percentage={parseFloat(bedUtilization)}
            trend={2.1}
          />
          <MetricCard
            title="ICU Utilization"
            value={`${icuUtilization}%`}
            subtitle={`${currentData.occupied_icu_beds} of ${currentData.icu_beds} ICU beds`}
            icon={Activity}
            percentage={parseFloat(icuUtilization)}
            trend={-1.3}
          />
          <MetricCard
            title="Ventilator Usage"
            value={`${ventilatorUtilization}%`}
            subtitle={`${currentData.used_ventilators} of ${currentData.total_ventilators} in use`}
            icon={Heart}
            percentage={parseFloat(ventilatorUtilization)}
            trend={0.8}
          />
          <MetricCard
            title="Staff Availability"
            value={`${(currentData.staff_reduction_factor * 100).toFixed(1)}%`}
            subtitle={`${currentData.total_doctors + currentData.total_nurses + currentData.total_icu_nurses} total staff members`}
            icon={Users}
            percentage={parseFloat((currentData.staff_reduction_factor * 100).toFixed(1))}
            trend={-0.5}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Occupancy Trends */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Occupancy Trends</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="icuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Area 
                  type="monotone" 
                  dataKey="bedOccupancy" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fill="url(#bedGradient)" 
                  name="Bed Occupancy" 
                />
                <Area 
                  type="monotone" 
                  dataKey="icuOccupancy" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  fill="url(#icuGradient)" 
                  name="ICU Occupancy" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Resource Utilization */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Resource Utilization</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="ventilatorUsage" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                  name="Ventilator Usage" 
                />
                <Line 
                  type="monotone" 
                  dataKey="oxygenUsage" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                  name="Oxygen Usage" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capacity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bed className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Bed Capacity</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={capacityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <Activity className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">ICU Capacity</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={icuCapacityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {icuCapacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wind className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Equipment Status</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Ventilators</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {currentData.used_ventilators}/{currentData.total_ventilators}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${ventilatorUtilization}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className={`text-xs font-medium ${getUtilizationColor(ventilatorUtilization)}`}>
                    {ventilatorUtilization}%
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Oxygen Cylinders</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {currentData.used_oxygen_cylinders}/{currentData.total_oxygen_cylinders}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${oxygenUtilization}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className={`text-xs font-medium ${getUtilizationColor(oxygenUtilization)}`}>
                    {oxygenUtilization}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Management Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{currentData.total_doctors}</div>
              <div className="text-sm text-gray-600">Total Doctors</div>
              <div className="text-xs text-green-600">{currentData.available_doctors} available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{currentData.total_nurses}</div>
              <div className="text-sm text-gray-600">General Nurses</div>
              <div className="text-xs text-green-600">{currentData.available_nurses} available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{currentData.total_icu_nurses}</div>
              <div className="text-sm text-gray-600">ICU Nurses</div>
              <div className="text-xs text-green-600">{currentData.available_icu_nurses} available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalResources;