import React, { useEffect, useState } from "react";

const NationalOverview = () => {
  const [summary, setSummary] = useState(null);
  const [plots, setPlots] = useState({});

  useEffect(() => {
    // Fetch national summary
    fetch("http://localhost:8000/api/national/summary")
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch(console.error);

    // Fetch all plots
    const plotEndpoints = ["plot1", "plot2", "plot3", "plot4"];
    plotEndpoints.forEach((plotKey) => {
      fetch(`http://localhost:8000/api/national/${plotKey}`)
        .then((res) => res.json())
        .then((data) =>
          setPlots((prev) => ({
            ...prev,
            [plotKey]: `data:image/png;base64,${data.image_base64}`,
          }))
        )
        .catch(console.error);
    });
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2> National COVID-19 Overview</h2>

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
            <img
              src={plots[plotKey]}
              alt={`Plot ${plotKey}`}
              style={{ maxWidth: "100%", border: "1px solid #ccc" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NationalOverview;
