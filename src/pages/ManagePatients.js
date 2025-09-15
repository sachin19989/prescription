// src/pages/ManagePatients.js
import React, { useEffect, useState } from 'react';

const API_BASE = 'https://www.pcds.co.in/medsaveapi.php';

// ---- helpers ----
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

const compact = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== ''));

const normalizeGender = (g) => {
  if (!g) return undefined;
  const s = String(g).toLowerCase();
  if (s.startsWith('m')) return 'Male';
  if (s.startsWith('f')) return 'Female';
  return 'Other';
};

// snake_case (DB) -> camelCase (context)
const mapApiPatientToContext = (r) => ({
  id: r.id,
  registrationNo: r.registration_no,
  aadhaarNumber: r.aadhaar_number,
  title: r.title,
  firstName: r.first_name,
  middleName: r.middle_name,
  lastName: r.last_name,
  phone: r.phone,
  email: r.email,
  guardianTitle: r.guardian_title,
  guardianFirstName: r.guardian_first_name,
  guardianMiddleName: r.guardian_middle_name,
  guardianLastName: r.guardian_last_name,
  addressLine1: r.address_line1,
  addressDistrict: r.address_district,
  addressState: r.address_state,
  addressCountry: r.address_country,
  addressPin: r.address_pin,
  dob: r.dob,
  age: r.age,
  gender: r.gender,
  sex: r.gender,
  maritalStatus: r.marital_status,
  pregnancy: !!r.pregnancy,
  breastfeeding: !!r.breastfeeding,
  occupation: r.occupation,
  weight: r.weight,
  height: r.height,
  bmi: r.bmi,
  bloodGroup: r.blood_group,
  referredByDoctorName: r.referred_by_doctor_name,
  referredByDoctorQualification: r.referred_by_doctor_qualification,
  referredByDoctorAddress: r.referred_by_doctor_address,
  referredByHospitalName: r.referred_by_hospital_name,
  referredByHospitalAddress: r.referred_by_hospital_address,
});

export const loadPatients = async (page = 1, regFilter = '', phoneFilter = '') => {
  const limit = 10;
  // setError(null); // Comment out or remove if not in component scope
  // setLoading(true);
  try {
    const params = new URLSearchParams({
      action: 'list',
      entity: 'patients',
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
    });
    if (regFilter) params.append('registration_no', regFilter);
    if (phoneFilter) params.append('phone', phoneFilter);

    const res = await fetch(`${API_BASE}?${params.toString()}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Failed to load patients');
    return {
      items: data.data.items || [],
      total: data.data.total || data.data.items.length
    };
  } catch (e) {
    throw e;
  } finally {
    // setLoading(false);
  }
};

const ManagePatients = () => {
  // server state
  const [serverPatients, setServerPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Number of records per page

  // filters
  const [regFilter, setRegFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');

  const loadPatientsInternal = async (page = 1) => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'list',
        entity: 'patients',
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      });
      if (regFilter) params.append('registration_no', regFilter);
      if (phoneFilter) params.append('phone', phoneFilter);

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load patients');
      setServerPatients(data.data.items || []);
      // Assuming API returns total count for pagination
      const totalItems = data.data.total || data.data.items.length;
      setTotalPages(Math.ceil(totalItems / limit));
      setCurrentPage(page);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    setLoading(true);
    try {
      const url = `${API_BASE}?action=delete&entity=patients&id=${id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "API error");
      loadPatientsInternal(currentPage);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientsInternal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearFilters = () => {
    setRegFilter('');
    setPhoneFilter('');
    loadPatientsInternal(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadPatientsInternal(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Manage Patients</h2>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Registration No</label>
          <input
            className="w-full border rounded-md p-2"
            value={regFilter}
            onChange={(e) => setRegFilter(e.target.value)}
            placeholder="REG-2025-001"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Phone</label>
          <input
            className="w-full border rounded-md p-2"
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value)}
            placeholder="10-digit number"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => loadPatientsInternal(1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Patients Table (from server) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {serverPatients.length > 0 ? (
              serverPatients.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{p.registration_no || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {p.title ? `${p.title} ` : ''}{p.first_name} {p.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.age ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.gender ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.phone ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => alert('Edit functionality to be implemented')}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => deletePatient(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  {loading ? 'Loading…' : 'No patients found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ManagePatients;