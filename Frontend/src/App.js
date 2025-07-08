import React, { Component } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import Login from './Components/Login';
import NationalOverview from './Components/NationalOverview';
import DistrictOverview from './Components/DistrictOverview';
import HospitalResources from './Components/resources';
import Sidebar from './Components/Sidebar';
import TopNavbar from './Components/TopNavbar';  

class App extends Component {
  render() {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1">
          <TopNavbar />
          <main style={{ marginTop: '80px', padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/national" element={<NationalOverview />} />
              <Route path="/district" element={<DistrictOverview />} />
              <Route path="/hospital" element={<HospitalResources />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }
}

export default App;
