import React from 'react';
import { Shield, Activity, TrendingUp, Users, MapPin, BarChart3, Clock, AlertTriangle, CheckCircle, Hospital, Zap, Eye } from 'lucide-react';

// For routing - you'll need to import useNavigate from react-router-dom
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  // Uncomment and use this for routing:
  const navigate = useNavigate();
  
  const handleAuthClick = () => {
    // For routing navigation:
    navigate('/auth');
    
  };

  const features = [
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Real-time Monitoring",
      description: "Track epidemic cases and hospital load in real-time with advanced analytics and instant alerts."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Predictive Analytics",
      description: "AI-powered forecasting helps predict case surges and resource requirements up to 4 weeks ahead."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Resource Management",
      description: "Optimize bed allocation, ventilator usage, and staff deployment across your hospital network."
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "AI Powered Insights",
      description: "Smart recommendations powered by AI to help you navigate critical overload scenarios."
    },
    
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Early Warning System",
      description: "Get notified of potential overload situations before they become critical emergencies."
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="mr-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  EpiGuard
                </h1>
                <p className="text-xs text-gray-600">Epidemic Load Management</p>
              </div>
            </div>
          
            <button
              onClick={handleAuthClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Login / Sign Up
            </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>Advanced Epidemic Management</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Protect Your
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                  Community
                </span>
                with EpiGuard
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                An advanced epidemic load management system for hospitals. 
                Monitor, predict, and respond to health crises with AI-powered insights 
                and real-time resource optimization.
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Epidemic Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              EpiGuard provides hospitals with cutting-edge tools to monitor, predict, 
              and manage epidemic loads effectively, ensuring optimal patient care and resource utilization.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-blue-200 group">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">EpiGuard</h3>
                <p className="text-gray-400 text-sm">Epidemic Load Management System</p>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 EpiGuard. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;