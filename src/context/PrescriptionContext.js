// src/context/PrescriptionContext.js
import React, { createContext, useState } from 'react';

export const PrescriptionContext = createContext();

// ----------------- Mapping helpers (exported) -----------------
export const mapApiDoctorToContext = (d) => ({
  id: d?.id ?? '',
  name: d?.name ?? '',
  designation: d?.designation ?? '',
  registration_no: d?.registration_no ?? '', // Changed to match backend
  qualification: d?.qualification ?? '',
  phone: d?.phone ?? '',
  email: d?.email ?? '',
});

export const mapApiHospitalToContext = (h) => ({
  id: h?.id ?? '',
  logo: h?.logo ?? '',
  name: h?.name ?? '',
  registration_no: h?.registration_no ?? '', // Changed to match backend
  accreditations: h?.accreditations ?? '',
  address: h?.address ?? '',
  contact: h?.contact ?? '',
  email: h?.email ?? '',
  website: h?.website ?? '',
});

export const mapApiPatientToContext = (r) => ({
  id: r?.id ?? '',
  registration_no: r?.registration_no ?? '',
  aadhaar_number: r?.aadhaar_number ?? '',
  title: r?.title ?? '',
  first_name: r?.first_name ?? '',
  middle_name: r?.middle_name ?? '',
  last_name: r?.last_name ?? '',
  phone: r?.phone ?? '',
  email: r?.email ?? '',
  guardian_title: r?.guardian_title ?? '',
  guardian_first_name: r?.guardian_first_name ?? '',
  guardian_middle_name: r?.guardian_middle_name ?? '',
  guardian_last_name: r?.guardian_last_name ?? '',
  address: {
    line1: r?.address_line1 ?? '',
    line2: r?.address_line2 ?? '',
    district: r?.address_district ?? '',
    state: r?.address_state ?? '',
    country: r?.address_country ?? 'India',
    pin: r?.address_pin ?? '',
  },
  dob: r?.dob ?? '',
  age: r?.age ?? '',
  sex: r?.gender ?? '',
  marital_status: r?.marital_status ?? '',
  pregnancy: !!r?.pregnancy,
  breastfeeding: !!r?.breastfeeding,
  occupation: r?.occupation ?? '',
  weight: r?.weight ?? '',
  height: r?.height ?? '',
  bmi: r?.bmi ?? '',
  blood_group: r?.blood_group ?? '',
  referredBy: {
    doctor: {
      name: r?.referred_by_doctor_name ?? '',
      qualification: r?.referred_by_doctor_qualification ?? '',
      address: r?.referred_by_doctor_address ?? '',
    },
    hospital: {
      name: r?.referred_by_hospital_name ?? '',
      address: r?.referred_by_hospital_address ?? '',
    },
  },
  billingInfo: {
    paymentMethod: '',
    insuranceProvider: '',
    policyNumber: '',
  },
});

