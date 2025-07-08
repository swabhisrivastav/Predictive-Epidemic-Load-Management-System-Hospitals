import React, { useEffect, useState } from "react";
import '../Stylesheets/dashboard.css';
const Dashboard = () => {
  const [nationalData, setNationalData] = useState(null);
  const [districtSummary, setDistrictSummary] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/national/summary")
      .then((res) => res.json())
      .then((data) => setNationalData(data))
      .catch((err) => console.error("Failed to fetch national data", err));

    fetch("http://localhost:8000/api/district/bangalore/summary")
      .then((res) => res.json())
      .then((data) => setDistrictSummary(data))
      .catch((err) => console.error("Failed to fetch district data", err));
  }, []);

  return (
    <div style={{ background: "#ecf0f3", minHeight: "100vh", padding: "2rem",  marginLeft: "450px"}}>
    <div className="container">
      {/* Top Bar */}
      

      {/* Welcome Message */}
      <h3>Welcome, St. John’s Medical College Hospital</h3>
      <p>
        Location: Bangalore Urban, Karnataka
        <br />
        Date: July 3, 2025
      </p>

      {/* Overview Section */}
      <hr />
      <h4 className="section-title">National & District Overview</h4>
      <div className="overview-grid">
        <div className="card">
          {nationalData ? (
            <>
              <p><strong>India-wide Cases (Today):</strong> {nationalData.total_cases.toLocaleString()}</p>
              <p><strong>National Trend:</strong> 🔺 Increasing</p>
            </>
          ) : (
            <p className="loading">Loading national data...</p>
          )}
        </div>

        <div className="card">
          {districtSummary ? (
            <>
              <p><strong>Bangalore Urban:</strong> {districtSummary.hospitalized} hospitalized on {districtSummary.date}</p>
              <p><strong>District Trend:</strong> 🔺 Spike in last 5 days</p>
            </>
          ) : (
            <p className="loading">Loading district data...</p>
          )}
        </div>
      </div>

      {/* Placeholder Sections */}
      <hr />
      <h4 className="section-title">Your Hospital Resource Summary (Live)</h4>
      <p>[Will be filled in next steps]</p>

      <h4 className="section-title">Forecasted Case Trend (District)</h4>
      <p>[Graph Placeholder]</p>

      <h4 className="section-title">System Recommendations</h4>
      <p>[Recommendations Placeholder]</p>

      <h4 className="section-title">Recent Activity</h4>
      <ul>
        <li>June 22: Surge in admissions (110 total)</li>
        <li>June 23: ICU beds hit 90% capacity</li>
        <li>June 24: Alert sent to Karnataka health admin</li>
      </ul>
    </div>
    </div>
  );
};

export default Dashboard;
