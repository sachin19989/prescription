import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrescriptionContext } from '../context/PrescriptionContext';

const PrescriptionReview = () => {
  const navigate = useNavigate();
  const { prescriptionData } = useContext(PrescriptionContext);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format datetime for display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const submitPrescription = async () => {
    setLoading(true);
    try {
      // Prepare data for API
      const prescriptionBundle = {
        prescription: {
          patient_id: prescriptionData.patient.id,
          doctor_id: prescriptionData.hospital.doctors[0].id,
          hospital_id: prescriptionData.hospital.id,
          date_time: new Date().toISOString()  // Fixed to date_time
        },
        chief_complaints: prescriptionData.medical.chiefComplaints.map(complaint => ({
          complaint
        })),
        medical_histories: prescriptionData.medical.pastMedicalHistory.conditions.map(condition => ({
          condition: condition.name,
          onset_date: `${condition.year}-${condition.month}-${condition.date}`,
          medication: condition.medication
        })),
        surgical_histories: prescriptionData.medical.pastSurgicalHistory.surgeries.map(surgery => ({
          surgery_type: surgery.type,
          surgery_date: `${surgery.year}-${surgery.month}-${surgery.date}`,
          medication: surgery.medication
        })),
        hypersensitivities: prescriptionData.medical.hypersensitivity.drugs.map(drug => ({
          drug_name: drug
        })),
        vitals: [{
          temperature: prescriptionData.medical.vitals.temperature,
          temperature_type: prescriptionData.medical.vitals.temperatureType,
          pulse: prescriptionData.medical.vitals.pulse,
          respiratory_rate: prescriptionData.medical.vitals.respiratoryRate,
          blood_pressure_systolic: prescriptionData.medical.vitals.bloodPressure.systolic,
          blood_pressure_diastolic: prescriptionData.medical.vitals.bloodPressure.diastolic,
          blood_pressure_position: prescriptionData.medical.vitals.bloodPressure.position,
          pulse_oximetry: prescriptionData.medical.vitals.pulseOximetry
        }],
        physical_exams: Object.entries(prescriptionData.medical.physicalExam).map(([key, value]) => ({
          exam_type: key,
          is_normal: value.normal,
          description: value.description
        })),
        investigations: prescriptionData.treatment.investigations.map(investigation => ({
          investigation_type: investigation
        })),
        diagnoses: prescriptionData.treatment.diagnosis.map(diagnosis => ({
          diagnosis
        })),
        medications: prescriptionData.treatment.medications.map(medication => ({
          generic_name: medication.genericName,
          brand_name: medication.brandName,
          manufacturer: medication.manufacturer,
          dosage: medication.dosage,
          administration_time: medication.administrationTime,
          duration: medication.duration,
          instructions: medication.instructions
        })),
        instructions: [{
          dos: prescriptionData.treatment.dos,
          donts: prescriptionData.treatment.donts,
          follow_up: prescriptionData.treatment.followUp,
          follow_up_date: prescriptionData.treatment.followUpDate
        }]
      };

      console.log('Submitting Prescription Bundle:', prescriptionBundle);  // For debugging

      // Bundle API call
      const url = `${API_BASE}?action=save_prescription_bundle`;
      const result = await postJson(url, prescriptionBundle);

      setSubmitted(true);
      alert('Prescription submitted successfully!');

    } catch (error) {
      console.error('Submission Error:', error);
      alert('Failed to submit prescription: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const doctor = prescriptionData.hospital.doctors[0] || {};

  return (
    <div className="bg-white p-6 rounded-lg shadow-md print:p-0 print:shadow-none max-w-[210mm] mx-auto print:max-w-none print:w-[210mm] print:h-[297mm] print:m-0">
      <header className="mb-6 bg-blue-100 border-b-4 border-blue-600 p-4 rounded-lg print:rounded-none print:bg-white">
        <div className="flex items-center justify-between">
          {/* Logo */}
          {prescriptionData.hospital.logo && (
            <img
              src={prescriptionData.hospital.logo}
              alt="Hospital Logo"
              className="h-16 w-16 object-contain rounded-full border-2 border-blue-400 shadow-sm"
            />
          )}

          {/* Hospital Info */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-3xl font-bold text-blue-900 uppercase">
              {prescriptionData.hospital.name}
            </h1>
            <p className="text-xs text-gray-700">{prescriptionData.hospital.accreditations}</p>
            <p className="text-xs text-gray-600">{prescriptionData.hospital.address}</p>
            <p className="text-xs text-gray-600">
              {prescriptionData.hospital.contact} | {prescriptionData.hospital.email}
            </p>
            <p className="text-xs text-gray-600">{prescriptionData.hospital.website}</p>
            <p className="text-xs font-semibold text-blue-800 mt-1">
              Reg. No: {prescriptionData.hospital.registration_no}
            </p>
          </div>

          {/* Doctor Info */}
          <div className="text-right text-sm leading-tight">
            <h3 className="text-md font-bold text-blue-800">Dr. {doctor.name}</h3>
            <p>{doctor.designation}</p>
            <p>{doctor.qualification}</p>
            <p>Reg. No: {doctor.registration_no}</p>
            <p>{doctor.phone}</p>
            <p>{doctor.email}</p>
          </div>
        </div>
      </header>


      {/* Patient Information */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Patient Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-semibold">Registration No:</span> {prescriptionData.patient.registration_no}</p>
            <p><span className="font-semibold">Date & Time:</span> {formatDateTime(prescriptionData.patient.dateTime)}</p>
            <p><span className="font-semibold">Name:</span> {prescriptionData.patient.title} {prescriptionData.patient.first_name} {prescriptionData.patient.middle_name} {prescriptionData.patient.last_name}</p>
            <p><span className="font-semibold">Age/Sex:</span> {prescriptionData.patient.age} / {prescriptionData.patient.sex}</p>
            <p><span className="font-semibold">Phone:</span> {prescriptionData.patient.phone}</p>
            <p><span className="font-semibold">Email:</span> {prescriptionData.patient.email}</p>
          </div>
          <div>
            <p><span className="font-semibold">Address:</span> {prescriptionData.patient.address.line1}, {prescriptionData.patient.address.line2}, {prescriptionData.patient.address.district}, {prescriptionData.patient.address.state}, {prescriptionData.patient.address.country} - {prescriptionData.patient.address.pin}</p>
            <p><span className="font-semibold">Guardian:</span> {prescriptionData.patient.guardian_title} {prescriptionData.patient.guardian_first_name} {prescriptionData.patient.guardian_middle_name} {prescriptionData.patient.guardian_last_name}</p>
            <p><span className="font-semibold">Referred By Doctor:</span> {prescriptionData.patient.referredBy.doctor.name}, {prescriptionData.patient.referredBy.doctor.qualification}, {prescriptionData.patient.referredBy.doctor.address}</p>
            <p><span className="font-semibold">Referred By Hospital:</span> {prescriptionData.patient.referredBy.hospital.name}, {prescriptionData.patient.referredBy.hospital.address}</p>
            <p><span className="font-semibold">Marital Status:</span> {prescriptionData.patient.marital_status}</p>
            <p><span className="font-semibold">Occupation:</span> {prescriptionData.patient.occupation}</p>
            <p><span className="font-semibold">Weight/Height/BMI:</span> {prescriptionData.patient.weight} kg / {prescriptionData.patient.height} cm / {prescriptionData.patient.bmi}</p>
            <p><span className="font-semibold">Blood Group:</span> {prescriptionData.patient.blood_group}</p>
            <p><span className="font-semibold">Pregnancy/Breastfeeding:</span> {prescriptionData.patient.pregnancy ? 'Yes' : 'No'} / {prescriptionData.patient.breastfeeding ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Chief Complaints */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Chief Complaints</h2>
        <ul className="list-disc pl-5 text-sm">
          {prescriptionData.medical.chiefComplaints.map((complaint, index) => (
            <li key={index}>{complaint}</li>
          ))}
        </ul>
      </div>

      {/* Past Medical History */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Past Medical History</h2>
        {prescriptionData.medical.pastMedicalHistory.hasHistory ? (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1 text-left">Condition</th>
                <th className="border p-1 text-left">Date</th>
                <th className="border p-1 text-left">Medication</th>
              </tr>
            </thead>
            <tbody>
              {prescriptionData.medical.pastMedicalHistory.conditions.map((condition, index) => (
                <tr key={index}>
                  <td className="border p-1">{condition.name}</td>
                  <td className="border p-1">{condition.date}/{condition.month}/{condition.year}</td>
                  <td className="border p-1">{condition.medication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-600">No past medical history.</p>
        )}
      </div>

      {/* Past Surgical History */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Past Surgical History</h2>
        {prescriptionData.medical.pastSurgicalHistory.hasHistory ? (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1 text-left">Surgery Type</th>
                <th className="border p-1 text-left">Date</th>
                <th className="border p-1 text-left">Medication</th>
              </tr>
            </thead>
            <tbody>
              {prescriptionData.medical.pastSurgicalHistory.surgeries.map((surgery, index) => (
                <tr key={index}>
                  <td className="border p-1">{surgery.type}</td>
                  <td className="border p-1">{surgery.date}/{surgery.month}/{surgery.year}</td>
                  <td className="border p-1">{surgery.medication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-600">No past surgical history.</p>
        )}
      </div>

      {/* Hypersensitivity */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Drug Hypersensitivity</h2>
        {prescriptionData.medical.hypersensitivity.hasHypersensitivity ? (
          <ul className="list-disc pl-5 text-sm">
            {prescriptionData.medical.hypersensitivity.drugs.map((drug, index) => (
              <li key={index}>{drug}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No hypersensitivity.</p>
        )}
      </div>

      {/* Vitals */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Vitals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <p><span className="font-semibold">Temperature:</span> {prescriptionData.medical.vitals.temperature} °F ({prescriptionData.medical.vitals.temperatureType})</p>
          <p><span className="font-semibold">Pulse:</span> {prescriptionData.medical.vitals.pulse} beats/min</p>
          <p><span className="font-semibold">Respiratory Rate:</span> {prescriptionData.medical.vitals.respiratoryRate} breaths/min</p>
          <p><span className="font-semibold">Blood Pressure:</span> {prescriptionData.medical.vitals.bloodPressure.systolic}/{prescriptionData.medical.vitals.bloodPressure.diastolic} mm Hg ({prescriptionData.medical.vitals.bloodPressure.position})</p>
          <p><span className="font-semibold">Pulse Oximetry:</span> {prescriptionData.medical.vitals.pulseOximetry}%</p>
        </div>
      </div>

      {/* Physical Examination */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Physical Examination</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {Object.entries(prescriptionData.medical.physicalExam).map(([key, value]) => (
            <div key={key}>
              <p className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</p>
              <p>{value.normal ? 'Normal' : value.description || 'Abnormal (no description)'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Investigations */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Investigations</h2>
        <ul className="list-disc pl-5 text-sm">
          {prescriptionData.treatment.investigations.map((investigation, index) => (
            <li key={index}>{investigation}</li>
          ))}
        </ul>
      </div>

      {/* Diagnosis */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Diagnosis</h2>
        <ul className="list-disc pl-5 text-sm">
          {prescriptionData.treatment.diagnosis.map((diagnosis, index) => (
            <li key={index}>{diagnosis}</li>
          ))}
        </ul>
      </div>

      {/* Medications */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Medications</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-1 text-left">S.No</th>
              <th className="border p-1 text-left">Generic Name</th>
              <th className="border p-1 text-left">Brand Name</th>
              <th className="border p-1 text-left">Manufacturer</th>
              <th className="border p-1 text-left">Dosage</th>
              <th className="border p-1 text-left">Time</th>
              <th className="border p-1 text-left">Duration</th>
              <th className="border p-1 text-left">Instructions</th>
            </tr>
          </thead>
          <tbody>
            {prescriptionData.treatment.medications.map((medicine, index) => (
              <tr key={index}>
                <td className="border p-1">{medicine.sno}</td>
                <td className="border p-1">{medicine.genericName}</td>
                <td className="border p-1">{medicine.brandName}</td>
                <td className="border p-1">{medicine.manufacturer}</td>
                <td className="border p-1">{medicine.dosage}</td>
                <td className="border p-1">{medicine.administrationTime}</td>
                <td className="border p-1">{medicine.duration}</td>
                <td className="border p-1">{medicine.instructions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Instructions Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Instructions & Restrictions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Do's:</p>
            <div dangerouslySetInnerHTML={{ __html: prescriptionData.treatment.dos.replace(/\n/g, '<br />') }} />
          </div>
          <div>
            <p className="font-semibold">Don'ts:</p>
            <div dangerouslySetInnerHTML={{ __html: prescriptionData.treatment.donts.replace(/\n/g, '<br />') }} />
          </div>
        </div>
      </div>

      {/* Follow Up Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Follow Up</h2>
        <div className="text-sm">
          <p>{prescriptionData.treatment.followUp}</p>
          {prescriptionData.treatment.followUpDate && (
            <p className="mt-1"><span className="font-semibold">Follow Up Date:</span> {formatDate(prescriptionData.treatment.followUpDate)}</p>
          )}
        </div>
      </div>

      {/* Billing Information Section */}
      {prescriptionData.patient.billingInfo.paymentMethod && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 mb-2">Billing Information</h2>
          <div className="text-sm">
            <p><span className="font-semibold">Payment Method:</span> {prescriptionData.patient.billingInfo.paymentMethod}</p>
            {prescriptionData.patient.billingInfo.paymentMethod === 'Insurance' && (
              <>
                <p><span className="font-semibold">Insurance Provider:</span> {prescriptionData.patient.billingInfo.insuranceProvider}</p>
                <p><span className="font-semibold">Policy Number:</span> {prescriptionData.patient.billingInfo.policyNumber}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Doctor Signature Section */}
      <div className="mt-8 pt-4 border-t-2 border-gray-200 text-right">
        <div className="inline-block border-t-2 border-blue-800 pt-2 px-8">
          {prescriptionData.hospital.doctors.length > 0 && (
            <>
              <p className="font-semibold">{prescriptionData.hospital.doctors[0].name}</p>
              <p className="text-sm text-gray-600">{prescriptionData.hospital.doctors[0].qualification}</p>
              <div className="h-10 mt-2 w-24 ml-auto border-t-2 border-gray-400"></div>
              <p className="text-xs text-gray-600 mt-1">Signature</p>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons at Bottom - Non Printable */}
      {!submitted ? (
        <div className="flex justify-between mt-6 print:hidden">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            onClick={() => navigate('/treatment-info')}
          >
            Back to Treatment
          </button>

          <div className="flex space-x-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              onClick={handlePrint}
            >
              Print Prescription
            </button>

            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
              onClick={submitPrescription}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Prescription'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between mt-6 print:hidden">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>

          <div className="flex space-x-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              onClick={handlePrint}
            >
              Print Prescription
            </button>

            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
              onClick={() => navigate('/new-prescription')}
            >
              Create New Prescription
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionReview;