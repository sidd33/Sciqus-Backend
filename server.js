const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = require('./db');
const { authenticateToken } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const studentRoutes = require('./routes/students');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Apply authenticateToken to all routes EXCEPT /api/auth/register and /api/auth/login
app.use('/api/auth', authRoutes);

app.use(authenticateToken);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);

// Database Seeding Logic
const seedDatabase = async () => {
  try {
    // Check if courses exist
    const coursesResult = await pool.query('SELECT COUNT(*) FROM courses');
    if (parseInt(coursesResult.rows[0].count) === 0) {
      console.log('Seeding courses...');
      const courses = [
        ['Computer Science', 'CS101', 48, 'months'],
        ['Data Science', 'DS201', 12, 'months'],
        ['Web Development', 'WD301', 6, 'months'],
        ['Machine Learning', 'ML401', 8, 'months'],
        ['Cybersecurity', 'CY501', 12, 'months']
      ];
      for (const course of courses) {
        await pool.query(
          'INSERT INTO courses (course_name, course_code, course_duration, duration_unit) VALUES ($1, $2, $3, $4)',
          course
        );
      }
      console.log('Courses seeded.');
    }

    // Check if admin user exists
    const existingAdmin = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
    if (parseInt(existingAdmin.rows[0].count) === 0) {
      console.log('Seeding default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin@sciqus.com', hashedPassword, 'admin']
      );
      console.log('Admin user seeded.');
    }
  } catch (err) {
    console.error('Error during database seeding:', err.message);
  }
};

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Attempt to connect to DB and seed
  try {
    await pool.query('SELECT 1'); // Simple check
    console.log('Connected to PostgreSQL');
    await seedDatabase();
  } catch (err) {
    console.error('Failed to connect to PostgreSQL. Please check your DATABASE_URL in .env');
  }
});
