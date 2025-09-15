import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PrescriptionContext } from '../context/PrescriptionContext';
import medicinesData from '../medicine.json';

const TreatmentInfo = () => {
  const navigate = useNavigate();
  const {
    prescriptionData,
    updateNestedPrescriptionData,
    updateArrayField,
    addArrayItem,
    removeArrayItem
  } = useContext(PrescriptionContext);

  // Local state for suggestions
  const [activeSuggestions, setActiveSuggestions] = useState({});
  const [suggestionPositions, setSuggestionPositions] = useState({});

  const sectionContainerRef = useRef(null);
  const inputRefs = useRef([]);

  // Common investigation types
  const commonInvestigations = [
    "Clinical Pathology", "Cytology", "Radiology and Imaging",
    "Microbiology", "Histopathology", "Biochemistry",
    "Hematology", "Immunology", "Molecular Diagnostics"
  ];

  // Common diagnosis suggestions
  const commonDiagnosis = [
    "Hypertension", "Diabetes Mellitus", "Asthma",
    "Coronary Artery Disease", "Chronic Kidney Disease",
    "Osteoarthritis", "Rheumatoid Arthritis", "Hyperlipidemia",
    "Anxiety Disorder", "Depression"
  ];

  // Add new medication
  const addMedication = () => {
    addArrayItem('treatment', 'medications', {
      genericName: '',
      brandName: '',
      manufacturer: '',
      dosage: '',
      administrationTime: '',
      duration: '',
      instructions: ''
    });
  };

  // Remove medication
  const removeMedication = (index) => {
    if (prescriptionData.treatment.medications.length <= 1) return;
    removeArrayItem('treatment', 'medications', index);
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (index, medData) => {
    updateArrayField('treatment', 'medications', index, 'genericName', medData.genericName);
    updateArrayField('treatment', 'medications', index, 'brandName', medData.brandName);
    updateArrayField('treatment', 'medications', index, 'manufacturer', medData.manufacturer);
    updateArrayField('treatment', 'medications', index, 'dosage', medData.dosage);
    updateArrayField('treatment', 'medications', index, 'administrationTime', medData.administrationTime);
    updateArrayField('treatment', 'medications', index, 'duration', medData.duration);
    updateArrayField('treatment', 'medications', index, 'instructions', medData.instructions);

    setActiveSuggestions((prev) => ({ ...prev, [index]: false }));
  };

  const updateSuggestionPosition = (index) => {
    if (inputRefs.current[index]) {
      const rect = inputRefs.current[index].getBoundingClientRect();
      const estimatedHeight = 200;
      let top = rect.bottom;
      if (rect.bottom + estimatedHeight > window.innerHeight) {
        top = rect.top - estimatedHeight;
      }
      setSuggestionPositions((prev) => ({ ...prev, [index]: { top, left: rect.left } }));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      Object.keys(activeSuggestions).forEach((idx) => {
        const index = parseInt(idx, 10);
        if (activeSuggestions[index]) {
          updateSuggestionPosition(index);
        }
      });
    };

    const container = sectionContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [activeSuggestions]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Treatment Information</h2>

      {/* Investigations Section */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Investigations</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Common Investigations</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 bg-white"
              onChange={(e) => {
                if (e.target.value && !prescriptionData.treatment.investigations.includes(e.target.value)) {
                  updateNestedPrescriptionData('treatment', 'investigations', [...prescriptionData.treatment.investigations, e.target.value]);
                  e.target.value = '';
                }
              }}
            >
              <option value="">Select investigation...</option>
              {commonInvestigations.map((investigation, index) => (
                <option key={index} value={investigation}>{investigation}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Investigation</label>
            <div className="flex">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-l-md p-2"
                placeholder="Enter investigation name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    updateNestedPrescriptionData('treatment', 'investigations', [...prescriptionData.treatment.investigations, e.target.value]);
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                className="bg-blue-500 text-white px-3 py-2 rounded-r-md"
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter investigation name"]');
                  if (input.value) {
                    updateNestedPrescriptionData('treatment', 'investigations', [...prescriptionData.treatment.investigations, input.value]);
                    input.value = '';
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Investigations</h4>
          {prescriptionData.treatment.investigations.length === 0 ? (
            <p className="text-gray-500 text-sm">No investigations added</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {prescriptionData.treatment.investigations.map((investigation, index) => (
                <div key={index} className="bg-white px-3 py-1 rounded-full border flex items-center">
                  <span className="mr-2">{investigation}</span>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      updateNestedPrescriptionData('treatment', 'investigations',
                        prescriptionData.treatment.investigations.filter((_, i) => i !== index));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Diagnosis Section */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Diagnosis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Common Diagnosis</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 bg-white"
              onChange={(e) => {
                if (e.target.value && !prescriptionData.treatment.diagnosis.includes(e.target.value)) {
                  updateNestedPrescriptionData('treatment', 'diagnosis', [...prescriptionData.treatment.diagnosis, e.target.value]);
                  e.target.value = '';
                }
              }}
            >
              <option value="">Select diagnosis...</option>
              {commonDiagnosis.map((diagnosis, index) => (
                <option key={index} value={diagnosis}>{diagnosis}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Diagnosis</label>
            <div className="flex">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-l-md p-2"
                placeholder="Enter diagnosis"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    updateNestedPrescriptionData('treatment', 'diagnosis', [...prescriptionData.treatment.diagnosis, e.target.value]);
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                className="bg-blue-500 text-white px-3 py-2 rounded-r-md"
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter diagnosis"]');
                  if (input.value) {
                    updateNestedPrescriptionData('treatment', 'diagnosis', [...prescriptionData.treatment.diagnosis, input.value]);
                    input.value = '';
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Diagnosis</h4>
          {prescriptionData.treatment.diagnosis.length === 0 ? (
            <p className="text-gray-500 text-sm">No diagnosis added</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {prescriptionData.treatment.diagnosis.map((diagnosis, index) => (
                <div key={index} className="bg-white px-3 py-1 rounded-full border flex items-center">
                  <span className="mr-2">{diagnosis}</span>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      updateNestedPrescriptionData('treatment', 'diagnosis',
                        prescriptionData.treatment.diagnosis.filter((_, i) => i !== index));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Medications Section - Changed to Card Layout */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50" ref={sectionContainerRef}>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Medications</h3>

        <div className="space-y-6">
          {prescriptionData.treatment.medications.map((med, index) => {
            const filteredSuggestions = medicinesData.filter(m =>
              med.genericName &&
              m.genericName.toLowerCase().startsWith(med.genericName.toLowerCase())
            ).slice(0, 10);

            return (
              <div key={index} className="bg-white p-4 rounded-md shadow-sm border">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-800">Medication {index + 1}</h4>
                  <button
                    type="button"
                    className={`text-red-500 hover:text-red-700 ${prescriptionData.treatment.medications.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => removeMedication(index)}
                    disabled={prescriptionData.treatment.medications.length <= 1}
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Generic Name with suggestions */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={med.genericName}
                      ref={(el) => (inputRefs.current[index] = el)}
                      onChange={(e) => {
                        updateArrayField('treatment', 'medications', index, 'genericName', e.target.value);
                        if (e.target.value.length > 0) {
                          setActiveSuggestions((prev) => ({ ...prev, [index]: true }));
                          updateSuggestionPosition(index);
                        } else {
                          setActiveSuggestions((prev) => ({ ...prev, [index]: false }));
                        }
                      }}
                      onBlur={() => setTimeout(() => setActiveSuggestions((prev) => ({ ...prev, [index]: false })), 200)}
                    />
                    {activeSuggestions[index] && filteredSuggestions.length > 0 && suggestionPositions[index] && (
                      <ul
                        className="absolute bg-white border border-gray-300 w-full max-h-40 overflow-y-auto z-50 shadow-lg rounded-md mt-1"
                        style={{
                          top: `${suggestionPositions[index].top - suggestionPositions[index].top + 40}px`, // Adjust relative to input
                          left: `${suggestionPositions[index].left - suggestionPositions[index].left}px`,
                        }}
                      >
                        {filteredSuggestions.map((s, sIndex) => (
                          <li
                            key={sIndex}
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                            onClick={() => handleSelectSuggestion(index, s)}
                          >
                            <strong>{s.genericName}</strong> — {s.brandName} ({s.manufacturer})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={med.brandName}
                      onChange={(e) => updateArrayField('treatment', 'medications', index, 'brandName', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={med.manufacturer}
                      onChange={(e) => updateArrayField('treatment', 'medications', index, 'manufacturer', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={med.dosage}
                      onChange={(e) => updateArrayField('treatment', 'medications', index, 'dosage', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={med.administrationTime}
                      onChange={(e) => updateArrayField('treatment', 'medications', index, 'administrationTime', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={med.duration}
                      onChange={(e) => updateArrayField('treatment', 'medications', index, 'duration', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={med.instructions}
                      onChange={(e) => updateArrayField('treatment', 'medications', index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={addMedication}
        >
          + Add Medication
        </button>
      </div>

      {/* Dos and Don'ts Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Do's</h3>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 h-32"
            value={prescriptionData.treatment.dos}
            onChange={(e) => updateNestedPrescriptionData('treatment', 'dos', e.target.value)}
            placeholder="Enter recommended actions..."
          />
        </div>

        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Don'ts</h3>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 h-32"
            value={prescriptionData.treatment.donts}
            onChange={(e) => updateNestedPrescriptionData('treatment', 'donts', e.target.value)}
            placeholder="Enter actions to avoid..."
          />
        </div>
      </div>

      {/* Follow Up Section */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Follow Up</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow Up Date</label>
            <DatePicker
              selected={prescriptionData.treatment.followUpDate ? new Date(prescriptionData.treatment.followUpDate) : null}
              onChange={(date) => updateNestedPrescriptionData('treatment', 'followUpDate', date ? date.toISOString().split('T')[0] : null)}
              minDate={new Date()}
              className="w-full border border-gray-300 rounded-md p-2"
              dateFormat="dd/MM/yyyy"
              placeholderText="Select follow up date"
              isClearable
              showPopperArrow={false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2"
              rows={3}
              value={prescriptionData.treatment.followUp}
              onChange={(e) => updateNestedPrescriptionData('treatment', 'followUp', e.target.value)}
              placeholder="Enter follow up instructions..."
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
          onClick={() => navigate('/medical-info')}
        >
          ← Previous
        </button>

        <button
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md"
          onClick={() => navigate('/prescription-review')}
        >
          Review Prescription →
        </button>
      </div>
    </div>
  );
};

export default TreatmentInfo;