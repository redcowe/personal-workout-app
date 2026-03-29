/**
 * Run once to add new exercises to the database:
 *   npx tsx server/seed-exercises.ts
 */
import 'dotenv/config';
import { pool, testConnection } from './db.js';
import { randomBytes } from 'crypto';

const genId = () => randomBytes(8).toString('hex');

const NEW_EXERCISES = [
  // Legs — powerlifting / bodybuilding
  { name: 'Low Bar Squat',           muscleGroup: 'Legs',   type: 'strength' },
  { name: 'High Bar Squat',          muscleGroup: 'Legs',   type: 'strength' },
  { name: 'Front Squat',             muscleGroup: 'Legs',   type: 'strength' },
  { name: 'Pause Squat',             muscleGroup: 'Legs',   type: 'strength' },
  { name: 'Box Squat',               muscleGroup: 'Legs',   type: 'strength' },
  { name: 'Hack Squat',              muscleGroup: 'Legs',   type: 'strength' },
  { name: 'Lying Leg Curl',          muscleGroup: 'Legs',   type: 'strength' },
  { name: 'Barbell Lunges',          muscleGroup: 'Legs',   type: 'strength' },
  { name: 'Walking Lunges',          muscleGroup: 'Legs',   type: 'bodyweight' },
  { name: 'Bulgarian Split Squat',   muscleGroup: 'Legs',   type: 'strength' },
  { name: 'Leg Press (Wide Stance)', muscleGroup: 'Legs',   type: 'strength' },
  { name: 'Sissy Squat',             muscleGroup: 'Legs',   type: 'bodyweight' },
  { name: 'Leg Adduction',           muscleGroup: 'Legs',   type: 'strength' },
  { name: 'Leg Abduction',           muscleGroup: 'Legs',   type: 'strength' },
  // Glutes
  { name: 'Barbell Hip Thrust',      muscleGroup: 'Glutes', type: 'strength' },
  { name: 'Sumo Deadlift',           muscleGroup: 'Glutes', type: 'strength' },
  { name: 'Good Mornings',           muscleGroup: 'Glutes', type: 'strength' },
  { name: 'Cable Pull Through',      muscleGroup: 'Glutes', type: 'strength' },
  { name: 'Glute Bridge',            muscleGroup: 'Glutes', type: 'bodyweight' },
  // Calves
  { name: 'Standing Calf Raises',    muscleGroup: 'Calves', type: 'strength' },
  { name: 'Seated Calf Raises',      muscleGroup: 'Calves', type: 'strength' },
  { name: 'Leg Press Calf Raises',   muscleGroup: 'Calves', type: 'strength' },
  { name: 'Donkey Calf Raises',      muscleGroup: 'Calves', type: 'strength' },
];

async function main() {
  await testConnection();

  // Fetch existing names to avoid duplicates
  const [rows] = await pool.query<any[]>('SELECT name FROM exercises');
  const existing = new Set((rows as any[]).map((r: any) => r.name));

  let added = 0;
  for (const ex of NEW_EXERCISES) {
    if (existing.has(ex.name)) {
      console.log(`  ⏭  already exists: ${ex.name}`);
      continue;
    }
    await pool.query(
      'INSERT INTO exercises (id, name, muscle_group, type) VALUES (?, ?, ?, ?)',
      [genId(), ex.name, ex.muscleGroup, ex.type]
    );
    console.log(`  ✅ added: ${ex.name}`);
    added++;
  }

  console.log(`\nDone — ${added} exercise(s) added.`);
  await pool.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
