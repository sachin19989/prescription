import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import statesData from '../states.json';
import { PrescriptionContext } from '../context/PrescriptionContext';
import { FiSearch } from 'react-icons/fi';

const PatientInfo = () => {
  const navigate = useNavigate();
  const {
    prescriptionData,
    updateNestedPrescriptionData,
    updatePrescriptionData
  } = useContext(PrescriptionContext);

  const API_BASE = 'https://www.pcds.co.in/medsaveapi.php';

  const [indianStates, setIndianStates] = useState([]);
  const [errors, setErrors] = useState({});
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [ageInputType, setAgeInputType] = useState('DOB'); // DOB, Year, Infant
  const [dobInput, setDobInput] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [infantInput, setInfantInput] = useState('');

  const countryOptions = ['India'];
  const occupationOptions = [
    'Student', 'Professional', 'Business', 'Housewife', 'Retired', 'Farmer',
    'Teacher', 'Engineer', 'Doctor', 'Nurse', 'Government Employee',
    'Private Employee', 'Self Employed', 'Unemployed', 'Other'
  ];

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

  const getNextSeq = async (prefix) => {
    let maxSeq = 0;
    let offset = 0;
    const limit = 50; // Adjust if needed; smaller for faster fetches, larger for fewer calls
    while (true) {
      const params = new URLSearchParams({
        action: 'list',
        entity: 'patients',
        limit: limit.toString(),
        offset: offset.toString(),
      });
      try {
        const res = await fetch(`${API_BASE}?${params.toString()}`);
        const data = await res.json();
        if (!data.ok) break; // Stop if error or no data
        const items = data.data.items || [];
        if (items.length === 0) break; // No more items
        items.forEach((p) => {
          if (p.registration_no && p.registration_no.startsWith(prefix)) {
            const seqPart = p.registration_no.slice(prefix.length);
            const seqNum = parseInt(seqPart, 10);
            if (!isNaN(seqNum) && seqNum > maxSeq) {
              maxSeq = seqNum;
            }
          }
        });
        offset += limit;
      } catch (e) {
        console.error('Error fetching patients for seq:', e);
        break;
      }
    }
    return maxSeq + 1; // Next sequence (starts from 1 if none found)
  };

  // Initialize patient data and load states
  useEffect(() => {
    const init = async () => {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const formattedDateTime = `${now.getFullYear()}-${month}-${day}T${hours}:${minutes}`;

      const prefix = `REG${year}${month}${day}`;
      let regNo = prefix + '00001'; // Default if fetch fails or first one
      try {
        const nextSeq = await getNextSeq(prefix);
        const seqStr = nextSeq.toString().padStart(5, '0');
        regNo = prefix + seqStr;
      } catch (e) {
        console.error('Failed to get next seq, using random fallback:', e);
        // Fallback to random 5-digit if API fails
        const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        regNo = prefix + randomNum;
      }

      updatePrescriptionData('patient', {
        id: '',
        registrationNo: regNo,
        dateTime: formattedDateTime,
        aadhaarNumber: '',
        title: '',
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        guardianTitle: '',
        guardianFirstName: '',
        guardianMiddleName: '',
        guardianLastName: '',
        address: {
          line1: '',
          line2: '',
          district: '',
          state: '',
          country: 'India',
          pin: ''
        },
        dob: '',
        age: '',
        age_display: '',
        sex: '',
        maritalStatus: '',
        pregnancy: '',
        breastfeeding: '',
        occupation: '',
        weight: '',
        height: '',
        bmi: '',
        bloodGroup: '',
        referredBy: {
          doctor: { name: '', qualification: '', address: '' },
          hospital: { name: '', address: '' }
        },
        billingInfo: {
          paymentMethod: '',
          insuranceProvider: '',
          policyNumber: ''
        }
      });

      const states = statesData.states.map(state => ({
        name: state.state,
        districts: state.districts
      }));
      setIndianStates(states);
    };

    init();
  }, []);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Search patients based on debounced term
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      searchPatients();
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [debouncedSearchTerm]);

  // Search patients
  const searchPatients = async () => {
    setLoading(true);
    setSearchError(null);
    try {
      const params = new URLSearchParams({
        action: 'list',
        entity: 'patients',
        limit: '10',
        offset: '0'
      });
      if (searchTerm.match(/^\d+$/)) {
        params.append('phone', searchTerm);
      } else if (searchTerm.toUpperCase().startsWith('REG')) {
        params.append('registration_no', searchTerm);
      } else {
        params.append('first_name', searchTerm);
      }

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load patients');
      setSearchResults(data.data.items || []);
      setShowSearchResults(true);
    } catch (e) {
      setSearchError(e.message);
      setSearchResults([]);
      setShowSearchResults(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle patient selection
  const handlePatientSelect = async (patient) => {
    setLoading(true);
    try {
      const patientData = await fetch(`${API_BASE}?action=get&entity=patients&id=${patient.id}`);
      const data = await patientData.json();
      if (!data.ok) throw new Error(data.error || 'Failed to fetch patient data');

      const mappedPatient = mapApiPatientToContext(data.data);
      updatePrescriptionData('patient', {
        ...mappedPatient,
        dateTime: prescriptionData.patient.dateTime,
        billingInfo: {
          paymentMethod: '',
          insuranceProvider: '',
          policyNumber: ''
        }
      });
      setSearchTerm('');
      setSearchResults([]);
      setShowSearchResults(false);
      // Set input fields based on patient data
      if (mappedPatient.dob) {
        if (mappedPatient.age === '0' && mappedPatient.dob === new Date().toISOString().split('T')[0]) {
          setAgeInputType('Infant');
          setInfantInput(mappedPatient.age_display || '');
        } else if (mappedPatient.dob.endsWith('-01-01')) {
          setAgeInputType('Year');
          setYearInput(mappedPatient.dob.split('-')[0]);
        } else {
          setAgeInputType('DOB');
          const [year, month, day] = mappedPatient.dob.split('-');
          setDobInput(`${day}/${month}/${year}`);
        }
      }
    } catch (e) {
      setSearchError('Failed to load patient details: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Map API patient data to context
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
    address: {
      line1: r.address_line1,
      line2: r.address_line2 || '',
      district: r.address_district,
      state: r.address_state,
      country: r.address_country,
      pin: r.address_pin
    },
    dob: r.dob,
    age: r.age,
    age_display: r.age_display || '',
    sex: r.gender,
    maritalStatus: r.marital_status,
    pregnancy: r.pregnancy ? 'Yes' : 'No',
    breastfeeding: r.breastfeeding ? 'Yes' : 'No',
    occupation: r.occupation,
    weight: r.weight,
    height: r.height,
    bmi: r.bmi,
    bloodGroup: r.blood_group,
    referredBy: {
      doctor: {
        name: r.referred_by_doctor_name,
        qualification: r.referred_by_doctor_qualification,
        address: r.referred_by_doctor_address
      },
      hospital: {
        name: r.referred_by_hospital_name,
        address: r.referred_by_hospital_address
      }
    }
  });

  const handleChange = (section, field, value, subField = null) => {
    if (subField) {
      updateNestedPrescriptionData(section, field, { ...prescriptionData[section][field], [subField]: value });
    } else {
      updateNestedPrescriptionData(section, field, value);
    }
  };

  const handleAddressChange = (field, value) => {
    updateNestedPrescriptionData('patient', 'address', {
      ...prescriptionData.patient.address,
      [field]: value
    });
  };

  const calculateBMI = () => {
    const { weight, height } = prescriptionData.patient;
    if (weight && height) {
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const heightInMeters = heightNum < 3 ? heightNum : heightNum / 100;
      const bmi = (weightNum / (heightInMeters * heightInMeters)).toFixed(2);
      updateNestedPrescriptionData('patient', 'bmi', bmi);
    }
  };

  const validateDOB = (input) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(input)) return { valid: false, error: 'DOB must be in DD/MM/YYYY format' };

    const [day, month, year] = input.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();

    if (
      isNaN(date.getTime()) ||
      day !== date.getDate() ||
      month !== date.getMonth() + 1 ||
      year !== date.getFullYear() ||
      date > today
    ) {
      return { valid: false, error: 'Invalid date' };
    }

    return { valid: true, dob: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` };
  };

  const calculateAgeFromDOB = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const validateYear = (input) => {
    const regex = /^\d{4}$/;
    if (!regex.test(input)) return { valid: false, error: 'Year must be a 4-digit number' };

    const year = Number(input);
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      return { valid: false, error: `Year must be between 1900 and ${currentYear}` };
    }

    return { valid: true, dob: `${year}-01-01`, age: (currentYear - year).toString() };
  };

  const validateInfant = (input) => {
    const regex = /^(\d+)(M|D)$/i;
    if (!regex.test(input)) return { valid: false, error: 'Infant age must be in format X M or X D (e.g., 2M or 15D)' };

    const [, value, unit] = input.match(regex);
    const num = Number(value);
    if (unit.toUpperCase() === 'M' && num > 11) {
      return { valid: false, error: 'Infant months must be 11 or less' };
    }
    if (unit.toUpperCase() === 'D' && num > 31) {
      return { valid: false, error: 'Infant days must be 31 or less' };
    }

    const today = new Date();
    const dob = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return { valid: true, dob, age: '0', ageDisplay: `${num} ${unit.toUpperCase()}` };
  };

  const handleDOBInput = (value) => {
    // Clean input to digits only
    let cleanValue = value.replace(/[^0-9]/g, '');
    let formattedValue = '';

    // Apply formatting: DD/MM/YYYY
    if (cleanValue.length >= 2) {
      formattedValue = cleanValue.slice(0, 2);
      if (cleanValue.length >= 4) {
        formattedValue += '/' + cleanValue.slice(2, 4);
        if (cleanValue.length >= 8) {
          formattedValue += '/' + cleanValue.slice(4, 8);
        } else if (cleanValue.length > 4) {
          formattedValue += '/' + cleanValue.slice(4);
        }
      } else if (cleanValue.length > 2) {
        formattedValue += '/' + cleanValue.slice(2);
      }
    } else {
      formattedValue = cleanValue;
    }

    setDobInput(formattedValue);

    if (!formattedValue) {
      updateNestedPrescriptionData('patient', 'dob', '');
      updateNestedPrescriptionData('patient', 'age', '');
      setErrors(prev => ({ ...prev, dob: '' }));
      return;
    }

    // Only validate if input is complete (DD/MM/YYYY)
    if (formattedValue.length === 10) {
      const result = validateDOB(formattedValue);
      if (result.valid) {
        updateNestedPrescriptionData('patient', 'dob', result.dob);
        updateNestedPrescriptionData('patient', 'age', calculateAgeFromDOB(result.dob));
        setErrors(prev => ({ ...prev, dob: '' }));
      } else {
        setErrors(prev => ({ ...prev, dob: result.error }));
      }
    } else {
      setErrors(prev => ({ ...prev, dob: '' }));
    }
  };

  const handleYearInput = (value) => {
    setYearInput(value.replace(/\D/g, '').slice(0, 4));
    if (!value) {
      updateNestedPrescriptionData('patient', 'dob', '');
      updateNestedPrescriptionData('patient', 'age', '');
      setErrors(prev => ({ ...prev, dob: '' }));
      return;
    }
    const result = validateYear(value);
    if (result.valid) {
      updateNestedPrescriptionData('patient', 'dob', result.dob);
      updateNestedPrescriptionData('patient', 'age', result.age);
      setErrors(prev => ({ ...prev, dob: '' }));
    } else {
      setErrors(prev => ({ ...prev, dob: result.error }));
    }
  };

  const handleInfantInput = (value) => {
    setInfantInput(value.toUpperCase());
    if (!value) {
      updateNestedPrescriptionData('patient', 'dob', '');
      updateNestedPrescriptionData('patient', 'age', '');
      updateNestedPrescriptionData('patient', 'age_display', '');
      setErrors(prev => ({ ...prev, dob: '' }));
      return;
    }
    const result = validateInfant(value);
    if (result.valid) {
      updateNestedPrescriptionData('patient', 'dob', result.dob);
      updateNestedPrescriptionData('patient', 'age', result.age);
      updateNestedPrescriptionData('patient', 'age_display', result.ageDisplay);
      setErrors(prev => ({ ...prev, dob: '' }));
    } else {
      setErrors(prev => ({ ...prev, dob: result.error }));
    }
  };

  const handleAadhaarScan = () => {
    setShowQRScanner(true);
  };

  const getDistricts = () => {
    const state = prescriptionData.patient.address.state;
    const stateData = indianStates.find(s => s.name === state);
    return stateData ? stateData.districts : [];
  };

  const handleStateChange = (e) => {
    updateNestedPrescriptionData('patient', 'address', {
      ...prescriptionData.patient.address,
      state: e.target.value,
      district: ''
    });
  };

  const handlePinCodeLookup = async (e) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    handleAddressChange('pin', pin);

    if (pin.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          updateNestedPrescriptionData('patient', 'address', {
            ...prescriptionData.patient.address,
            district: postOffice.District,
            state: postOffice.State,
            country: 'India',
            pin: pin
          });
          setErrors(prev => ({ ...prev, pin: '' }));
        } else {
          setErrors(prev => ({ ...prev, pin: 'Invalid PIN code' }));
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, pin: 'Failed to fetch PIN code details' }));
      }
    } else {
      setErrors(prev => ({ ...prev, pin: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (prescriptionData.patient.phone && !/^\d{10}$/.test(prescriptionData.patient.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (prescriptionData.patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(prescriptionData.patient.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (prescriptionData.patient.aadhaarNumber && !/^\d{12}$/.test(prescriptionData.patient.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar number must be 12 digits';
    }
    if (ageInputType === 'DOB' && dobInput && !validateDOB(dobInput).valid) {
      newErrors.dob = errors.dob || 'Invalid DOB format';
    }
    if (ageInputType === 'Year' && yearInput && !validateYear(yearInput).valid) {
      newErrors.dob = errors.dob || 'Invalid year format';
    }
    if (ageInputType === 'Infant' && infantInput && !validateInfant(infantInput).valid) {
      newErrors.dob = errors.dob || 'Invalid infant age format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    validateForm(); // Validate for errors display, but proceed anyway

    setLoading(true);
    try {
      let patientUrl = `${API_BASE}?action=save&entity=patients`;
      if (prescriptionData.patient.id) {
        patientUrl += `&id=${prescriptionData.patient.id}`;
      }

      const patientData = {
        registration_no: prescriptionData.patient.registrationNo,
        aadhaar_number: prescriptionData.patient.aadhaarNumber,
        title: prescriptionData.patient.title,
        first_name: prescriptionData.patient.firstName,
        middle_name: prescriptionData.patient.middleName,
        last_name: prescriptionData.patient.lastName,
        phone: prescriptionData.patient.phone,
        email: prescriptionData.patient.email,
        guardian_title: prescriptionData.patient.guardianTitle,
        guardian_first_name: prescriptionData.patient.guardianFirstName,
        guardian_middle_name: prescriptionData.patient.guardianMiddleName,
        guardian_last_name: prescriptionData.patient.guardianLastName,
        address_line1: prescriptionData.patient.address.line1,
        address_line2: prescriptionData.patient.address.line2,
        address_district: prescriptionData.patient.address.district,
        address_state: prescriptionData.patient.address.state,
        address_country: prescriptionData.patient.address.country,
        address_pin: prescriptionData.patient.address.pin,
        dob: prescriptionData.patient.dob,
        age: prescriptionData.patient.age,
        age_display: prescriptionData.patient.age_display || '',
        gender: prescriptionData.patient.sex,
        marital_status: prescriptionData.patient.maritalStatus,
        pregnancy: prescriptionData.patient.pregnancy === 'Yes',
        breastfeeding: prescriptionData.patient.breastfeeding === 'Yes',
        occupation: prescriptionData.patient.occupation,
        weight: prescriptionData.patient.weight,
        height: prescriptionData.patient.height,
        bmi: prescriptionData.patient.bmi,
        referred_by_doctor_name: prescriptionData.patient.referredBy.doctor.name,
        referred_by_doctor_qualification: prescriptionData.patient.referredBy.doctor.qualification,
        referred_by_doctor_address: prescriptionData.patient.referredBy.doctor.address,
        referred_by_hospital_name: prescriptionData.patient.referredBy.hospital.name,
        referred_by_hospital_address: prescriptionData.patient.referredBy.hospital.address
      };

      const result = await postJson(patientUrl, patientData);
      updateNestedPrescriptionData('patient', 'id', result.id);

      navigate('/medical-info');
    } catch (error) {
      console.error('Error saving patient data:', error);
      alert('Failed to save patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 underline">Patient Information</h2>

      {/* Search Section */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Search Existing Patient</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
            <input
              type="text"
              placeholder="Search by name, registration number, or phone..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={searchPatients}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-sm"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                  setSearchError(null);
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 shadow-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {searchError && (
          <div className="mt-3 text-red-600 text-sm bg-red-50 p-2 rounded-md">
            {searchError}
          </div>
        )}
        {showSearchResults && (
          <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm max-h-60 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="p-3 text-gray-500 text-center">No patients found.</p>
            ) : (
              searchResults.map((patient) => (
                <div
                  key={patient.id}
                  className="p-3 border-b last:border-b-0 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                  onClick={() => handlePatientSelect(patient)}
                >
                  <p className="font-medium text-gray-800">
                    {patient.title ? `${patient.title} ` : ''}{patient.first_name} {patient.last_name}
                  </p>
                  <p className="text-sm text-gray-600">Reg: {patient.registration_no || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Phone: {patient.phone || 'N/A'}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {Object.values(errors).map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      {/* Basic Information Section */}
      <div className="mb-6 border p-4 rounded-lg">
        <h3 className="font-bold mb-4 underline">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Registration Number</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.registrationNo}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date & Time</label>
            <input
              type="datetime-local"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.dateTime}
              onChange={(e) => updateNestedPrescriptionData('patient', 'dateTime', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
            <div className="flex items-center">
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-l-md p-2"
                value={prescriptionData.patient.aadhaarNumber}
                onChange={(e) => updateNestedPrescriptionData('patient', 'aadhaarNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="12-digit Aadhaar"
              />
              <button
                type="button"
                className="mt-1 bg-blue-500 text-white px-3 py-2 rounded-r-md"
                onClick={handleAadhaarScan}
              >
                Scan
              </button>
            </div>
            {errors.aadhaarNumber && <p className="text-red-600 text-sm mt-1">{errors.aadhaarNumber}</p>}
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="mb-6 border p-4 rounded-lg">
        <h3 className="font-bold mb-4 underline">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.title}
              onChange={(e) => updateNestedPrescriptionData('patient', 'title', e.target.value)}
            >
              <option value="">Select</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
              <option value="Dr">Dr</option>
              <option value="Prof">Prof</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.firstName}
              onChange={(e) => updateNestedPrescriptionData('patient', 'firstName', e.target.value)}
            />
            {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Middle Name</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.middleName}
              onChange={(e) => updateNestedPrescriptionData('patient', 'middleName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.lastName}
              onChange={(e) => updateNestedPrescriptionData('patient', 'lastName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.phone}
              onChange={(e) => updateNestedPrescriptionData('patient', 'phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit number"
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.email}
              onChange={(e) => updateNestedPrescriptionData('patient', 'email', e.target.value)}
              placeholder="patient@example.com"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Guardian Information Section */}
      <div className="mb-6 border p-4 rounded-lg">
        <h3 className="font-bold mb-4 underline">Guardian Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Guardian Title</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.guardianTitle}
              onChange={(e) => updateNestedPrescriptionData('patient', 'guardianTitle', e.target.value)}
            >
              <option value="">Select</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
              <option value="Dr">Dr</option>
              <option value="Prof">Prof</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Guardian First Name</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.guardianFirstName}
              onChange={(e) => updateNestedPrescriptionData('patient', 'guardianFirstName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Guardian Middle Name</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.guardianMiddleName}
              onChange={(e) => updateNestedPrescriptionData('patient', 'guardianMiddleName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Guardian Last Name</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.guardianLastName}
              onChange={(e) => updateNestedPrescriptionData('patient', 'guardianLastName', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="mb-6 border p-4 rounded-lg">
        <h3 className="font-bold mb-4 underline">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Line 1</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.address.line1}
              onChange={(e) => handleAddressChange('line1', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Line 2</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.address.line2}
              onChange={(e) => handleAddressChange('line2', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.address.state}
              onChange={handleStateChange}
            >
              <option value="">Select State</option>
              {indianStates.map((state, index) => (
                <option key={index} value={state.name}>{state.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.address.district}
              onChange={(e) => handleAddressChange('district', e.target.value)}
              disabled={!prescriptionData.patient.address.state}
            >
              <option value="">Select District</option>
              {getDistricts().map((district, index) => (
                <option key={index} value={district}>{district}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PIN Code</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.address.pin}
              onChange={handlePinCodeLookup}
              placeholder="6-digit PIN"
            />
            {errors.pin && <p className="text-red-600 text-sm mt-1">{errors.pin}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.address.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
            >
              {countryOptions.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="mb-6 border p-4 rounded-lg">
        <h3 className="font-bold mb-4 underline">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Age Input Type</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={ageInputType}
              onChange={(e) => {
                setAgeInputType(e.target.value);
                setDobInput('');
                setYearInput('');
                setInfantInput('');
                updateNestedPrescriptionData('patient', 'dob', '');
                updateNestedPrescriptionData('patient', 'age', '');
                updateNestedPrescriptionData('patient', 'age_display', '');
                setErrors(prev => ({ ...prev, dob: '' }));
              }}
            >
              <option value="DOB">Exact DOB (DD/MM/YYYY)</option>
              <option value="Year">Year Only (YYYY)</option>
              <option value="Infant">Infant (Days/Months)</option>
            </select>
          </div>
          {ageInputType === 'DOB' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth (DD/MM/YYYY)</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={dobInput}
                onChange={(e) => handleDOBInput(e.target.value)}
                placeholder="DD/MM/YYYY"
                maxLength="10"
              />
              {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob}</p>}
            </div>
          )}
          {ageInputType === 'Year' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Year of Birth (YYYY)</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={yearInput}
                onChange={(e) => handleYearInput(e.target.value)}
                placeholder="YYYY"
                maxLength="4"
              />
              {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob}</p>}
            </div>
          )}
          {ageInputType === 'Infant' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Infant Age (e.g., 2M or 15D)</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={infantInput}
                onChange={(e) => handleInfantInput(e.target.value)}
                placeholder="e.g., 2M or 15D"
                maxLength="4"
              />
              {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
              value={ageInputType === 'Infant' ? (prescriptionData.patient.age_display || '') : (prescriptionData.patient.age || '')}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.sex}
              onChange={(e) => updateNestedPrescriptionData('patient', 'sex', e.target.value)}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Marital Status</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.maritalStatus}
              onChange={(e) => updateNestedPrescriptionData('patient', 'maritalStatus', e.target.value)}
            >
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Occupation</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.occupation}
              onChange={(e) => updateNestedPrescriptionData('patient', 'occupation', e.target.value)}
            >
              <option value="">Select</option>
              {occupationOptions.map((occupation, index) => (
                <option key={index} value={occupation}>{occupation}</option>
              ))}
            </select>
          </div>
          {prescriptionData.patient.sex === 'Female' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pregnant</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={prescriptionData.patient.pregnancy}
                  onChange={(e) => updateNestedPrescriptionData('patient', 'pregnancy', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Breastfeeding</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={prescriptionData.patient.breastfeeding}
                  onChange={(e) => updateNestedPrescriptionData('patient', 'breastfeeding', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input
              type="number"
              placeholder="Enter height"
              value={prescriptionData.patient.height || ""}
              onChange={(e) => {
                const value = e.target.value;
                updateNestedPrescriptionData("patient", "height", value === "" ? "" : parseFloat(value));
                if (value && prescriptionData.patient.weight) {
                  const h = parseFloat(value) / 100;
                  const bmi = prescriptionData.patient.weight / (h * h);
                  updateNestedPrescriptionData("patient", "bmi", bmi.toFixed(2));
                } else {
                  updateNestedPrescriptionData("patient", "bmi", "");
                }
              }}
              className="w-full p-2 border rounded appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              placeholder="Enter weight"
              value={prescriptionData.patient.weight || ""}
              onChange={(e) => {
                const value = e.target.value;
                updateNestedPrescriptionData("patient", "weight", value === "" ? "" : parseFloat(value));
                if (value && prescriptionData.patient.height) {
                  const h = prescriptionData.patient.height / 100;
                  const bmi = parseFloat(value) / (h * h);
                  updateNestedPrescriptionData("patient", "bmi", bmi.toFixed(2));
                } else {
                  updateNestedPrescriptionData("patient", "bmi", "");
                }
              }}
              className="w-full p-2 border rounded appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={prescriptionData.patient.bmi || ""}
                readOnly
                className="w-32 p-2 border rounded bg-gray-100"
              />
              {prescriptionData.patient.bmi && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${parseFloat(prescriptionData.patient.bmi) < 18.5
                    ? "bg-blue-100 text-blue-800"
                    : parseFloat(prescriptionData.patient.bmi) < 24.9
                      ? "bg-green-100 text-green-800"
                      : parseFloat(prescriptionData.patient.bmi) < 29.9
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                >
                  {parseFloat(prescriptionData.patient.bmi) < 18.5
                    ? "Underweight"
                    : parseFloat(prescriptionData.patient.bmi) < 24.9
                      ? "Normal"
                      : parseFloat(prescriptionData.patient.bmi) < 29.9
                        ? "Overweight"
                        : "Obese"}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.bloodGroup}
              onChange={(e) => updateNestedPrescriptionData('patient', 'bloodGroup', e.target.value)}
            >
              <option value="">Select</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Referred By Section */}
      <div className="mb-6 border p-4 rounded-lg">
        <h3 className="font-bold mb-4 underline">Referred By</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.referredBy.doctor.name}
              onChange={(e) => handleChange('patient', 'referredBy', { ...prescriptionData.patient.referredBy, doctor: { ...prescriptionData.patient.referredBy.doctor, name: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor Qualification</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.referredBy.doctor.qualification}
              onChange={(e) => handleChange('patient', 'referredBy', { ...prescriptionData.patient.referredBy, doctor: { ...prescriptionData.patient.referredBy.doctor, qualification: e.target.value } })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Doctor Address</label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows="2"
              value={prescriptionData.patient.referredBy.doctor.address}
              onChange={(e) => handleChange('patient', 'referredBy', { ...prescriptionData.patient.referredBy, doctor: { ...prescriptionData.patient.referredBy.doctor, address: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.referredBy.hospital.name}
              onChange={(e) => handleChange('patient', 'referredBy', { ...prescriptionData.patient.referredBy, hospital: { ...prescriptionData.patient.referredBy.hospital, name: e.target.value } })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Hospital Address</label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows="2"
              value={prescriptionData.patient.referredBy.hospital.address}
              onChange={(e) => handleChange('patient', 'referredBy', { ...prescriptionData.patient.referredBy, hospital: { ...prescriptionData.patient.referredBy.hospital, address: e.target.value } })}
            />
          </div>
        </div>
      </div>

      {/* Billing Information Section */}
      <div className="mt-6 border p-4 rounded-lg">
        <h3 className="font-bold mb-4 underline">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={prescriptionData.patient.billingInfo?.paymentMethod || ''}
              onChange={(e) => updateNestedPrescriptionData('patient', 'billingInfo', {
                ...prescriptionData.patient.billingInfo,
                paymentMethod: e.target.value
              })}
            >
              <option value="">Select</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Insurance">Insurance</option>
              <option value="Online Payment">Online Payment</option>
            </select>
          </div>
          {prescriptionData.patient.billingInfo?.paymentMethod === 'Insurance' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={prescriptionData.patient.billingInfo?.insuranceProvider || ''}
                  onChange={(e) => updateNestedPrescriptionData('patient', 'billingInfo', {
                    ...prescriptionData.patient.billingInfo,
                    insuranceProvider: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={prescriptionData.patient.billingInfo?.policyNumber || ''}
                  onChange={(e) => updateNestedPrescriptionData('patient', 'billingInfo', {
                    ...prescriptionData.patient.billingInfo,
                    policyNumber: e.target.value
                  })}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/hospital-doctor-info')}
        >
          Previous: Hospital Info
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleNext}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Next: Medical Information'}
        </button>
      </div>
    </div>
  );
};

export default PatientInfo;