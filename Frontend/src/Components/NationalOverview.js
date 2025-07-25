import React, { useEffect, useState } from "react";

const NationalOverview = () => {
  const [summary, setSummary] = useState(null);
  const [plots, setPlots] = useState({});

  useEffect(() => {
    // Fetch national summary
    fetch("http://localhost:8002/api/national/summary")
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch(console.error);

    // Fetch all plots in one request
    fetch("http://localhost:8002/api/national/plots")
      .then((res) => res.json())
      .then((data) => {
        const formattedPlots = {};
        for (const key in data) {
          formattedPlots[key] = `data:image/png;base64,${data[key]}`;
        }
        setPlots(formattedPlots);
      })
      .catch(console.error);
  }, []);

  // plot titles
  const plotTitles = {
    new_cases_bar: "Daily New COVID-19 Cases (Last 30 Days)",
    total_vs_new: "Total vs New Cases Over Time",
    total_cases_line: "Cumulative Total COVID-19 Cases",
    new_cases_line: "Daily New COVID-19 Cases Over Time"
  };

  return (
    <div style={{ padding: "2rem", marginLeft: "350px" }}>
      <h2>National COVID-19 Overview</h2>

      {summary && (
        <div style={{ marginBottom: "2rem", lineHeight: "1.8" }}>
          <strong>Country:</strong> {summary.country} <br />
          <strong>Total Cases:</strong> {(summary.total_cases ?? 0).toLocaleString()} <br />
          <strong>New Cases:</strong> {(summary.new_cases ?? 0).toLocaleString()} <br />
          <strong>Active:</strong> {(summary.active ?? 0).toLocaleString()} <br />
          <strong>Recovered:</strong> {(summary.recovered ?? 0).toLocaleString()} <br />
          <strong>Deaths:</strong> {(summary.deaths ?? 0).toLocaleString()} <br />
          <strong>Last Updated:</strong> {summary.last_updated ?? "Unknown"}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        {Object.keys(plots).map((plotKey) => (
          <div key={plotKey}>
            <h4>{plotTitles[plotKey] || plotKey}</h4>
            <img
              src={plots[plotKey]}
              alt={`Plot: ${plotKey}`}
              style={{ maxWidth: "100%", border: "1px solid #ccc", borderRadius: "6px" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NationalOverview;
