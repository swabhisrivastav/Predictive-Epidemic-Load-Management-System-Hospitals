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
  const [hospitalData, setHospitalData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [plotImage, setPlotImage] = useState("");
  const [loading, setLoading] = useState(true); 
  const [overloadData, setOverloadData] = useState(null);
  
  const overloadPrediction = overloadData || {
    risk: "loading",
    days_to_overload: null,
    critical_resources: []
  };

  useEffect(() => {
    // fetch national covid data
    fetch("http://localhost:8002/api/national/summary")
      .then((res) => res.json())
      .then((data) => setNationalData(data))
      .catch((err) => console.error("Failed to fetch national data", err));

    // fetch district covid data
    fetch("http://localhost:8002/api/district/bangalore/summary")
      .then((res) => res.json())
      .then((data) => setDistrictSummary(data))
      .catch((err) => console.error("Failed to fetch district data", err));

    // Fetch forecasted cases
    fetch("http://localhost:8002/api/predict")
      .then((res) => res.json())
      .then((data) => setForecast(data.predictions))
      .catch((err) => console.error("Failed to fetch forecast", err));

    // fetch forecast graph
    fetch("http://localhost:8002/api/forecast_plot")
      .then((res) => res.json())
      .then((data) => {
        if (data.image_base64) {
          setPlotImage(`data:image/png;base64,${data.image_base64}`);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dengue plot", err);
        setLoading(false);
      });

      // fetch overload
      fetch("http://localhost:8002/api/overload/overload_risk")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch overload data");
        return res.json();
      })
      .then((data) => setOverloadData(data))
      .catch((err) => console.error("Overload API error:", err));


     // fetch hospital resources
     fetch('http://localhost:8002/api/resources/hospital-resources/latest')
    .then(response => response.json())
    .then(data => {
      const transformed = {
        icu_beds: {
          available: data.available_icu_beds,
          total: data.icu_beds,
          utilization: Math.round((1 - data.available_icu_beds / data.icu_beds) * 100)
        },
        ventilators: {
          available: data.available_ventilators,
          total: data.total_ventilators,
          utilization: Math.round((1 - data.available_ventilators / data.total_ventilators) * 100)
        },
        oxygen_cylinders: {
          available: data.available_oxygen_cylinders,
          total: data.total_oxygen_cylinders,
          utilization: Math.round((1 - data.available_oxygen_cylinders / data.total_oxygen_cylinders) * 100)
        },
        doctors: {
          available: data.available_doctors,
          total: data.total_doctors,
          utilization: Math.round((1 - data.available_doctors / data.total_doctors) * 100)
        },
        nurses: {
          available: data.available_nurses,
          total: data.total_nurses,
          utilization: Math.round((1 - data.available_nurses / data.total_nurses) * 100)
        }
      };
      setHospitalData(transformed);
    })
    .catch(error => console.error("Failed to fetch hospital resource data:", error));
  }, []);

  const getRiskColor = (risk) => {
    switch (risk) {
      case "low": return "text-green-600 bg-green-50 border-green-200";
      case "moderate": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
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

  const firstWeekPrediction = forecast.length > 0 ? forecast[0].predicted_cases : 0;

  const fourWeekSum = forecast.slice(0, 4).reduce((sum, week) => sum + week.predicted_cases, 0);


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
          <p className="text-3xl font-bold text-gray-900">{formatNumber(nationalData.total_cases).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Bangalore Urban - Hospitalized (Today)</p>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(districtSummary.hospitalized)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Next Week Prediction</p> 
          <p className="text-3xl font-bold text-gray-900">{formatNumber(firstWeekPrediction)}</p> 
          <p className="text-sm text-green-600 mt-1">
                            <TrendingUp className="h-4 w-4 inline mr-1" />
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Risk Level</p>
          <p className={`text-2xl font-bold capitalize ${getRiskColor(overloadPrediction.risk)}`}>{overloadPrediction.risk}</p>
        </div>
      </div>

      {/* Graph Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-10 text-center">
      {loading ? (
        <p className="text-lg text-gray-600">Loading forecast graph...</p>
      ) : plotImage ? (
        <img src={plotImage} alt="Forecast Graph" className="mx-auto max-w-full h-auto" />
      ) : (
        <p className="text-lg text-gray-600">Forecast graph will be displayed here</p>
      )}
    </div>

      {/* Forecast Table */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Forecast</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forecast.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(item.predicted_cases)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round(item.confidence_lower)} - {Math.round(item.confidence_upper)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <br></br>

      {/* Hospital Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Resources</h3>
          <div className="space-y-4">
            {hospitalData && Object.entries(hospitalData).map(([key, resource]) => (
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
          <div className={`p-4 rounded-lg border-2 ${getRiskColor(overloadPrediction.risk)} mb-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span className="font-semibold capitalize">{overloadPrediction.risk} Risk</span>
              </div>
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
