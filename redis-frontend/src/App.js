import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CSVReader from 'react-csv-reader';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const API_URL = 'http://localhost:5000/students';

function App() {
  const [formData, setFormData] = useState({ id: '', name: '', course: '', age: '', address: '' });
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new student
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      toast.success('Student added successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', course: '', age: '', address: '' });
    } catch (error) {
      toast.error('Error adding student!');
    }
  };

  // Update existing student
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.id}`, formData);
      toast.success('Student updated successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', course: '', age: '', address: '' });
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating student!');
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success('Student deleted!');
      fetchStudents();
    } catch (error) {
      toast.error('Error deleting student!');
    }
  };

  // Populate form for updating student
  const handleEdit = (student) => {
    setFormData(student);
    setIsEditing(true);
  };

  // Search students
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  }

  // Filter students based on search query
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle CSV import
  const handleCSVImport = (data) => {
    const importedStudents = data
    .filter(row => row[0] && row[1] && row[2] && row[3]) // Filter out empty rows
    .map((row, index) => ({
      id: index + 1,
      name: row[0],
      course: row[1],
      age: row[2],
      address: row[3],
    }));
    setStudents(importedStudents);
  };

  // Prepare data for the chart
  const courseData = students.reduce((acc, student) => {
    const course = student.course;
    if (!acc[course]) {
      acc[course] = { course, count: 0 };
    }
    acc[course].count++;
    return acc;
  }, {});

  const addressData = students.reduce((acc, student) => {
    const address = student.address;
    if (!acc[address]) {
      acc[address] = { address, count: 0 };
    }
    acc[address].count++;
    return acc;
  }, {});

  const chartData = Object.values(courseData);
  const addressChartData = Object.values(addressData);

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <h1>Student CRUD with Redis</h1>

      {!isEditing ? (
        <form onSubmit={handleAddSubmit}>
          <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <button type="submit">Add Student</button>
        </form>
      ) : (
        <form onSubmit={handleEditSubmit}>
          <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required disabled />
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <button type="submit">Update Student</button>
        </form>
      )}

      <h2>Student List</h2>

      <input 
        type="text"
        placeholder="Search students by Name"
        value={searchQuery}
        onChange={handleSearch}
        style={{ width: '50%', marginBottom: '35px', textAlign: 'center' }}
        className="search-bar"
      />

      <CSVReader
        cssClass="csv-reader-input"
        label="Import CSV "
        onFileLoaded={handleCSVImport}
        inputId="csvInput"
        inputStyle={{ color: 'red', marginBottom: '20px' }}
      />

      <table border="1" align="center" style={{ width: '80%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Course</th>
            <th>Age</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.course}</td>
              <td>{student.age}</td>
              <td>{student.address}</td>
              <td>
                <button onClick={() => handleEdit(student)}>Edit</button> &nbsp;
                <button onClick={() => handleDelete(student.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex' }}> 
        <div style={{ width: '45%', marginLeft: '50px' }}>
          <h2> Course Distribution </h2>
          <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="course"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ width: '45%'}}>
          <h2> Address Distribution </h2>
          <ResponsiveContainer width ="100%" height={400}>
            <BarChart data={addressChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="address" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ToastContainer />
    </div>
    
  );
}

export default App;