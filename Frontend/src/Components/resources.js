import React, { useState, useEffect } from 'react';
import '../Stylesheets/HospitalDashboard.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Activity, Bed, Heart, Users, AlertTriangle, TrendingUp, Calendar, Filter } from 'lucide-react';

const HospitalResources = () => {
  const [selectedMetric, setSelectedMetric] = useState('beds');
  const [timeRange, setTimeRange] = useState('7d');
  const [alertsVisible, setAlertsVisible] = useState(true);

  // Sample data based on your dataset structure
  const sampleData = [
    { date: '2024-01-01', total_beds: 150, available_beds: 64, occupied_beds: 86, icu_beds: 25, available_icu_beds: 15, occupied_icu_beds: 10, total_ventilators: 15, available_ventilators: 9, used_ventilators: 6, total_oxygen_cylinders: 50, available_oxygen_cylinders: 39, used_oxygen_cylinders: 11, total_doctors: 12, available_doctors: 11, total_nurses: 35, available_nurses: 32, total_icu_nurses: 8, available_icu_nurses: 7, staff_reduction_factor: 0.925 },
    { date: '2024-01-02', total_beds: 150, available_beds: 78, occupied_beds: 72, icu_beds: 25, available_icu_beds: 18, occupied_icu_beds: 7, total_ventilators: 15, available_ventilators: 11, used_ventilators: 4, total_oxygen_cylinders: 50, available_oxygen_cylinders: 42, used_oxygen_cylinders: 8, total_doctors: 12, available_doctors: 11, total_nurses: 35, available_nurses: 32, total_icu_nurses: 8, available_icu_nurses: 7, staff_reduction_factor: 0.925 },
    { date: '2024-01-03', total_beds: 150, available_beds: 68, occupied_beds: 82, icu_beds: 25, available_icu_beds: 15, occupied_icu_beds: 10, total_ventilators: 15, available_ventilators: 9, used_ventilators: 6, total_oxygen_cylinders: 50, available_oxygen_cylinders: 38, used_oxygen_cylinders: 12, total_doctors: 12, available_doctors: 11, total_nurses: 35, available_nurses: 32, total_icu_nurses: 8, available_icu_nurses: 7, staff_reduction_factor: 0.925 },
    { date: '2024-01-04', total_beds: 150, available_beds: 53, occupied_beds: 97, icu_beds: 25, available_icu_beds: 15, occupied_icu_beds: 10, total_ventilators: 15, available_ventilators: 9, used_ventilators: 6, total_oxygen_cylinders: 50, available_oxygen_cylinders: 39, used_oxygen_cylinders: 11, total_doctors: 12, available_doctors: 11, total_nurses: 35, available_nurses: 32, total_icu_nurses: 8, available_icu_nurses: 7, staff_reduction_factor: 0.925 },
    { date: '2024-01-05', total_beds: 150, available_beds: 61, occupied_beds: 89, icu_beds: 25, available_icu_beds: 16, occupied_icu_beds: 9, total_ventilators: 15, available_ventilators: 10, used_ventilators: 5, total_oxygen_cylinders: 50, available_oxygen_cylinders: 39, used_oxygen_cylinders: 11, total_doctors: 12, available_doctors: 11, total_nurses: 35, available_nurses: 32, total_icu_nurses: 8, available_icu_nurses: 7, staff_reduction_factor: 0.925 },
    { date: '2024-01-06', total_beds: 150, available_beds: 57, occupied_beds: 93, icu_beds: 25, available_icu_beds: 15, occupied_icu_beds: 10, total_ventilators: 15, available_ventilators: 9, used_ventilators: 6, total_oxygen_cylinders: 50, available_oxygen_cylinders: 40, used_oxygen_cylinders: 10, total_doctors: 12, available_doctors: 11, total_nurses: 35, available_nurses: 32, total_icu_nurses: 8, available_icu_nurses: 7, staff_reduction_factor: 0.925 },
    { date: '2024-01-07', total_beds: 150, available_beds: 32, occupied_beds: 118, icu_beds: 25, available_icu_beds: 12, occupied_icu_beds: 13, total_ventilators: 15, available_ventilators: 8, used_ventilators: 7, total_oxygen_cylinders: 50, available_oxygen_cylinders: 36, used_oxygen_cylinders: 14, total_doctors: 12, available_doctors: 11, total_nurses: 35, available_nurses: 32, total_icu_nurses: 8, available_icu_nurses: 7, staff_reduction_factor: 0.925 }
  ];

  const currentData = sampleData[sampleData.length - 1];

  // Calculate utilization rates
  const bedUtilization = ((currentData.occupied_beds / currentData.total_beds) * 100).toFixed(1);
  const icuUtilization = ((currentData.occupied_icu_beds / currentData.icu_beds) * 100).toFixed(1);
  const ventilatorUtilization = ((currentData.used_ventilators / currentData.total_ventilators) * 100).toFixed(1);
  const oxygenUtilization = ((currentData.used_oxygen_cylinders / currentData.total_oxygen_cylinders) * 100).toFixed(1);

  // Alert system
  const alerts = [];
  if (bedUtilization > 85) alerts.push({ type: 'critical', message: 'Bed capacity critical', value: `${bedUtilization}%` });
  if (icuUtilization > 80) alerts.push({ type: 'warning', message: 'ICU capacity high', value: `${icuUtilization}%` });
  if (ventilatorUtilization > 70) alerts.push({ type: 'warning', message: 'Ventilator usage high', value: `${ventilatorUtilization}%` });
  if (currentData.staff_reduction_factor < 0.9) alerts.push({ type: 'warning', message: 'Staff shortage detected', value: `${((1 - currentData.staff_reduction_factor) * 100).toFixed(1)}% reduced` });

  // Capacity overview data for pie chart
  const capacityData = [
    { name: 'Available Beds', value: currentData.available_beds, color: '#10B981' },
    { name: 'Occupied Beds', value: currentData.occupied_beds, color: '#EF4444' },
  ];

  const icuCapacityData = [
    { name: 'Available ICU', value: currentData.available_icu_beds, color: '#3B82F6' },
    { name: 'Occupied ICU', value: currentData.occupied_icu_beds, color: '#F59E0B' },
  ];

  // Trend data for charts
  const trendData = sampleData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bedOccupancy: (item.occupied_beds / item.total_beds) * 100,
    icuOccupancy: (item.occupied_icu_beds / item.icu_beds) * 100,
    ventilatorUsage: (item.used_ventilators / item.total_ventilators) * 100,
    oxygenUsage: (item.used_oxygen_cylinders / item.total_oxygen_cylinders) * 100,
    availableStaff: item.total_doctors + item.total_nurses + item.total_icu_nurses,
    staffReduction: (1 - item.staff_reduction_factor) * 100
  }));

  const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color  }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex flex-col items-end">
          <Icon className="h-8 w-8 text-gray-400" />
          {trend && (
            <span className={`text-sm font-medium ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const AlertCard = ({ alert }) => (
    <div className={`p-4 rounded-lg border-l-4 ${
      alert.type === 'critical' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
    }`}>
      <div className="flex items-center">
        <AlertTriangle className={`h-5 w-5 ${alert.type === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
        <div className="ml-3">
          <p className={`text-sm font-medium ${alert.type === 'critical' ? 'text-red-800' : 'text-yellow-800'}`}>
            {alert.message}
          </p>
          <p className={`text-sm ${alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
            {alert.value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ marginLeft: "700px"}} >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hospital Resource Management</h1>
          <p className="text-gray-600">Real-time monitoring and predictive analytics for optimal resource allocation</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <option value="beds">Bed Management</option>
              <option value="icu">ICU Resources</option>
              <option value="equipment">Equipment</option>
              <option value="staff">Staff Management</option>
            </select>
          </div>
        </div>

        {/* Alerts */}
        {alertsVisible && alerts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
              <button 
                onClick={() => setAlertsVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            subtitle={`${currentData.occupied_beds}/${currentData.total_beds} beds`}
            icon={Bed}
            color="#3B82F6"
            trend={2.1}
          />
          <MetricCard
            title="ICU Utilization"
            value={`${icuUtilization}%`}
            subtitle={`${currentData.occupied_icu_beds}/${currentData.icu_beds} ICU beds`}
            icon={Activity}
            color="#EF4444"
            trend={-1.3}
          />
          <MetricCard
            title="Ventilator Usage"
            value={`${ventilatorUtilization}%`}
            subtitle={`${currentData.used_ventilators}/${currentData.total_ventilators} ventilators`}
            icon={Heart}
            color="#10B981"
            trend={0.8}
          />
          <MetricCard
            title="Staff Availability"
            value={`${(currentData.staff_reduction_factor * 100).toFixed(1)}%`}
            subtitle={`${currentData.total_doctors + currentData.total_nurses + currentData.total_icu_nurses} total staff`}
            icon={Users}
            color="#F59E0B"
            trend={-0.5}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Occupancy Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="bedOccupancy" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Bed Occupancy %" />
                <Area type="monotone" dataKey="icuOccupancy" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="ICU Occupancy %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Resource Utilization */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ventilatorUsage" stroke="#10B981" strokeWidth={2} name="Ventilator Usage %" />
                <Line type="monotone" dataKey="oxygenUsage" stroke="#F59E0B" strokeWidth={2} name="Oxygen Usage %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capacity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bed Capacity</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={capacityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ICU Capacity</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={icuCapacityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {icuCapacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ventilators</span>
                <span className="text-sm font-medium">{currentData.used_ventilators}/{currentData.total_ventilators}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${ventilatorUtilization}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Oxygen Cylinders</span>
                <span className="text-sm font-medium">{currentData.used_oxygen_cylinders}/{currentData.total_oxygen_cylinders}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${oxygenUtilization}%` }}
                ></div>
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