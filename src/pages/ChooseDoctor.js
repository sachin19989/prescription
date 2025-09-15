// src/pages/ChooseDoctor.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { PrescriptionContext, mapApiDoctorToContext, mapApiHospitalToContext } from '../context/PrescriptionContext';

const ChooseDoctor = () => {
  const API_BASE = 'https://www.pcds.co.in/medsaveapi.php';
  const { updatePrescriptionData } = useContext(PrescriptionContext);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 5;

  // API fetch utility
  const fetchData = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'API error');
      return data.data;
    } catch (err) {
      throw err;
    }
  };

  // Load doctors
  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}?action=list&entity=doctors&limit=1000`;
      const data = await fetchData(url);
      setDoctors(data.items || []);
      setFilteredDoctors(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredDoctors(doctors);
      } else {
        const filtered = doctors.filter(
          (doc) =>
            doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.id?.toString().includes(searchTerm)
        );
        setFilteredDoctors(filtered);
      }
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, doctors]);

  const handleDoctorSelect = async (doctor) => {
    setLoading(true);
    try {
      const doctorData = await fetchData(`${API_BASE}?action=get&entity=doctors&id=${doctor.id}`);
      const hospitalData = await fetchData(`${API_BASE}?action=get&entity=hospitals&id=${doctorData.hospital_id}`);

      // 👇 Map API fields → Context fields
      const mappedDoctor = mapApiDoctorToContext(doctorData);
      const mappedHospital = mapApiHospitalToContext(hospitalData);

      updatePrescriptionData('hospital', { ...mappedHospital, doctors: [mappedDoctor] });
      navigate('/hospital-doctor-info');
    } catch (err) {
      setError('Failed to load doctor details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  const startIndex = (currentPage - 1) * doctorsPerPage;
  const displayedDoctors = filteredDoctors.slice(startIndex, startIndex + doctorsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        {pageNumbers}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto">
      {/* Header + Add Doctor Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Select Doctor</h2>
        <button
          onClick={() => navigate('/manage-doctors')}
          className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
        >
          + Add New Doctor
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Search + Reset */}
      <div className="mb-6 flex items-center space-x-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-96 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Reset
          </button>
        )}
      </div>

      {/* Doctors Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading doctors...</div>
      ) : displayedDoctors.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {searchTerm ? 'No doctors match your search' : 'No doctors found.'}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedDoctors.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4">{doc.id ?? 'N/A'}</td>
                    <td className="px-6 py-4">{doc.name ?? '-'}</td>
                    <td className="px-6 py-4">{doc.designation ?? '-'}</td>
                    <td className="px-6 py-4">{doc.qualification ?? '-'}</td>
                    <td className="px-6 py-4">{doc.registration_no ?? '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDoctorSelect(doc)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {startIndex + 1} to {startIndex + displayedDoctors.length} of {filteredDoctors.length} doctors
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default ChooseDoctor;