// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "https://www.pcds.co.in/medsaveapi.php";

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

const fetchData = async (params) => {
  const url = `${API_BASE}?${new URLSearchParams(params)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "API error");
  return data.data;
};

const Dashboard = () => {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch hospitals
      const hospitalData = await fetchData({ action: "list", entity: "hospitals" });
      setHospitals(hospitalData.items || []);

      // Fetch doctors
      const doctorData = await fetchData({ action: "list", entity: "doctors" });
      setDoctors(doctorData.items || []);

      // Fetch patients (limit 100 for dashboard)
      const patientData = await fetchData({ action: "list", entity: "patients", limit: 100, offset: 0 });
      setPatients(patientData.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pieData = [
    { name: "Hospitals", value: hospitals.length },
    { name: "Doctors", value: doctors.length },
    { name: "Patients", value: patients.length },
  ];

  const barData = pieData.map((item) => ({ name: item.name, count: item.value }));

  if (loading)
    return <div className="p-6 text-center text-gray-600">Loading dashboard...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-600">
        Error loading dashboard: {error}
      </div>
    );

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-bold text-xl mb-4">Entity Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-bold text-xl mb-4">Entities Count</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
        <h2 className="font-bold text-xl mb-4">Summary</h2>
        <ul className="space-y-2 text-gray-700">
          <li>Total Hospitals: <span className="font-semibold">{hospitals.length}</span></li>
          <li>Total Doctors: <span className="font-semibold">{doctors.length}</span></li>
          <li>Total Patients: <span className="font-semibold">{patients.length}</span></li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
