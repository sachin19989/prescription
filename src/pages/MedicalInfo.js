import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrescriptionContext } from '../context/PrescriptionContext';

const MedicalInfo = () => {
  const navigate = useNavigate();
  const {
    prescriptionData,
    updateNestedPrescriptionData,
    updateArrayField,
    addArrayItem,
    removeArrayItem
  } = useContext(PrescriptionContext);

  // Common drug options for hypersensitivity
  const commonDrugs = [
    'Penicillin',
    'Aspirin',
    'Ibuprofen',
    'Sulfa drugs',
    'Codeine',
    'Morphine',
    'Latex',
    'NSAIDs',
    'Cephalosporins',
    'Local anesthetics'
  ];

  // Toggle normal/abnormal for physical exam
  const toggleExamNormal = (field) => {
    updateNestedPrescriptionData('medical', 'physicalExam', {
      ...prescriptionData.medical.physicalExam,
      [field]: {
        ...prescriptionData.medical.physicalExam[field],
        normal: !prescriptionData.medical.physicalExam[field].normal
      }
    });
  };

  // Add drug to hypersensitivity list
  const addDrug = (drug) => {
    if (drug && !prescriptionData.medical.hypersensitivity.drugs.includes(drug)) {
      updateNestedPrescriptionData('medical', 'hypersensitivity', {
        ...prescriptionData.medical.hypersensitivity,
        drugs: [...prescriptionData.medical.hypersensitivity.drugs, drug],
        customDrug: ''
      });
    }
  };

  // Add custom drug to hypersensitivity list
  const addCustomDrug = () => {
    const drug = prescriptionData.medical.hypersensitivity.customDrug.trim();
    if (drug && !prescriptionData.medical.hypersensitivity.drugs.includes(drug)) {
      updateNestedPrescriptionData('medical', 'hypersensitivity', {
        ...prescriptionData.medical.hypersensitivity,
        drugs: [...prescriptionData.medical.hypersensitivity.drugs, drug],
        customDrug: ''
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 underline">Medical Information</h2>
      
      <div className="mb-6">
        <h3 className="font-bold mb-2 underline">Chief Complaints</h3>
        <div className="space-y-2">
          {prescriptionData.medical.chiefComplaints.map((complaint, index) => (
            <div key={index} className="flex items-center">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md p-2"
                value={complaint}
                onChange={(e) => {
                  const newComplaints = [...prescriptionData.medical.chiefComplaints];
                  newComplaints[index] = e.target.value;
                  updateNestedPrescriptionData('medical', 'chiefComplaints', newComplaints);
                }}
                placeholder="Enter chief complaint"
              />
              <button
                type="button"
                className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => {
                  const newComplaints = [...prescriptionData.medical.chiefComplaints];
                  newComplaints.splice(index, 1);
                  updateNestedPrescriptionData('medical', 'chiefComplaints', newComplaints);
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => {
              const newComplaints = [...prescriptionData.medical.chiefComplaints, ''];
              updateNestedPrescriptionData('medical', 'chiefComplaints', newComplaints);
            }}
          >
            Add Complaint
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-bold mb-2 underline">Past Medical History</h3>
        <div className="flex items-center mb-2">
          <label className="mr-2">Has past medical history?</label>
          <select
            className="border border-gray-300 rounded-md p-1"
            value={prescriptionData.medical.pastMedicalHistory.hasHistory ? 'Yes' : 'No'}
            onChange={(e) => updateNestedPrescriptionData('medical', 'pastMedicalHistory', {
              ...prescriptionData.medical.pastMedicalHistory,
              hasHistory: e.target.value === 'Yes'
            })}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        
        {prescriptionData.medical.pastMedicalHistory.hasHistory && (
          <div className="space-y-4">
            {prescriptionData.medical.pastMedicalHistory.conditions.map((condition, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 border p-3 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name of Condition</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={condition.name}
                    onChange={(e) => updateArrayField('medical', 'pastMedicalHistory', 'conditions', index, 'name', e.target.value)}
                    placeholder="Condition name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={condition.date}
                    onChange={(e) => updateArrayField('medical', 'pastMedicalHistory', 'conditions', index, 'date', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Month</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={condition.month}
                    onChange={(e) => updateArrayField('medical', 'pastMedicalHistory', 'conditions', index, 'month', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={condition.year}
                    onChange={(e) => updateArrayField('medical', 'pastMedicalHistory', 'conditions', index, 'year', e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Medication</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={condition.medication}
                    onChange={(e) => updateArrayField('medical', 'pastMedicalHistory', 'conditions', index, 'medication', e.target.value)}
                    placeholder="Medication details"
                  />
                </div>
                
                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="button"
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => removeArrayItem('medical', 'pastMedicalHistory', 'conditions', index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => addArrayItem('medical', 'pastMedicalHistory', 'conditions', {
                name: '',
                date: '',
                month: '',
                year: '',
                medication: ''
              })}
            >
              Add Condition
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="font-bold mb-2 underline">Past Surgical History</h3>
        <div className="flex items-center mb-2">
          <label className="mr-2">Has past surgical history?</label>
          <select
            className="border border-gray-300 rounded-md p-1"
            value={prescriptionData.medical.pastSurgicalHistory.hasHistory ? 'Yes' : 'No'}
            onChange={(e) => updateNestedPrescriptionData('medical', 'pastSurgicalHistory', {
              ...prescriptionData.medical.pastSurgicalHistory,
              hasHistory: e.target.value === 'Yes'
            })}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        
        {prescriptionData.medical.pastSurgicalHistory.hasHistory && (
          <div className="space-y-4">
            {prescriptionData.medical.pastSurgicalHistory.surgeries.map((surgery, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 border p-3 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type of Surgery</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={surgery.type}
                    onChange={(e) => updateArrayField('medical', 'pastSurgicalHistory', 'surgeries', index, 'type', e.target.value)}
                    placeholder="Surgery type"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={surgery.date}
                    onChange={(e) => updateArrayField('medical', 'pastSurgicalHistory', 'surgeries', index, 'date', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Month</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={surgery.month}
                    onChange={(e) => updateArrayField('medical', 'pastSurgicalHistory', 'surgeries', index, 'month', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={surgery.year}
                    onChange={(e) => updateArrayField('medical', 'pastSurgicalHistory', 'surgeries', index, 'year', e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Medication</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={surgery.medication}
                    onChange={(e) => updateArrayField('medical', 'pastSurgicalHistory', 'surgeries', index, 'medication', e.target.value)}
                    placeholder="Medication details"
                  />
                </div>
                
                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="button"
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => removeArrayItem('medical', 'pastSurgicalHistory', 'surgeries', index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => addArrayItem('medical', 'pastSurgicalHistory', 'surgeries', {
                type: '',
                date: '',
                month: '',
                year: '',
                medication: ''
              })}
            >
              Add Surgery
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="font-bold mb-2 underline">Drug Hypersensitivity</h3>
        <div className="flex items-center mb-2">
          <label className="mr-2">Has hypersensitivity?</label>
          <select
            className="border border-gray-300 rounded-md p-1"
            value={prescriptionData.medical.hypersensitivity.hasHypersensitivity ? 'Yes' : 'No'}
            onChange={(e) => updateNestedPrescriptionData('medical', 'hypersensitivity', {
              ...prescriptionData.medical.hypersensitivity,
              hasHypersensitivity: e.target.value === 'Yes'
            })}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        
        {prescriptionData.medical.hypersensitivity.hasHypersensitivity && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Common Drugs</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                onChange={(e) => addDrug(e.target.value)}
              >
                <option value="">Select drug...</option>
                {commonDrugs.map((drug, index) => (
                  <option key={index} value={drug}>{drug}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Custom Drug</label>
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-l-md p-2"
                  value={prescriptionData.medical.hypersensitivity.customDrug}
                  onChange={(e) => updateNestedPrescriptionData('medical', 'hypersensitivity', {
                    ...prescriptionData.medical.hypersensitivity,
                    customDrug: e.target.value
                  })}
                  placeholder="Enter custom drug name"
                />
                <button
                  type="button"
                  className="bg-blue-500 text-white px-3 py-2 rounded-r-md"
                  onClick={addCustomDrug}
                >
                  Add
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Drugs</h4>
              <div className="flex flex-wrap gap-2">
                {prescriptionData.medical.hypersensitivity.drugs.map((drug, index) => (
                  <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                    <span className="mr-2">{drug}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => updateNestedPrescriptionData('medical', 'hypersensitivity', {
                        ...prescriptionData.medical.hypersensitivity,
                        drugs: prescriptionData.medical.hypersensitivity.drugs.filter((d, i) => i !== index)
                      })}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="font-bold mb-2 underline">Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Temperature</label>
            <div className="flex items-center">
              <input
                type="number"
                min="95"
                max="110"
                step="0.1"
                className="w-20 border border-gray-300 rounded-md p-2"
                value={prescriptionData.medical.vitals.temperature}
                onChange={(e) => updateNestedPrescriptionData('medical', 'vitals', {
                  ...prescriptionData.medical.vitals,
                  temperature: e.target.value
                })}
                placeholder="Temp"
              />
              <select
                className="ml-2 border border-gray-300 rounded-md p-2"
                value={prescriptionData.medical.vitals.temperatureType}
                onChange={(e) => updateNestedPrescriptionData('medical', 'vitals', {
                  ...prescriptionData.medical.vitals,
                  temperatureType: e.target.value
                })}
              >
                <option value="oral">Oral (°F)</option>
                <option value="rectal">Rectal (°F)</option>
                <option value="axillary">Axillary (°F)</option>
                <option value="ear">Ear (°F)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Pulse</label>
            <input
              type="number"
              min="30"
              max="200"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.medical.vitals.pulse}
              onChange={(e) => updateNestedPrescriptionData('medical', 'vitals', {
                ...prescriptionData.medical.vitals,
                pulse: e.target.value
              })}
              placeholder="beats/min"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Respiratory Rate</label>
            <input
              type="number"
              min="5"
              max="50"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.medical.vitals.respiratoryRate}
              onChange={(e) => updateNestedPrescriptionData('medical', 'vitals', {
                ...prescriptionData.medical.vitals,
                respiratoryRate: e.target.value
              })}
              placeholder="breaths/min"
            />
          </div>
          
          <div className="border p-3 rounded-lg">
            <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
            <div className="mt-1">
              <div className="flex items-center">
                <input
                  type="number"
                  min="50"
                  max="250"
                  className="w-20 border border-gray-300 rounded-md p-2"
                  value={prescriptionData.medical.vitals.bloodPressure.systolic}
                  onChange={(e) => updateNestedPrescriptionData('medical', 'vitals', {
                    ...prescriptionData.medical.vitals,
                    bloodPressure: {
                      ...prescriptionData.medical.vitals.bloodPressure,
                      systolic: e.target.value
                    }
                  })}
                  placeholder="SYS"
                />
                <span className="mx-2">/</span>
                <input
                  type="number"
                  min="30"
                  max="150"
                  className="w-20 border border-gray-300 rounded-md p-2"
                  value={prescriptionData.medical.vitals.bloodPressure.diastolic}
                  onChange={(e) => updateNestedPrescriptionData('medical', 'vitals', {
                    ...prescriptionData.medical.vitals,
                    bloodPressure: {
                      ...prescriptionData.medical.vitals.bloodPressure,
                      diastolic: e.target.value
                    }
                  })}
                  placeholder="DIA"
                />
                <span className="ml-2 text-sm">mm Hg</span>
              </div>
              <select
                className="mt-2 w-full border border-gray-300 rounded-md p-2"
                value={prescriptionData.medical.vitals.bloodPressure.position}
                onChange={(e) => updateNestedPrescriptionData('medical', 'vitals', {
                  ...prescriptionData.medical.vitals,
                  bloodPressure: {
                    ...prescriptionData.medical.vitals.bloodPressure,
                    position: e.target.value
                  }
                })}
              >
                <option value="sitting">Sitting</option>
                <option value="standing">Standing</option>
                <option value="supine">Supine</option>
              </select>
            </div>
          </div>
          
          <div className="border p-3 rounded-lg">
            <label className="block text-sm font-medium text-gray-700">Pulse Oximetry</label>
            <div className="mt-1 flex items-center">
              <input
                type="number"
                min="70"
                max="100"
                className="w-20 border border-gray-300 rounded-md p-2"
                value={prescriptionData.medical.vitals.pulseOximetry}
                onChange={(e) => updateNestedPrescriptionData('medical', 'vitals', {
                  ...prescriptionData.medical.vitals,
                  pulseOximetry: e.target.value
                })}
                placeholder="SpO₂"
              />
              <span className="ml-2 text-sm">%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-bold mb-2 underline">Physical Examination</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(prescriptionData.medical.physicalExam).map(([key, value]) => (
            <div key={key} className="border p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                <div className="flex items-center">
                  <span className="mr-2">Normal?</span>
                  <button
                    className={`px-2 py-1 rounded ${value.normal ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    onClick={() => toggleExamNormal(key)}
                  >
                    {value.normal ? 'Yes' : 'No'}
                  </button>
                </div>
              </div>
              {!value.normal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    rows="2"
                    value={value.description}
                    onChange={(e) => {
                      const newExam = { ...prescriptionData.medical.physicalExam };
                      newExam[key].description = e.target.value;
                      updateNestedPrescriptionData('medical', 'physicalExam', newExam);
                    }}
                    placeholder="Describe abnormal findings..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/patient-info')}
        >
          Previous: Patient Info
        </button>
        
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/treatment-info')}
        >
          Next: Treatment Info
        </button>
      </div>
    </div>
  );
};

export default MedicalInfo;