// ----------------- Provider -----------------
export const PrescriptionProvider = ({ children }) => {
  const initialHospitalData = {
    logo: '',
    name: '',
    registration_no: '', // Changed to match backend
    accreditations: '',
    address: '',
    contact: '',
    email: '',
    website: '',
    doctors: [
      {
        id: '',
        name: '',
        designation: '',
        registration_no: '', // Changed to match backend
        qualification: '',
        phone: '',
        email: '',
      },
    ],
  };

  const initialPatientData = {
    id: '',
    existingPatientId: '',
    registration_no: '', // Changed to match backend
    dateTime: '',
    title: '',
    first_name: '', // Changed to match backend
    middle_name: '', // Changed to match backend
    last_name: '', // Changed to match backend
    phone: '',
    email: '',
    guardian_title: '', // Changed to match backend
    guardian_first_name: '', // Changed to match backend
    guardian_middle_name: '', // Changed to match backend
    guardian_last_name: '', // Changed to match backend
    address: {
      line1: '',
      line2: '',
      district: '',
      state: '',
      country: 'India',
      pin: '',
    },
    referredBy: {
      doctor: {
        name: '',
        qualification: '',
        address: '',
      },
      hospital: {
        name: '',
        address: '',
      },
    },
    dob: '',
    age: '',
    sex: '',
    marital_status: '', // Changed to match backend
    occupation: '',
    weight: '',
    height: '',
    bmi: '',
    blood_group: '', // Changed to match backend
    pregnancy: false,
    breastfeeding: false,
    billingInfo: {
      paymentMethod: '',
      insuranceProvider: '',
      policyNumber: '',
    },
    aadhaar_number: '', // Changed to match backend
  };

  const initialMedicalData = {
    chiefComplaints: [],
    pastMedicalHistory: {
      hasHistory: false,
      conditions: [
        {
          name: '',
          date: '',
          month: '',
          year: '',
          medication: '',
        },
      ],
    },
    pastSurgicalHistory: {
      hasHistory: false,
      surgeries: [
        {
          type: '',
          date: '',
          month: '',
          year: '',
          medication: '',
        },
      ],
    },
    hypersensitivity: {
      hasHypersensitivity: false,
      drugs: [],
      customDrug: '',
    },
    vitals: {
      temperature: '',
      temperatureType: 'oral',
      pulse: '',
      pulseOximetry: '',
      respiratoryRate: '',
      bloodPressure: {
        systolic: '',
        diastolic: '',
        position: 'sitting',
      },
    },
    physicalExam: {
      eyes: { normal: true, description: '' },
      HEENT: { normal: true, description: '' },
      neck: { normal: true, description: '' },
      chestLungs: { normal: true, description: '' },
      cardiovascular: { normal: true, description: '' },
      abdomen: { normal: true, description: '' },
      genitourinary: { normal: true, description: '' },
      rectal: { normal: true, description: '' },
      musculoskeletal: { normal: true, description: '' },
      lymphNodes: { normal: true, description: '' },
      extremities: { normal: true, description: '' },
      skin: { normal: true, description: '' },
      neurological: { normal: true, description: '' },
      other: { normal: true, description: '' },
    },
  };

  const initialTreatmentData = {
    investigations: [],
    diagnosis: [],
    medications: [
      {
        sno: 1,
        genericName: '',
        brandName: '',
        manufacturer: '',
        dosage: '',
        administrationTime: '',
        duration: '',
        instructions: '',
      },
    ],
    dos: '',
    donts: '',
    followUp: '',
    followUpDate: null,
  };

  const initialPrescriptionData = {
    hospital: initialHospitalData,
    patient: initialPatientData,
    medical: initialMedicalData,
    treatment: initialTreatmentData,
  };

  const [prescriptionData, setPrescriptionData] = useState(initialPrescriptionData);

  // ----------------- state mutators -----------------
  const resetPrescriptionData = () => setPrescriptionData(initialPrescriptionData);

  const updatePrescriptionData = (section, data) => {
    setPrescriptionData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }));
  };

  const updateNestedPrescriptionData = (section, field, value, subField = null) => {
    setPrescriptionData((prev) => {
      const newData = { ...prev };
      if (subField) {
        if (!newData[section]) newData[section] = {};
        if (!newData[section][field]) newData[section][field] = {};
        newData[section][field][subField] = value;
      } else {
        newData[section] = { ...(newData[section] || {}), [field]: value };
      }
      return newData;
    });
  };

  const updateArrayField = (section, field, index, subField, value) => {
    setPrescriptionData((prev) => {
      const newData = { ...prev };
      if (!newData[section]) newData[section] = {};
      if (!Array.isArray(newData[section][field])) newData[section][field] = [];
      // ensure element exists
      if (!newData[section][field][index]) newData[section][field][index] = {};
      newData[section][field][index][subField] = value;
      return newData;
    });
  };

  const addArrayItem = (section, field, template) => {
    setPrescriptionData((prev) => {
      const newData = { ...prev };
      if (!newData[section]) newData[section] = {};
      if (!Array.isArray(newData[section][field])) newData[section][field] = [];
      newData[section][field].push(template);
      return newData;
    });
  };

  const removeArrayItem = (section, field, index) => {
    setPrescriptionData((prev) => {
      const newData = { ...prev };
      if (newData[section] && Array.isArray(newData[section][field])) {
        newData[section][field].splice(index, 1);
      }
      return newData;
    });
  };

  // ----------------- Load existing patient & related history -----------------
  const loadExistingPatient = async (patientId) => {
    const API_BASE = 'https://www.pcds.co.in/medsaveapi.php';
    try {
      // 1) Fetch patient details
      const patientUrl = `${API_BASE}?action=get&entity=patients&id=${patientId}`;
      const patientRes = await fetch(patientUrl);
      const patientJson = await patientRes.json();
      if (!patientJson.ok) throw new Error('Failed to load patient');

      const mappedPatient = mapApiPatientToContext(patientJson.data);
      updatePrescriptionData('patient', mappedPatient);

      // 2) Fetch prescriptions for patient (get latest)
      const presUrl = `${API_BASE}?action=list&entity=prescriptions&patient_id=${patientId}`;
      const presRes = await fetch(presUrl);
      const presJson = await presRes.json();
      if (!presJson.ok || !presJson.data.items.length) return;

      const latestPresId = presJson.data.items[0].id;

      // 3) Medical histories
      const medHistUrl = `${API_BASE}?action=list&entity=medical_histories&prescription_id=${latestPresId}`;
      const medHistRes = await fetch(medHistUrl);
      const medHistJson = await medHistRes.json();
      if (medHistJson.ok) {
        updateNestedPrescriptionData('medical', 'pastMedicalHistory', {
          hasHistory: true,
          conditions: medHistJson.data.items.map((hist) => ({
            name: hist.condition_name ?? hist.condition ?? '',
            date: hist.condition_date ?? hist.onset_date?.split('-')?.[2] ?? '',
            month: hist.condition_month ?? hist.onset_date?.split('-')?.[1] ?? '',
            year: hist.condition_year ?? hist.onset_date?.split('-')?.[0] ?? '',
            medication: hist.medication ?? '',
          })),
        });
      }

      // 4) Surgical histories
      const surgHistUrl = `${API_BASE}?action=list&entity=surgical_histories&prescription_id=${latestPresId}`;
      const surgHistRes = await fetch(surgHistUrl);
      const surgHistJson = await surgHistRes.json();
      if (surgHistJson.ok) {
        updateNestedPrescriptionData('medical', 'pastSurgicalHistory', {
          hasHistory: true,
          surgeries: surgHistJson.data.items.map((hist) => ({
            type: hist.surgery_type ?? '',
            date: hist.surgery_date ?? '',
            month: hist.surgery_month ?? '',
            year: hist.surgery_year ?? '',
            medication: hist.medication ?? '',
          })),
        });
      }

      // 5) Hypersensitivities
      const hyperUrl = `${API_BASE}?action=list&entity=hypersensitivities&prescription_id=${latestPresId}`;
      const hyperRes = await fetch(hyperUrl);
      const hyperJson = await hyperRes.json();
      if (hyperJson.ok) {
        updateNestedPrescriptionData('medical', 'hypersensitivity', {
          hasHypersensitivity: true,
          drugs: hyperJson.data.items.map((h) => h.drug_name ?? h.name ?? ''),
        });
      }

      // 6) Vitals (latest)
      const vitalsUrl = `${API_BASE}?action=list&entity=vitals&prescription_id=${latestPresId}`;
      const vitalsRes = await fetch(vitalsUrl);
      const vitalsJson = await vitalsRes.json();
      if (vitalsJson.ok && Array.isArray(vitalsJson.data.items) && vitalsJson.data.items.length) {
        const latestVitals = vitalsJson.data.items[0];
        updateNestedPrescriptionData('medical', 'vitals', {
          temperature: latestVitals.temperature ?? '',
          temperatureType: latestVitals.temperature_type ?? 'oral',
          pulse: latestVitals.pulse ?? '',
          respiratoryRate: latestVitals.respiratory_rate ?? '',
          bloodPressure: {
            systolic: latestVitals.blood_pressure_systolic ?? '',
            diastolic: latestVitals.blood_pressure_diastolic ?? '',
            position: latestVitals.blood_pressure_position ?? 'sitting',
          },
          pulseOximetry: latestVitals.pulse_oximetry ?? '',
        });
      }

      // 7) Physical exams
      const examsUrl = `${API_BASE}?action=list&entity=physical_exams&prescription_id=${latestPresId}`;
      const examsRes = await fetch(examsUrl);
      const examsJson = await examsRes.json();
      if (examsJson.ok) {
        // copy current structure so we don't overwrite unrelated fields
        const newExam = { ...(prescriptionData?.medical?.physicalExam || initialMedicalData.physicalExam) };
        examsJson.data.items.forEach((exam) => {
          // exam.exam_type should match keys in physicalExam
          newExam[exam.exam_type] = {
            normal: !!exam.is_normal,
            description: exam.description ?? '',
          };
        });
        updateNestedPrescriptionData('medical', 'physicalExam', newExam);
      }

      // NOTE: you can add investigations/diagnoses/medications pulls here similarly if you store them
    } catch (error) {
      console.error('Error loading patient:', error);
      alert('Failed to load existing patient data.');
    }
  };

  // ----------------- Provider value -----------------
  return (
    <PrescriptionContext.Provider
      value={{
        prescriptionData,
        updatePrescriptionData,
        updateNestedPrescriptionData,
        updateArrayField,
        addArrayItem,
        removeArrayItem,
        resetPrescriptionData,
        loadExistingPatient,
      }}
    >
      {children}
    </PrescriptionContext.Provider>
  );
};