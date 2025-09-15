import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrescriptionContext } from '../context/PrescriptionContext';
import CreatableSelect from "react-select/creatable";

const HospitalDoctorInfo = () => {
  const navigate = useNavigate();
  const {
    prescriptionData,
    updateNestedPrescriptionData,
    updateArrayField,
    addArrayItem,
    removeArrayItem
  } = useContext(PrescriptionContext);

  const API_BASE = 'https://www.pcds.co.in/medsaveapi.php';

  const postJson = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'API error');
    return data.data;
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateNestedPrescriptionData('hospital', 'logo', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    try {
      // Hospital data save/update karo
      let hospitalUrl = `${API_BASE}?action=save&entity=hospitals`;
      if (prescriptionData.hospital.id) {
        hospitalUrl += `&id=${prescriptionData.hospital.id}`;
      }

      const hospitalResponse = await postJson(hospitalUrl, {
        name: prescriptionData.hospital.name,
        registration_no: prescriptionData.hospital.registration_no, // Changed to match backend
        accreditations: prescriptionData.hospital.accreditations,
        address: prescriptionData.hospital.address,
        contact: prescriptionData.hospital.contact,
        email: prescriptionData.hospital.email,
        website: prescriptionData.hospital.website,
        logo: prescriptionData.hospital.logo
      });

      // Update context with hospital ID
      updateNestedPrescriptionData('hospital', 'id', hospitalResponse.id);

      // Doctor data save/update karo
      const doctor = prescriptionData.hospital.doctors[0];
      let doctorUrl = `${API_BASE}?action=save&entity=doctors`;
      if (doctor.id) {
        doctorUrl += `&id=${doctor.id}`;
      }

      const doctorResponse = await postJson(doctorUrl, {
        name: doctor.name,
        designation: doctor.designation,
        registration_no: doctor.registration_no, // Changed to match backend
        qualification: doctor.qualification,
        phone: doctor.phone,
        email: doctor.email,
        hospital_id: hospitalResponse.id || prescriptionData.hospital.id
      });

      // Update context with doctor ID
      updateArrayField('hospital', 'doctors', 0, 'id', doctorResponse.id);

      navigate('/patient-info');
    } catch (error) {
      console.error('Error saving hospital/doctor data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 underline">Hospital Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hospital Logo</label>
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full"
            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
          />
          {prescriptionData.hospital.logo && (
            <div className="mt-2">
              <img src={prescriptionData.hospital.logo} alt="Hospital Logo" className="h-20 object-contain" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={prescriptionData.hospital.name}
            onChange={(e) => updateNestedPrescriptionData('hospital', 'name', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Registration Number</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={prescriptionData.hospital.registration_no} // Changed to match backend
            onChange={(e) => updateNestedPrescriptionData('hospital', 'registration_no', e.target.value)} // Changed to match backend
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Accreditations (NABH, NABL, ISO, etc.)
          </label>
          <CreatableSelect
            isMulti
            options={[
              { value: "NABH", label: "NABH" },
              { value: "NABL", label: "NABL" },
              { value: "ISO", label: "ISO" },
              { value: "JCI", label: "JCI" },
            ]}
            value={
              prescriptionData.hospital.accreditations
                ? prescriptionData.hospital.accreditations
                  .split(",")
                  .map((acc) => ({
                    value: acc.trim(),
                    label: acc.trim(),
                  }))
                : []
            }
            onChange={(selected) =>
              updateNestedPrescriptionData(
                "hospital",
                "accreditations",
                selected.map((s) => s.value).join(",")
              )
            }
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows="3"
            value={prescriptionData.hospital.address}
            onChange={(e) => updateNestedPrescriptionData('hospital', 'address', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Details</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={prescriptionData.hospital.contact}
            onChange={(e) => updateNestedPrescriptionData('hospital', 'contact', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={prescriptionData.hospital.email}
            onChange={(e) => updateNestedPrescriptionData('hospital', 'email', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Website</label>
          <input
            type="url"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={prescriptionData.hospital.website}
            onChange={(e) => updateNestedPrescriptionData('hospital', 'website', e.target.value)}
            placeholder="example.com"
          />
        </div>
      </div>

      <h3 className="text-lg font-bold mb-4 underline">Doctor Information</h3>

      {prescriptionData.hospital.doctors.map((doctor, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={doctor.name}
              onChange={(e) => updateArrayField('hospital', 'doctors', index, 'name', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Designation</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={doctor.designation}
              onChange={(e) => updateArrayField('hospital', 'doctors', index, 'designation', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Registration Number</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={doctor.registration_no} // Changed to match backend
              onChange={(e) => updateArrayField('hospital', 'doctors', index, 'registration_no', e.target.value)} // Changed to match backend
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Qualification</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={doctor.qualification}
              onChange={(e) => updateArrayField('hospital', 'doctors', index, 'qualification', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={doctor.phone}
              onChange={(e) => updateArrayField('hospital', 'doctors', index, 'phone', e.target.value)}
              placeholder="10-digit number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email ID</label>
            <input
              type="email"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={doctor.email}
              onChange={(e) => updateArrayField('hospital', 'doctors', index, 'email', e.target.value)}
              placeholder="doctor@example.com"
            />
          </div>

          {index > 0 && (
            <div className="md:col-span-2 flex justify-end">
              <button
                type="button"
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => removeArrayItem('hospital', 'doctors', index)}
              >
                Remove Doctor
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => addArrayItem('hospital', 'doctors', {
          name: '',
          designation: '',
          registration_no: '', // Changed to match backend
          qualification: '',
          phone: '',
          email: ''
        })}
      >
        Add Another Doctor
      </button>

      <div className="flex justify-end mt-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleNext}
        >
          Next: Patient Information
        </button>
      </div>
    </div>
  );
};

export default HospitalDoctorInfo;