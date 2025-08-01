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

  const handleSubmit = async (e) => {
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

    // Prepare final data
    const finalData = {
      ...formData,
      ...derivedFields
    };

    try {
      const response = await fetch("http://localhost:8002/api/resources/hospital-resources/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Submission failed:", errorData);
        alert("Error submitting data.");
        return;
      }

      setSubmitted(true);
      setTimeout(() => navigate(-1), 2000);
    } catch (error) {
      console.error("Network error:", error);
      alert("Failed to submit. Please try again.");
    }
  };

  const handleClose = () => navigate(-1);

  const derivedFields = {
    occupied_beds: Number(formData.total_beds) - Number(formData.available_beds),
    occupied_icu_beds: Number(formData.icu_beds) - Number(formData.available_icu_beds),
    used_ventilators: Number(formData.total_ventilators) - Number(formData.available_ventilators),
    used_oxygen_cylinders: Number(formData.total_oxygen_cylinders) - Number(formData.available_oxygen_cylinders),
    staff_reduction_factor: calculateStaffReductionFactor().toFixed(3),
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          Add Hospital Resources
        </h2>

        {submitted ? (
          <div className="text-green-600 text-center font-semibold">Submitted!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 📅 Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">📅 Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full md:w-1/2 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 🛏️ Beds Section */}
            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="font-semibold text-gray-700 px-2 text-lg">🛏️ Beds</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Total Beds</label>
                  <input
                    type="number"
                    name="total_beds"
                    value={formData.total_beds}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available Beds</label>
                  <input
                    type="number"
                    name="available_beds"
                    value={formData.available_beds}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Occupied Beds:</strong> {isNaN(derivedFields.occupied_beds) ? "-" : derivedFields.occupied_beds}
              </div>
            </fieldset>

            {/* 🏥 ICU Beds Section */}
            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="font-semibold text-gray-700 px-2 text-lg">🏥 ICU Beds</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Total ICU Beds</label>
                  <input
                    type="number"
                    name="icu_beds"
                    value={formData.icu_beds}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available ICU Beds</label>
                  <input
                    type="number"
                    name="available_icu_beds"
                    value={formData.available_icu_beds}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Occupied ICU Beds:</strong> {isNaN(derivedFields.occupied_icu_beds) ? "-" : derivedFields.occupied_icu_beds}
              </div>
            </fieldset>

            {/* 🫁 Equipment Section */}
            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="font-semibold text-gray-700 px-2 text-lg">🫁 Equipment</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Total Ventilators</label>
                  <input
                    type="number"
                    name="total_ventilators"
                    value={formData.total_ventilators}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available Ventilators</label>
                  <input
                    type="number"
                    name="available_ventilators"
                    value={formData.available_ventilators}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Oxygen Cylinders</label>
                  <input
                    type="number"
                    name="total_oxygen_cylinders"
                    value={formData.total_oxygen_cylinders}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available Oxygen Cylinders</label>
                  <input
                    type="number"
                    name="available_oxygen_cylinders"
                    value={formData.available_oxygen_cylinders}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded space-y-1">
                <div><strong>Used Ventilators:</strong> {isNaN(derivedFields.used_ventilators) ? "-" : derivedFields.used_ventilators}</div>
                <div><strong>Used Oxygen Cylinders:</strong> {isNaN(derivedFields.used_oxygen_cylinders) ? "-" : derivedFields.used_oxygen_cylinders}</div>
              </div>
            </fieldset>

            {/* 👩‍⚕️ Staff Section */}
            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="font-semibold text-gray-700 px-2 text-lg">👩‍⚕️ Staff</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Total Doctors</label>
                  <input
                    type="number"
                    name="total_doctors"
                    value={formData.total_doctors}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available Doctors</label>
                  <input
                    type="number"
                    name="available_doctors"
                    value={formData.available_doctors}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Nurses</label>
                  <input
                    type="number"
                    name="total_nurses"
                    value={formData.total_nurses}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available Nurses</label>
                  <input
                    type="number"
                    name="available_nurses"
                    value={formData.available_nurses}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total ICU Nurses</label>
                  <input
                    type="number"
                    name="total_icu_nurses"
                    value={formData.total_icu_nurses}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available ICU Nurses</label>
                  <input
                    type="number"
                    name="available_icu_nurses"
                    value={formData.available_icu_nurses}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Staff Reduction Factor:</strong> {calculateStaffReductionFactor().toFixed(3)}
              </div>
            </fieldset>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Submit Resources
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddHospitalResource;