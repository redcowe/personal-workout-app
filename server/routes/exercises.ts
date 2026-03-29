import { Router } from 'express';
import { pool } from '../db.js';
import { randomBytes } from 'crypto';

const router = Router();
const genId = () => randomBytes(8).toString('hex');

// GET /api/exercises
router.get('/', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, muscle_group AS muscleGroup, type, notes FROM exercises ORDER BY name'
  );
  res.json(rows);
});

// POST /api/exercises
router.post('/', async (req, res) => {
  const { name, muscleGroup, type, notes } = req.body;
  if (!name || !muscleGroup || !type) {
    return res.status(400).json({ error: 'name, muscleGroup and type are required' });
  }
  const id = genId();
  await pool.query(
    'INSERT INTO exercises (id, name, muscle_group, type, notes) VALUES (?, ?, ?, ?, ?)',
    [id, name, muscleGroup, type, notes ?? null]
  );
  res.status(201).json({ id, name, muscleGroup, type, notes });
});

// PUT /api/exercises/:id
router.put('/:id', async (req, res) => {
  const { name, muscleGroup, type, notes } = req.body;
  await pool.query(
    'UPDATE exercises SET name = ?, muscle_group = ?, type = ?, notes = ? WHERE id = ?',
    [name, muscleGroup, type, notes ?? null, req.params.id]
  );
  res.json({ id: req.params.id, name, muscleGroup, type, notes });
});

// DELETE /api/exercises/:id
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM exercises WHERE id = ?', [req.params.id]);
  res.status(204).send();
});

export default router;
