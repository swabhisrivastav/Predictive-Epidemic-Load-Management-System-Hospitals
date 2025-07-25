import React, { useEffect, useState } from "react";
import {
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  Bed,
  Zap,
  Heart,
  UserCheck,
  Calendar,
  ChevronRight
} from "lucide-react";

const CovidDashboard = () => {
  const [nationalData, setNationalData] = useState(null);
  const [districtSummary, setDistrictSummary] = useState(null);

  // Dummy hospital data for demo
  const hospitalResources = {
    icu_beds: { available: 25, total: 50, utilization: 50 },
    ventilators: { available: 18, total: 30, utilization: 40 },
    oxygen_cylinders: { available: 85, total: 120, utilization: 29 },
    doctors: { available: 12, total: 20, utilization: 40 },
    nurses: { available: 35, total: 60, utilization: 42 }
  };

  const overloadPrediction = {
    risk_level: "moderate",
    risk_score: 65,
    days_to_overload: 5,
    critical_resources: ["ICU Beds", "Ventilators"]
  };

  useEffect(() => {
    fetch("http://localhost:8002/api/national/summary")
      .then((res) => res.json())
      .then((data) => setNationalData(data))
      .catch((err) => console.error("Failed to fetch national data", err));

    fetch("http://localhost:8002/api/district/bangalore/summary")
      .then((res) => res.json())
      .then((data) => setDistrictSummary(data))
      .catch((err) => console.error("Failed to fetch district data", err));
  }, []);

  const getRiskColor = (level) => {
    switch (level) {
      case "low": return "text-green-600 bg-green-50 border-green-200";
      case "moderate": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return "bg-red-500";
    if (utilization >= 60) return "bg-yellow-500";
    if (utilization >= 40) return "bg-orange-500";
    return "bg-green-500";
  };

  if (!nationalData || !districtSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading COVID data...</p>
        </div>
      </div>
    );
  }

  return (
     <div style={{marginLeft: "80px" }}>
    <div className="min-h-screen bg-gray-50 ml-[260px] px-6 py-8">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-8 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">COVID-19 Dashboard</h1>
              <p className="text-sm text-gray-500">Predictive Load Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
           
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">India-wide Cases (Today)</p>
          <p className="text-3xl font-bold text-gray-900">{nationalData.total_cases.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Bangalore Urban - Hospitalized</p>
          <p className="text-3xl font-bold text-gray-900">{districtSummary.hospitalized}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Risk Level</p>
          <p className={`text-2xl font-bold capitalize ${getRiskColor(overloadPrediction.risk_level)}`}>{overloadPrediction.risk_level}</p>
        </div>
      </div>

      {/* Placeholder Graph Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-10 text-center">
        <p className="text-lg text-gray-600">Forecast graph will be displayed here</p>
      </div>

      {/* Hospital Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Resources</h3>
          <div className="space-y-4">
            {Object.entries(hospitalResources).map(([key, resource]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-white rounded-lg mr-3">
                    {key === 'icu_beds' && <Bed className="h-5 w-5 text-blue-600" />}
                    {key === 'ventilators' && <Zap className="h-5 w-5 text-purple-600" />}
                    {key === 'oxygen_cylinders' && <Heart className="h-5 w-5 text-red-600" />}
                    {key === 'doctors' && <UserCheck className="h-5 w-5 text-green-600" />}
                    {key === 'nurses' && <Users className="h-5 w-5 text-orange-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{key.replace("_", " ")}</p>
                    <p className="text-xs text-gray-500">{resource.available}/{resource.total} available</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{resource.utilization}%</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div className={`h-2 rounded-full ${getUtilizationColor(resource.utilization)}`} style={{ width: `${resource.utilization}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overload Prediction */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overload Prediction</h3>
          <div className={`p-4 rounded-lg border-2 ${getRiskColor(overloadPrediction.risk_level)} mb-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span className="font-semibold capitalize">{overloadPrediction.risk_level} Risk</span>
              </div>
              <span className="text-sm font-medium">{overloadPrediction.risk_score}%</span>
            </div>
            <p className="text-sm mt-2">
              Predicted overload in {overloadPrediction.days_to_overload} days at current rate
            </p>
          </div>

          <h4 className="text-sm font-medium text-gray-900 mb-2">Critical Resources</h4>
          <div className="flex flex-wrap gap-2">
            {overloadPrediction.critical_resources.map((resource, index) => (
              <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {resource}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CovidDashboard;
