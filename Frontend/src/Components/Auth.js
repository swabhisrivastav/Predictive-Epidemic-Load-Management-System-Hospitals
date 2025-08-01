// AuthPage.js
import React, { useState } from 'react';
import { Eye, EyeOff, Hospital, Mail, Lock, MapPin, Building2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState({
    login_id: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    hospital_name: '',
    hospital_code: '',
    password: '',
    location: '',
    email: ''
  });

  const resetForms = () => {
    setLoginData({ login_id: '', password: '' });
    setSignupData({ hospital_name: '', hospital_code: '', password: '', location: '', email: '' });
    setErrors({});
    setShowPassword(false);
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    resetForms();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('Must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Must contain at least one lowercase letter');
    if (!/\d/.test(password)) errors.push('Must contain at least one digit');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Must contain at least one special character');
    return errors;
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrors({});

    if (!loginData.login_id || !loginData.password) {
      setErrors({ general: 'Please fill in all fields' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8002/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('hospital_id', data.hospital_id);
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/'); // Redirect to dashboard on success
      } else {
        setErrors({ general: data.detail || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors = {};
    if (!signupData.hospital_name) newErrors.hospital_name = 'Hospital name is required';
    if (!signupData.hospital_code) newErrors.hospital_code = 'Hospital code is required';
    if (!signupData.location) newErrors.location = 'Location is required';
    if (!signupData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signupData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordErrors = validatePassword(signupData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors[0];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8002/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLogin(true);
        resetForms();
        setErrors({ general: 'Signup successful! Please login with your credentials.' });
      } else {
        setErrors({ general: data.detail || 'Signup failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header with back button */}
        <div className="bg-blue-600 py-4 px-6 relative">
          <button 
            onClick={() => navigate('/LandingPage')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              isLogin
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              !isLogin
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {errors.general && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              errors.general.includes('successful') 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {errors.general}
            </div>
          )}

          {isLogin ? (
            // Login Form
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Code or Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={loginData.login_id}
                    onChange={(e) => setLoginData({ ...loginData, login_id: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter hospital code or email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          ) : (
            // Signup Form
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={signupData.hospital_name}
                    onChange={(e) => setSignupData({ ...signupData, hospital_name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.hospital_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter hospital name"
                  />
                </div>
                {errors.hospital_name && <p className="text-red-500 text-xs mt-1">{errors.hospital_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Code
                </label>
                <div className="relative">
                  <Hospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={signupData.hospital_code}
                    onChange={(e) => setSignupData({ ...signupData, hospital_code: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.hospital_code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter unique hospital code"
                  />
                </div>
                {errors.hospital_code && <p className="text-red-500 text-xs mt-1">{errors.hospital_code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={signupData.location}
                    onChange={(e) => setSignupData({ ...signupData, location: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter hospital location"
                  />
                </div>
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Password must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          )}

          {/* Toggle Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={handleToggle}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isLogin ? 'Sign up here' : 'Login here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;