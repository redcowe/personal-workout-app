import { Router } from 'express';
import { pool } from '../db.js';
import { randomBytes } from 'crypto';

const router = Router();
const genId = () => randomBytes(8).toString('hex');

// GET /api/templates
router.get('/', async (_req, res) => {
  const [templates] = await pool.query<any[]>(
    'SELECT id, name, description, created_at AS createdAt FROM workout_templates ORDER BY created_at DESC'
  );
  // Attach exercises to each template
  if ((templates as any[]).length === 0) return res.json([]);

  const ids = (templates as any[]).map((t) => t.id);
  const [exercises] = await pool.query<any[]>(
    `SELECT te.template_id, te.position, te.sets, te.reps, te.weight, te.rest_seconds AS restSeconds,
            te.exercise_id AS exerciseId
     FROM template_exercises te
     WHERE te.template_id IN (?)
     ORDER BY te.template_id, te.position`,
    [ids]
  );

  const exMap: Record<string, any[]> = {};
  for (const ex of exercises as any[]) {
    (exMap[ex.template_id] ??= []).push({
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      restSeconds: ex.restSeconds,
    });
  }

  res.json(
    (templates as any[]).map((t) => ({ ...t, exercises: exMap[t.id] ?? [] }))
  );
});

// POST /api/templates
router.post('/', async (req, res) => {
  const { name, description, exercises = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const id = genId();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'INSERT INTO workout_templates (id, name, description) VALUES (?, ?, ?)',
      [id, name, description ?? null]
    );
    for (let i = 0; i < exercises.length; i++) {
      const { exerciseId, sets, reps, weight, restSeconds } = exercises[i];
      await conn.query(
        'INSERT INTO template_exercises (template_id, exercise_id, position, sets, reps, weight, rest_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, exerciseId, i, sets, reps, weight ?? null, restSeconds ?? null]
      );
    }
    await conn.commit();
    res.status(201).json({ id, name, description, exercises, createdAt: new Date().toISOString() });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// PUT /api/templates/:id
router.put('/:id', async (req, res) => {
  const { name, description, exercises = [] } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE workout_templates SET name = ?, description = ? WHERE id = ?',
      [name, description ?? null, req.params.id]
    );
    await conn.query('DELETE FROM template_exercises WHERE template_id = ?', [req.params.id]);
    for (let i = 0; i < exercises.length; i++) {
      const { exerciseId, sets, reps, weight, restSeconds } = exercises[i];
      await conn.query(
        'INSERT INTO template_exercises (template_id, exercise_id, position, sets, reps, weight, rest_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.params.id, exerciseId, i, sets, reps, weight ?? null, restSeconds ?? null]
      );
    }
    await conn.commit();
    res.json({ id: req.params.id, name, description, exercises });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// DELETE /api/templates/:id
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM workout_templates WHERE id = ?', [req.params.id]);
  res.status(204).send();
});

export default router;
