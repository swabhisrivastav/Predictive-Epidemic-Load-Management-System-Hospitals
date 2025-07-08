import React from "react";

const Sidebar = () => {
  return (
    <div
      id="sidenav-1"
      className="sidenav"
      data-mdb-sidenav-init
      data-mdb-color="dark"
      role="navigation"
      data-mdb-hidden="false"
      data-mdb-accordion="true"
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "1.5rem 1rem",
        width: "700px",
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000
      }}
    >
      {/* Sidebar Title */}
      <div className="mb-4" style={{ marginTop: "70px" }}>
        <h4 style={{ fontWeight: "bold", color: "#0d6efd",fontSize: "3rem" }}>
           Epidemic Load<br />Management System
        </h4>
      </div>

      {/* Sidebar Links */}
      <ul className="sidenav-menu list-unstyled">
        <li className="sidenav-item mb-3" style={{ marginBottom: "4rem" }}>
          <a className="sidenav-link" href="/" style={{ color: "#333", fontSize: "3rem" ,marginBottom: "4rem"}}>
            <i className="fas fa-home fa-fw me-3"></i> Home
          </a>
        </li>
        <li className="sidenav-item mb-3" style={{ marginBottom: "3rem" }}>
          <a className="sidenav-link" href="/national" style={{ color: "#333", fontSize: "3rem" }}>
            <i className="fas fa-chart-line fa-fw me-3"></i> National Trend
          </a>
        </li>
        <li className="sidenav-item mb-3" style={{ marginBottom: "1rem" }}>
          <a className="sidenav-link" href="/district" style={{ color: "#333", fontSize: "3rem" }}>
            <i className="fas fa-city fa-fw me-3"></i> District Trend
          </a>
        </li>
        <li className="sidenav-item mb-3" style={{ marginBottom: "1rem" }}>
          <a className="sidenav-link" href="/hospital" style={{ color: "#333", fontSize: "3rem" }}>
            <i className="fas fa-hospital fa-fw me-3"></i> My Hospital
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
