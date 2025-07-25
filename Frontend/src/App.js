import React, { Component } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import CovidDashboard from './Components/DashboardCovid';
import Login from './Components/Login';
import NationalOverview from './Components/NationalOverview';
import DistrictOverview from './Components/DistrictOverview';
import HospitalResources from './Components/resources';
import Sidebar from './Components/Sidebar';
import TopNavbar from './Components/TopNavbar';  
import Dengue_Dashboard from './Components/DashboardDengue';
import AddHospitalResource from './Components/AddResources';

class App extends Component {
  render() {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1">
          <TopNavbar />
          <main style={{ marginTop: '80px', padding: '2rem' }}>
            <Routes>
              <Route path="/covid" element={<CovidDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/national" element={<NationalOverview />} />
              <Route path="/district" element={<DistrictOverview />} />
              <Route path="/hospital" element={<HospitalResources />} />
              <Route path = "/" element= {<Dengue_Dashboard />}/>
              <Route path = "/AddResource" element= {<AddHospitalResource/>}/>
            </Routes>
          </main>
        </div>
      </div>
    );
  }
}

export default App;
