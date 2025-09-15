// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrescriptionProvider } from './context/PrescriptionContext';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ManageDoctors from './pages/ManageDoctors';
import ManagePatients from './pages/ManagePatients';
import ChooseDoctor from './pages/ChooseDoctor';
import HospitalDoctorInfo from './pages/HospitalDoctorInfo';
import PatientInfo from './pages/PatientInfo';
import MedicalInfo from './pages/MedicalInfo';
import TreatmentInfo from './pages/TreatmentInfo';
import PrescriptionReview from './pages/PrescriptionReview';

function App() {
  return (
    <PrescriptionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="manage-doctors" element={<ManageDoctors />} />
            <Route path="manage-patients" element={<ManagePatients />} />
            
            {/* New Prescription Flow */}
            <Route path="new-prescription" element={<ChooseDoctor />} />
            <Route path="hospital-doctor-info" element={<HospitalDoctorInfo />} />
            <Route path="patient-info" element={<PatientInfo />} />
            <Route path="medical-info" element={<MedicalInfo />} />
            <Route path="treatment-info" element={<TreatmentInfo />} />
            <Route path="prescription-review" element={<PrescriptionReview />} />
          </Route>
        </Routes>
      </Router>
    </PrescriptionProvider>
  );
}

export default App;