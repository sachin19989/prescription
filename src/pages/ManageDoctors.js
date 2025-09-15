// src/pages/ManageDoctors.jsx
import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import CreatableSelect from "react-select/creatable";

const ManageDoctors = () => {
  const API_BASE = "https://www.pcds.co.in/medsaveapi.php";
  const navigate = useNavigate();

  // State management
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [hospital, setHospital] = useState({
    id: null,
    logo: "",
    name: "",
    registration_no: "",
    accreditations: "",
    address: "",
    contact: "",
    email: "",
    website: "",
  });
  const initialHospital = { ...hospital };
  const [doctorForm, setDoctorForm] = useState({
    id: null,
    name: "",
    designation: "",
    registration_no: "",
    qualification: "",
    phone: "",
    email: "",
  });
  const [hospitalCache, setHospitalCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const doctorsPerPage = 10;

  // Options
  const accreditationOptions = [
    { value: "NABH", label: "NABH" },
    { value: "NABL", label: "NABL" },
    { value: "ISO", label: "ISO" },
  ];

  const designationOptions = [
    { value: "Chief", label: "Chief" },
    { value: "Consultant", label: "Consultant" },
    { value: "Surgeon", label: "Surgeon" },
    { value: "Physician", label: "Physician" },
  ];

  const qualificationOptions = [
    { value: "MBBS", label: "MBBS" },
    { value: "MD", label: "MD" },
    { value: "MS", label: "MS" },
    { value: "DM", label: "DM" },
    { value: "MCh", label: "MCh" },
  ];

  // API utility functions
  const postJson = async (url, body) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "API error");
    return data.data;
  };

  const fetchData = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "API error");
    return data.data;
  };

  // Load all doctors
  const loadDoctors = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE}?action=list&entity=doctors`;
      const data = await fetchData(url);
      setDoctors(data.items || []);
      setFilteredDoctors(data.items || []);

      // Cache hospitals
      const uniqueHospitalIds = [
        ...new Set((data.items || []).map((d) => d.hospital_id).filter(Boolean)),
      ];
      const promises = uniqueHospitalIds.map(async (hid) => {
        if (!hospitalCache[hid]) {
          const hdata = await fetchData(
            `${API_BASE}?action=get&entity=hospitals&id=${hid}`
          );
          setHospitalCache((prev) => ({ ...prev, [hid]: hdata }));
        }
      });
      await Promise.all(promises);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(
        (doctor) =>
          (doctor.name &&
            doctor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (doctor.id && doctor.id.toString().includes(searchTerm))
      );
      setFilteredDoctors(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, doctors]);

  const handleHospitalInputChange = (e) => {
    const { name, value } = e.target;
    setHospital((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setHospital((prev) => ({ ...prev, logo: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setHospital((prev) => ({ ...prev, logo: "" }));
  };

  const saveHospital = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}?action=save&entity=hospitals`;
      const payload = { ...hospital, id: hospital.id ?? null };
      const result = await postJson(url, payload);
      if (!hospital.id) {
        setHospital({ ...hospital, id: result.id });
      }
      return result.id;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveDoctor = async () => {
    setLoading(true);
    try {
      const hospitalId = await saveHospital();
      if (!hospitalId) return;

      let doctorUrl = `${API_BASE}?action=save&entity=doctors`;
      const doctorData = {
        ...doctorForm,
        id: doctorForm.id,
        hospital_id: hospitalId,
      };

      await postJson(doctorUrl, doctorData);

      setSuccess("Doctor saved successfully");
      setShowForm(false);
      resetForm();
      loadDoctors();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const editDoctor = async (doctor) => {
    setEditingDoctor(true);
    setDoctorForm(doctor);
    if (doctor.hospital_id) {
      const hdata =
        hospitalCache[doctor.hospital_id] ||
        (await fetchData(
          `${API_BASE}?action=get&entity=hospitals&id=${doctor.hospital_id}`
        ));
      setHospital(hdata);
    }
    setShowForm(true);
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    setLoading(true);
    try {
      const url = `${API_BASE}?action=delete&entity=doctors&id=${id}`;
      await fetchData(url);
      setSuccess("Doctor deleted successfully");
      loadDoctors();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandDoctor = (id) => {
    setExpandedDoctor(expandedDoctor === id ? null : id);
  };

  const resetForm = () => {
    setEditingDoctor(false);
    setDoctorForm({
      id: null,
      name: "",
      designation: "",
      registration_no: "",
      qualification: "",
      phone: "",
      email: "",
    });
    setHospital(initialHospital);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
    if (totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md ${currentPage === i
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    );
  };

  const totalResults = filteredDoctors.length;
  const startIndex = (currentPage - 1) * doctorsPerPage + 1;
  const endIndex = Math.min(currentPage * doctorsPerPage, totalResults);
  const displayedDoctors = filteredDoctors.slice(
    (currentPage - 1) * doctorsPerPage,
    currentPage * doctorsPerPage
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Manage Doctors</h2>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <FiPlus className="mr-2" /> Add New Doctor
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center shadow">
          {success}
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center shadow">
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}

      {/* Doctor Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-700">
            {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
          </h3>

          {/* Hospital Information */}
          <h4 className="font-bold mb-2 text-gray-600">Hospital Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hospital Logo
              </label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full border rounded p-2"
                onChange={(e) =>
                  e.target.files[0] && handleFileUpload(e.target.files[0])
                }
              />
              {hospital.logo && (
                <div className="mt-2 flex items-center">
                  <img
                    src={hospital.logo}
                    alt="Hospital Logo"
                    className="h-16 object-contain mr-2 border rounded"
                  />
                  <button onClick={removeLogo} className="text-red-500 text-sm">
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hospital Name
              </label>
              <input
                type="text"
                name="name"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={hospital.name}
                onChange={handleHospitalInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Registration No
              </label>
              <input
                type="text"
                name="registration_no"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={hospital.registration_no}
                onChange={handleHospitalInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Accreditations
              </label>
              <CreatableSelect
                isMulti
                options={accreditationOptions}
                value={
                  hospital.accreditations
                    ? hospital.accreditations.split(",").map((acc) => ({
                      value: acc.trim(),
                      label: acc.trim(),
                    }))
                    : []
                }
                onChange={(selected) =>
                  setHospital((prev) => ({
                    ...prev,
                    accreditations: selected.map((s) => s.value).join(","),
                  }))
                }
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                name="address"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                rows="3"
                value={hospital.address}
                onChange={handleHospitalInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone No
              </label>
              <input
                type="text"
                name="contact"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={hospital.contact}
                onChange={handleHospitalInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={hospital.email}
                onChange={handleHospitalInputChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                name="website"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={hospital.website}
                onChange={handleHospitalInputChange}
              />
            </div>
          </div>

          {/* Doctor Information */}
          <h4 className="font-bold mb-2 text-gray-600">Doctor Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={doctorForm.name}
                onChange={(e) =>
                  setDoctorForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            {/* Doctor Designation (multi-select + manual typing) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Designation
              </label>
              <CreatableSelect
                isMulti
                placeholder="Select or type designation(s)"
                value={
                  doctorForm.designation
                    ? doctorForm.designation.split(",").map((d) => ({
                      value: d.trim(),
                      label: d.trim(),
                    }))
                    : []
                }

                onChange={(selected) =>
                  setDoctorForm((prev) => ({
                    ...prev,
                    designation: selected.map((s) => s.value).join(","),
                  }))
                }
                options={[
                  { value: "Chief", label: "Chief" },
                  { value: "Consultant", label: "Consultant" },
                  { value: "Surgeon", label: "Surgeon" },
                  { value: "Physician", label: "Physician" },
                  { value: "Resident Doctor", label: "Resident Doctor" },
                ]}
                className="mt-1"
              />
            </div>


            {/* Registration No */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Registration No
              </label>
              <input
                type="text"
                name="registration_no"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={doctorForm.registration_no}
                onChange={(e) =>
                  setDoctorForm((prev) => ({
                    ...prev,
                    registration_no: e.target.value,
                  }))
                }
              />
            </div>

            {/* Qualification Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Qualification
              </label>
              <CreatableSelect
                isMulti
                options={qualificationOptions}
                value={
                  doctorForm.qualification
                    ? doctorForm.qualification.split(",").map((q) => ({
                      value: q.trim(),
                      label: q.trim(),
                    }))
                    : []
                }
                onChange={(selected) =>
                  setDoctorForm((prev) => ({
                    ...prev,
                    qualification: selected.map((s) => s.value).join(","),
                  }))
                }
                className="mt-1"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={doctorForm.phone}
                onChange={(e) =>
                  setDoctorForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={doctorForm.email}
                onChange={(e) =>
                  setDoctorForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveDoctor}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingDoctor
                  ? "Update Doctor"
                  : "Save Doctor"}
            </button>
          </div>
        </div>
      )}

      {/* Doctors List */}
      {!showForm && (
        <>
          {/* Search + Reset */}
          <div className="flex items-center mb-6 space-x-2">
            <div className="relative">
              <FiSearch className="absolute top-2 left-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctor..."
                className="pl-8 pr-3 py-2 border rounded-md w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Reset
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">
                Doctors List
              </h3>
              <div className="text-sm text-gray-600">
                Showing {startIndex} to {endIndex} of {totalResults} doctors
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "ID",
                    "Name",
                    "Designation",
                    "Qualification",
                    "Registration",
                    "Actions",
                  ].map((head, i) => (
                    <th
                      key={i}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Loading doctors...
                    </td>
                  </tr>
                )}

                {!loading && displayedDoctors.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No doctors found
                    </td>
                  </tr>
                )}

                {displayedDoctors.map((doctor) => (
                  <React.Fragment key={doctor.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">{doctor.id}</td>
                      <td className="px-6 py-4">{doctor.name}</td>
                      <td className="px-6 py-4">{doctor.designation}</td>
                      <td className="px-6 py-4">{doctor.qualification}</td>
                      <td className="px-6 py-4">{doctor.registration_no}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => editDoctor(doctor)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => deleteDoctor(doctor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 />
                        </button>
                        <button
                          onClick={() => toggleExpandDoctor(doctor.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {expandedDoctor === doctor.id ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          )}
                        </button>
                      </td>
                    </tr>

                    {expandedDoctor === doctor.id && (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 bg-gray-50 text-sm text-gray-600"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <strong>Phone:</strong> {doctor.phone || "N/A"}
                            </div>
                            <div>
                              <strong>Email:</strong> {doctor.email || "N/A"}
                            </div>
                            {hospitalCache[doctor.hospital_id] && (
                              <>
                                <div>
                                  <strong>Hospital:</strong>{" "}
                                  {hospitalCache[doctor.hospital_id].name}
                                </div>
                                <div>
                                  <strong>Address:</strong>{" "}
                                  {hospitalCache[doctor.hospital_id].address}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default ManageDoctors;
