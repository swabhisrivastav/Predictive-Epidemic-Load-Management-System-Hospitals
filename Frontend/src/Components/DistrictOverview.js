import React, { useEffect, useState } from "react";

const DistrictOverview = () => {
  const [plots, setPlots] = useState({});

  useEffect(() => {
    fetch("http://localhost:8002/api/district/bangalore/plots")
      .then((res) => res.json())
      .then((data) => setPlots(data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: "2rem",marginLeft: "350px" }}>
      <h2>Bangalore Urban District Overview</h2>
      {Object.keys(plots).map((key) => (
        <div key={key} style={{ marginBottom: "2rem" }}>
          <h4>{key.replace(/_/g, " ")}</h4>
          <img
            src={`data:image/png;base64,${plots[key]}`}
            alt={key}
            style={{ maxWidth: "100%", border: "1px solid #ccc" }}
          />
        </div>
      ))}
    </div>
  );
};

export default DistrictOverview;
