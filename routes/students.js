const express = require('express');
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/students - Get all students with their course details (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, c.course_name, c.course_code 
      FROM students s 
      LEFT JOIN courses c ON s.course_id = c.course_id
      ORDER BY s.student_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:id - Get single student
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, c.course_name, c.course_code 
      FROM students s 
      LEFT JOIN courses c ON s.course_id = c.course_id 
      WHERE s.student_id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = result.rows[0];
    
    if (req.user.role !== 'admin' && req.user.email !== student.email) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students - Register a new student (admin only)
router.post('/', requireAdmin, async (req, res) => {
  const { first_name, last_name, email, phone, course_id } = req.body;
  try {
    await pool.query('CALL add_student($1, $2, $3, $4, $5)', [first_name, last_name, email, phone, course_id]);
    res.status(201).json({ message: 'Student created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/students/:id - Update student details (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  const { first_name, last_name, email, phone, course_id, status } = req.body;
  try {
    await pool.query('CALL update_student($1, $2, $3, $4, $5, $6, $7)', [
      req.params.id, first_name, last_name, email, phone, course_id, status
    ]);
    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/students/:id - Delete student (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const force = req.query.force === 'true';
  try {
    await pool.query('CALL delete_student($1, $2)', [req.params.id, force]);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
