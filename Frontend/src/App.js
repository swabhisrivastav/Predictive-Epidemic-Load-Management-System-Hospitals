import React from 'react';
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import CovidDashboard from './Components/DashboardCovid';
import NationalOverview from './Components/NationalOverview';
import DistrictOverview from './Components/DistrictOverview';
import HospitalResources from './Components/resources';
import Sidebar from './Components/Sidebar';
import TopNavbar from './Components/TopNavbar';  
import Dengue_Dashboard from './Components/DashboardDengue';
import AddHospitalResource from './Components/AddResources';
import AISupportBot from './Components/Recommendation_bot';
import AuthModel from './Components/Auth';
import LandingPage from './Components/LandingPage';

const App = () => {
  const location = useLocation();
  const hideLayout = ['/LandingPage', '/auth'].includes(location.pathname);

  return (
    <div className="d-flex">
      {!hideLayout && <Sidebar />}
      <div className="flex-grow-1">
        {!hideLayout && <TopNavbar />}
        <main style={{ marginTop: hideLayout ? '0' : '80px', padding: '2rem' }}>
          <Routes>
            <Route path="/covid" element={<CovidDashboard />} />
            <Route path="/national" element={<NationalOverview />} />
            <Route path="/district" element={<DistrictOverview />} />
            <Route path="/hospital" element={<HospitalResources />} />
            <Route path="/" element={<Dengue_Dashboard />}/>
            <Route path="/AddResource" element={<AddHospitalResource/>}/>
            <Route path="/auth" element={<AuthModel/>}/>
            <Route path="/LandingPage" element={<LandingPage/>}/>
          </Routes>
        </main>

        {/* Chatbot positioned in bottom right corner */}
        {!hideLayout && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <AISupportBot />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
