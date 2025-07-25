import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddHospitalResource = () => {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    date: today,
    total_beds: "",
    available_beds: "",
    icu_beds: "",
    available_icu_beds: "",
    total_ventilators: "",
    available_ventilators: "",
    total_oxygen_cylinders: "",
    available_oxygen_cylinders: "",
    total_doctors: "",
    available_doctors: "",
    total_nurses: "",
    available_nurses: "",
    total_icu_nurses: "",
    available_icu_nurses: "",
    staff_reduction_factor: "1.0",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const valid = [
      ["available_beds", "total_beds"],
      ["available_icu_beds", "icu_beds"],
      ["available_ventilators", "total_ventilators"],
      ["available_oxygen_cylinders", "total_oxygen_cylinders"],
      ["available_doctors", "total_doctors"],
      ["available_nurses", "total_nurses"],
      ["available_icu_nurses", "total_icu_nurses"],
    ].every(([avail, total]) => Number(formData[avail]) <= Number(formData[total]));

    if (!valid) {
      alert("Available values must be less than or equal to total values.");
      return;
    }

    console.log("Submitted:", formData);
    setSubmitted(true);
    setTimeout(() => navigate(-1), 2000);
  };

  const handleClose = () => navigate(-1);

  const derivedFields = {
    occupied_beds: formData.total_beds - formData.available_beds,
    occupied_icu_beds: formData.icu_beds - formData.available_icu_beds,
    used_ventilators: formData.total_ventilators - formData.available_ventilators,
    used_oxygen_cylinders: formData.total_oxygen_cylinders - formData.available_oxygen_cylinders,
  };
  const calculateStaffReductionFactor = () => {
    const available =
      Number(formData.available_doctors || 0) +
      Number(formData.available_icu_nurses || 0) +
      Number(formData.available_nurses || 0);

    const total =
      Number(formData.total_doctors || 0) +
      Number(formData.total_icu_nurses || 0) +
      Number(formData.total_nurses || 0);

    if (total === 0) return 0; // avoid division by zero
      return available / total;
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">
          Add Hospital Resources
        </h2>

        {submitted ? (
          <div className="text-green-600 text-center font-semibold">Submitted!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 📅 Date */}
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>

            {/* 🛏️ Beds */}
            <fieldset className="border-t pt-4">
              <legend className="font-semibold text-gray-700">🛏️ Beds</legend>
              {["total_beds", "available_beds"].map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium capitalize">{key.replace("_", " ")}</label>
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full border rounded px-3 py-2"
                    min = "0"
                  />
                </div>
              ))}
              <p className="text-sm text-gray-500">
                Occupied Beds: {isNaN(derivedFields.occupied_beds) ? "-" : derivedFields.occupied_beds}
              </p>
            </fieldset>

            {/* 🛏️ ICU Beds */}
            <fieldset className="border-t pt-4">
              <legend className="font-semibold text-gray-700">🛏️ ICU Beds</legend>
              {["icu_beds", "available_icu_beds"].map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium capitalize">{key.replace("_", " ")}</label>
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full border rounded px-3 py-2"
                    min = "0"
                  />
                </div>
              ))}
              <p className="text-sm text-gray-500">
                Occupied ICU Beds: {isNaN(derivedFields.occupied_icu_beds) ? "-" : derivedFields.occupied_icu_beds}
              </p>
            </fieldset>

            {/* 🫁 Equipment */}
            <fieldset className="border-t pt-4">
              <legend className="font-semibold text-gray-700">🫁 Equipment</legend>
              {[
                ["total_ventilators", "available_ventilators"],
                ["total_oxygen_cylinders", "available_oxygen_cylinders"],
              ].flat().map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium capitalize">{key.replace(/_/g, " ")}</label>
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full border rounded px-3 py-2"
                    min = "0"
                  />
                </div>
              ))}
              <p className="text-sm text-gray-500">
                Used Ventilators: {isNaN(derivedFields.used_ventilators) ? "-" : derivedFields.used_ventilators}
              </p>
              <p className="text-sm text-gray-500">
                Used Oxygen Cylinders: {isNaN(derivedFields.used_oxygen_cylinders) ? "-" : derivedFields.used_oxygen_cylinders}
              </p>
            </fieldset>

            {/* 👩‍⚕️ Staff */}
            <fieldset className="border-t pt-4">
              <legend className="font-semibold text-gray-700">👩‍⚕️ Staff</legend>
              {[
                ["total_doctors", "available_doctors"],
                ["total_nurses", "available_nurses"],
                ["total_icu_nurses", "available_icu_nurses"],
              ].flat().map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium capitalize">{key.replace(/_/g, " ")}</label>
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full border rounded px-3 py-2"
                    min = "0"
                  />
                </div>
              ))}
            </fieldset>
            <p>
            Staff Reduction Factor: <strong>{calculateStaffReductionFactor().toFixed(3)}</strong>
            </p>

            {/* ✅ Submit */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddHospitalResource;
