import React, { useEffect, useState } from "react";
import { AlertTriangle, Activity, TrendingUp, Users, Bed, Zap, Heart, UserCheck, Calendar, MapPin, ChevronRight } from "lucide-react";

const Dengue_Dashboard = () => {
  const [currentCases, setCurrentCases] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [plotImage, setPlotImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState(null);
  const [overloadData, setOverloadData] = useState(null);

  //const overloadPrediction = {
   // risk_level: "moderate",
    //risk_score: 65,
    //days_to_overload: 5,
   // critical_resources: ["ICU Beds", "Ventilators"]
  //};
  const overloadPrediction = overloadData || {
    risk: "loading",
    days_to_overload: null,
    critical_resources: []
  };


  useEffect(() => {
    // Fetch current dengue cases
    fetch("http://localhost:8002/api/dengue/current")
      .then((res) => res.json())
      .then((data) => setCurrentCases(data))
      .catch((err) => console.error("Failed to fetch current dengue cases", err));

    // Fetch forecasted cases
    fetch("http://localhost:8002/api/dengue/predict")
      .then((res) => res.json())
      .then((data) => setForecast(data))
      .catch((err) => console.error("Failed to fetch forecast", err));

    // Fetch forecast plot (base64 image)
    fetch("http://localhost:8002/api/dengue/plot_base64")
      .then((res) => res.json())
      .then((data) => {
        if (data.image) {
          setPlotImage(`data:image/png;base64,${data.image}`);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dengue plot", err);
        setLoading(false);
      });
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
      setCurrentData(transformed);
    })
    .catch(error => console.error("Failed to fetch hospital resource data:", error));

    // fetch overload
    fetch("http://localhost:8002/api/overload/overload_risk")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch overload data");
      return res.json();
    })
    .then((data) => setOverloadData(data))
    .catch((err) => console.error("Overload API error:", err));

  }, []);

  const getRiskColor = (risk) => {
    switch (risk) {
      case "low": return "text-green-600 bg-green-50 border-green-200";
      case "moderate": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return "bg-red-500";
    if (utilization >= 60) return "bg-yellow-500";
    if (utilization >= 40) return "bg-orange-500";
    return "bg-green-500";
  };

  const totalCurrentCases = currentCases.reduce((sum, item) => sum + (item.reported_cases || 0), 0);
  const totalForecastCases = forecast.reduce((sum, item) => sum + (item.cases_predicted || 0), 0);
  const latestWeekCases = currentCases.length > 0 ? currentCases[0].reported_cases : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dengue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{marginLeft: "300px" }}>
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dengue Epidemic Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span></span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Last Updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Latest Week Cases</p>
                <p className="text-3xl font-bold text-gray-900">{latestWeekCases}</p>
                <p className="text-sm text-gray-500 mt-1">Most recent week</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Historical</p>
                <p className="text-3xl font-bold text-gray-900">{totalCurrentCases}</p>
                <p className="text-sm text-gray-500 mt-1">Sum of recent weeks</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">4-Week Forecast</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(totalForecastCases)}</p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  Total predicted cases
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Risk Level</p>
                <p className={`text-2xl font-bold capitalize ${getRiskColor(overloadPrediction.risk)}`}>
                {overloadPrediction.risk}
                </p>
                <p className="text-sm text-gray-500 mt-1">Overload risk</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full flex items-center justify-center">
              {overloadPrediction.risk !== 'low' && (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
            </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Days to Overload</p>
                <p className="text-3xl font-bold text-gray-900">{overloadPrediction.days_to_overload}</p>
                <p className="text-sm text-gray-500 mt-1">At current rate</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Case Overview & Forecast */}
          <div className="lg:col-span-2 space-y-6">
            {/* Forecast Plot */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Dengue Cases Forecast</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Activity className="h-4 w-4 mr-1" />
                  <span>4-Week Prediction</span>
                </div>
              </div>
              {plotImage ? (
                <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                  <img 
                    src={plotImage} 
                    alt="Dengue forecast plot" 
                    className="max-w-3xl w-full h-auto rounded-lg"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Forecast plot loading...</p>
                </div>
              )}
            </div>

            {/* Weekly Data Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Cases Table */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Weekly Cases</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cases</th>
                        {/*<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>*/}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentCases.map((item, index) => {
                        const prevWeekCases = currentCases[index + 1]?.reported_cases || 0;
                        const change = prevWeekCases ? ((item.reported_cases - prevWeekCases) / prevWeekCases * 100).toFixed(1) : 0;
                        const changeColor = change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600';
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.reported_cases}
                            </td>
                            {/*<td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${changeColor}`}>
                              {change > 0 ? '+' : ''}{change}%
                            </td>*/}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                            {new Date(item.prediction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.round(item.cases_predicted)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {Math.round(item.lower_ci)}-{Math.round(item.upper_ci)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Hospital Resources & Overload Prediction */}
          <div className="space-y-6">
            {/* Hospital Resource Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hospital Resources</h3>
              </div>
              <div className="space-y-4">
                {currentData && Object.entries(currentData).map(([key, resource]) => (
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
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {key.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {resource.available}/{resource.total} available
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{resource.utilization}%</p>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${getUtilizationColor(resource.utilization)}`}
                          style={{ width: `${resource.utilization}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overload Prediction */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overload Prediction</h3>
              <div className={`p-4 rounded-lg border-2 ${getRiskColor(overloadPrediction.risk)} mb-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {overloadPrediction.risk !== 'low' && (
                      <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                     )}
                    <span className="font-semibold capitalize">{overloadPrediction.risk} Risk</span>
                  </div>
                </div>
                <p className="text-sm mt-2">
                  Predicted overload in {overloadPrediction.days_to_overload} days at current rate
                </p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Critical Resources</h4>
                <div className="flex flex-wrap gap-2">
                  {overloadPrediction.critical_resources.map((resource, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Dengue_Dashboard;