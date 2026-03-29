import { Router } from 'express';
import { pool } from '../db.js';
import { randomBytes } from 'crypto';

const router = Router();
const genId = () => randomBytes(8).toString('hex');

// GET /api/logs
router.get('/', async (_req, res) => {
  const [logs] = await pool.query<any[]>(
    `SELECT id, template_id AS templateId, template_name AS templateName,
            date, duration_minutes AS durationMinutes, notes
     FROM workout_logs ORDER BY date DESC`
  );
  if ((logs as any[]).length === 0) return res.json([]);

  const logIds = (logs as any[]).map((l) => l.id);

  const [logExercises] = await pool.query<any[]>(
    `SELECT le.id, le.log_id AS logId, le.exercise_id AS exerciseId, le.position, le.notes
     FROM log_exercises le WHERE le.log_id IN (?) ORDER BY le.log_id, le.position`,
    [logIds]
  );

  if ((logExercises as any[]).length === 0) {
    return res.json((logs as any[]).map((l) => ({ ...l, exercises: [] })));
  }

  const leIds = (logExercises as any[]).map((le) => le.id);
  const [sets] = await pool.query<any[]>(
    `SELECT log_exercise_id AS logExerciseId, set_index AS setIndex, reps, weight, status
     FROM log_sets WHERE log_exercise_id IN (?) ORDER BY log_exercise_id, set_index`,
    [leIds]
  );

  const setsMap: Record<number, any[]> = {};
  for (const s of sets as any[]) {
    (setsMap[s.logExerciseId] ??= []).push({ reps: s.reps, weight: s.weight, status: s.status });
  }

  const exMap: Record<string, any[]> = {};
  for (const le of logExercises as any[]) {
    (exMap[le.logId] ??= []).push({
      exerciseId: le.exerciseId,
      notes: le.notes,
      sets: setsMap[le.id] ?? [],
    });
  }

  res.json((logs as any[]).map((l) => ({ ...l, exercises: exMap[l.id] ?? [] })));
});

// POST /api/logs
router.post('/', async (req, res) => {
  const { templateId, templateName, date, durationMinutes, exercises = [], notes } = req.body;
  const id = genId();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO workout_logs (id, template_id, template_name, date, duration_minutes, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, templateId ?? null, templateName ?? null, date ?? new Date(), durationMinutes ?? null, notes ?? null]
    );
    for (let i = 0; i < exercises.length; i++) {
      const { exerciseId, sets = [], notes: exNotes } = exercises[i];
      const [result] = await conn.query<any>(
        'INSERT INTO log_exercises (log_id, exercise_id, position, notes) VALUES (?, ?, ?, ?)',
        [id, exerciseId, i, exNotes ?? null]
      );
      const leId = result.insertId;
      for (let j = 0; j < sets.length; j++) {
        const { reps, weight, status } = sets[j];
        await conn.query(
          'INSERT INTO log_sets (log_exercise_id, set_index, reps, weight, status) VALUES (?, ?, ?, ?, ?)',
          [leId, j, reps, weight ?? null, status ?? 'pending']
        );
      }
    }
    await conn.commit();
    res.status(201).json({ id, templateId, templateName, date, durationMinutes, exercises, notes });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// DELETE /api/logs/:id
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM workout_logs WHERE id = ?', [req.params.id]);
  res.status(204).send();
});

export default router;
