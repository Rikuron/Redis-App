const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to Redis
const client = redis.createClient({
  url: 'redis://@127.0.0.1:6379'  // Default Redis connection
});

client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

// Simple user model for demonstration
const users = [
  { username: 'admin', password: 'admin123', role: 'Admin' },
  { username: 'viewer', password: 'viewer123', role: 'Viewer' }
];

// Middleware to authenticate user
const authenticateUser = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Internal server error' });
    }
    const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username: user.username, role: user.role });

  } else {
    console.error('Invalid login attempt:', { username, password });
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

// Middleware to check user roles
const authorize = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      if (roles.length && !roles.includes(user.role)) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };
};

// CRUD Operations

// Route to save student data
app.post('/students', authorize(['Admin']), async (req, res) => {
  const { id, name, course, age, address, email, phone, gender, enrollmentDate } = req.body;

  // Validate input fields
  if (!id || !name || !course || !age || !address || !email || !phone || !gender || !enrollmentDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Set student data in Redis
    const studentData = { name, course, age, address, email, phone, gender, enrollmentDate };

    // Save student data in Redis hash
    await client.hSet(`student:${id}`, 'name', studentData.name);
    await client.hSet(`student:${id}`, 'course', studentData.course);
    await client.hSet(`student:${id}`, 'age', studentData.age);
    await client.hSet(`student:${id}`, 'address', studentData.address);
    await client.hSet(`student:${id}`, 'email', studentData.email);
    await client.hSet(`student:${id}`, 'phone', studentData.phone);
    await client.hSet(`student:${id}`, 'gender', studentData.gender);
    await client.hSet(`student:${id}`, 'enrollmentDate', studentData.enrollmentDate);

    // Respond with success message
    res.status(201).json({ message: 'Student saved successfully' });
  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({ message: 'Failed to save student' });
  }
});

// Read (R)
app.get('/students/:id', authorize(['Admin', 'Viewer']), async (req, res) => {
  const id = req.params.id;
  const student = await client.hGetAll(`student:${id}`);
  if (Object.keys(student).length === 0) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});

// Read all students
app.get('/students', authorize(['Admin', 'Viewer']), async (req, res) => {
  const keys = await client.keys('student:*');
  const students = await Promise.all(keys.map(async (key) => {
    return { id: key.split(':')[1], ...(await client.hGetAll(key)) };
  }));
  res.json(students);
});

// Update (U)
app.put('/students/:id', authorize(['Admin']), async (req, res) => {
  const id = req.params.id;
  const { name, course, age, address, email, phone, gender, enrollmentDate } = req.body;

  if (!name && !course && !age && !address && !email && !phone && !gender && !enrollmentDate) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const existingStudent = await client.hGetAll(`student:${id}`);
    if (Object.keys(existingStudent).length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student data in Redis
    if (name) await client.hSet(`student:${id}`, 'name', name);
    if (course) await client.hSet(`student:${id}`, 'course', course);
    if (age) await client.hSet(`student:${id}`, 'age', age);
    if (address) await client.hSet(`student:${id}`, 'address', address);
    if (email) await client.hSet(`student:${id}`, 'email', email);
    if (phone) await client.hSet(`student:${id}`, 'phone', phone);
    if (gender) await client.hSet(`student:${id}`, 'gender', gender);
    if (enrollmentDate) await client.hSet(`student:${id}`, 'enrollmentDate', enrollmentDate);

    res.status(200).json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

// Delete (D)
app.delete('/students/:id', authorize(['Admin']), async (req, res) => {
  const id = req.params.id;
  await client.del(`student:${id}`);
  res.status(200).json({ message: 'Student deleted successfully' });
});

// Login route
app.post('/login', authenticateUser);

// CSV Import route
app.post('/students/import', authorize(['Admin']), async (req, res) => {
  const students = req.body;
  
  // Validate CSV structure
  if (!Array.isArray(students)) {
    return res.status(400).json({ message: 'Invalid CSV data format' });
  }

  try {
    // Validate each student record
    for (const student of students) {
      if (!student.id || !student.name || !student.course || 
          !student.age || !student.address || !student.email || 
          !student.phone || !student.gender || !student.enrollmentDate) {
        return res.status(400).json({ message: 'Missing required fields in CSV data' });
      }

      // Validate data types
      if (typeof student.name !== 'string' ||
          typeof student.course !== 'string' ||
          typeof student.address !== 'string' ||
          typeof student.email !== 'string' ||
          typeof student.phone !== 'string' ||
          typeof student.gender !== 'string' ||
          isNaN(Number(student.age)) ||
          isNaN(Date.parse(student.enrollmentDate))) {
        return res.status(400).json({ message: 'Invalid data types in CSV' });
      }
    }

    // Save all valid students to Redis
    await Promise.all(students.map(async (student) => {
      await client.hSet(`student:${student.id}`, 'name', student.name);
      await client.hSet(`student:${student.id}`, 'course', student.course);
      await client.hSet(`student:${student.id}`, 'age', student.age);
      await client.hSet(`student:${student.id}`, 'address', student.address);
      await client.hSet(`student:${student.id}`, 'email', student.email);
      await client.hSet(`student:${student.id}`, 'phone', student.phone);
      await client.hSet(`student:${student.id}`, 'gender', student.gender);
      await client.hSet(`student:${student.id}`, 'enrollmentDate', student.enrollmentDate);

    }));

    res.status(201).json({ message: 'CSV data imported successfully' });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ message: 'Failed to import CSV data' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
