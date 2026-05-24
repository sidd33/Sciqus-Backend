const express = require('express');
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/courses - Get all courses with student count
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(s.student_id) as student_count 
      FROM courses c 
      LEFT JOIN students s ON c.course_id = s.course_id 
      GROUP BY c.course_id
      ORDER BY c.course_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/:id - Get single course
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses WHERE course_id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/:id/students - Get all students in a course (admin only)
router.get('/:id/students', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students WHERE course_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses - Create a course (admin only)
router.post('/', requireAdmin, async (req, res) => {
  const { course_name, course_code, course_duration, duration_unit } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO courses (course_name, course_code, course_duration, duration_unit) VALUES ($1, $2, $3, COALESCE($4, \'months\')) RETURNING *',
      [course_name, course_code, course_duration, duration_unit]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/courses/:id - Update a course (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  const { course_name, course_code, course_duration, duration_unit } = req.body;
  try {
    const result = await pool.query(
      'UPDATE courses SET course_name = COALESCE($1, course_name), course_code = COALESCE($2, course_code), course_duration = COALESCE($3, course_duration), duration_unit = COALESCE($4, duration_unit) WHERE course_id = $5 RETURNING *',
      [course_name, course_code, course_duration, duration_unit, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/courses/:id - Delete a course (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM courses WHERE course_id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
