import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CSVReader from 'react-csv-reader';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import './App.css';
import Login from './Login';

const API_URL = 'http://localhost:5000/students';

function App() {
  const [formData, setFormData] = useState({ id: '', name: '', course: '', age: '', address: '', email: '', phone: '', gender: '', enrollmentDate: '' });
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [nameSearch, setNameSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [ageSearch, setAgeSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null); // State for JWT token

  // Fetch all students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` } // Include token in request
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token]);

  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new student
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Student added successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', course: '', age: '', address: '', email: '', phone: '', gender: '', enrollmentDate: '' });
    } catch (error) {
      toast.error('Error adding student!');
    }
  };

  // Update existing student
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Student updated successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', course: '', age: '', address: '', email: '', phone: '', gender: '', enrollmentDate: '' });
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating student!');
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  // Filter and sort students based on search queries
  const filteredStudents = students
    .filter(student =>
      student.name.toLowerCase().includes(nameSearch.toLowerCase()) &&
      student.course.toLowerCase().includes(courseSearch.toLowerCase()) &&
      (ageSearch ? student.age === Number(ageSearch) : true)
    )
    .sort((a, b) => a.id - b.id); // Sort by ID in ascending order

  // Handle CSV import
  const handleCSVImport = (data) => {
    const importedStudents = data
      .filter(row => row[0] && row[1] && row[2] && row[3] && row[4] && row[5] && row[6] && row[7])
      .map((row, index) => ({
        id: index + 1,
        name: row[0],
        course: row[1],
        age: row[2],
        address: row[3],
        email: row[4],
        phone: row[5],
        gender: row[6],
        enrollmentDate: row[7],
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
    <div className="container">
      <div className="bg-1">
        <div className="bg-2">
        </div>
      </div>
      <h1 className="app-title">Student CRUD with Redis</h1>

      {token ? (
        <>
          {loading ? (
            <p>Loading students...</p>
          ) : (
            <>
              {!isEditing ? (
                <form onSubmit={handleAddSubmit}>
                  <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required /> &nbsp;
                  <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required /> &nbsp;
                  <input type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} required /> &nbsp;
                  <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required  /> &nbsp;
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required  />
                  <br /> <br />
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required /> &nbsp;
                  <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required /> &nbsp;
                  <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required /> &nbsp;
                  <input type="date" name="enrollmentDate" placeholder="Enrollment Date" value={formData.enrollmentDate} onChange={handleChange} required /> &nbsp;
                  <br /> <br />
                  <button className="submit-button" type="submit">Add Student</button>
                </form>
              ) : (
                <form onSubmit={handleEditSubmit}>
                  <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required disabled /> &nbsp;
                  <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required /> &nbsp;
                  <input type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} required /> &nbsp;
                  <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required /> &nbsp;
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                  <br /> <br />
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required /> &nbsp;
                  <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required /> &nbsp;
                  <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required /> &nbsp;
                  <input type="date" name="enrollmentDate" placeholder="Enrollment Date" value={formData.enrollmentDate} onChange={handleChange} required /> &nbsp;
                  <br /> <br />
                  <button className="submit-button" type="submit">Update Student</button>
                </form>
              )}
            </>
          )}

          <h2>Student List</h2>

          <div className="search-container">
            <input 
              type="text"
              placeholder="Search by Name"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="search-bar"
            />
            <input 
              type="text"
              placeholder="Search by Course"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="search-bar"
            />
            <input 
              type="number"
              placeholder="Search by Age"
              value={ageSearch}
              onChange={(e) => setAgeSearch(e.target.value)}
              className="search-bar"
            />
          </div>

          <CSVReader
            cssClass="csv-reader-input"
            label="Import CSV "
            onFileLoaded={handleCSVImport}
            inputId="csvInput"
            inputStyle={{ color: 'red', marginBottom: '20px' }}
          />

          <table border="1" align="center" className="student-table">
            <thead>
              <tr>
                <th>&nbsp; &nbsp; ID &nbsp; &nbsp;</th>
                <th>&nbsp; Name &nbsp;</th>
                <th>&nbsp; Course &nbsp;</th>
                <th>&nbsp; Age &nbsp;</th>
                <th>&nbsp; Address &nbsp;</th>
                <th>Email</th>
                <th>Phone</th>
                <th>&nbsp; Gender &nbsp;</th>
                <th>&nbsp; Enrollment Date &nbsp;</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.sort((a, b) => a.id - b.id).map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.course}</td>
                  <td>{student.age}</td>
                  <td>{student.address}</td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                  <td>{student.gender}</td>
                  <td>{student.enrollmentDate}</td>
                  <td>
                    &nbsp; <button onClick={() => handleEdit(student)}>Edit</button> &nbsp;
                    <button onClick={() => handleDelete(student.id)}>Delete</button> &nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Data Visualization Charts */}
          <div className="data-visualization-container"> 
            <div className="course-chart-container">
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

            <div className="gender-chart-container">
              <h2> Gender Distribution </h2>
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
        </>
      ) : (
        <Login setToken={setToken} />
      )}
      <ToastContainer />
    </div>
  );
}

export default App;
