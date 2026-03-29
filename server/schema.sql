-- Workout App Database Schema
-- Run this once to set up the database:
--   mysql -u root -p < server/schema.sql

CREATE DATABASE IF NOT EXISTS workout_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE workout_app;

-- ---------------------------------------------------------------------------
-- exercises
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  muscle_group VARCHAR(50) NOT NULL,
  type        ENUM('strength', 'cardio', 'bodyweight') NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- workout_templates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_templates (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- template_exercises  (ordered list of exercises within a template)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS template_exercises (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_id VARCHAR(36)  NOT NULL,
  exercise_id VARCHAR(36)  NOT NULL,
  position    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  sets        TINYINT UNSIGNED NOT NULL DEFAULT 3,
  reps        TINYINT UNSIGNED NOT NULL DEFAULT 10,
  weight      DECIMAL(6,2),          -- kg; NULL = bodyweight
  rest_seconds SMALLINT UNSIGNED,
  FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------------
-- workout_logs  (a completed workout session)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_logs (
  id               VARCHAR(36)  NOT NULL PRIMARY KEY,
  template_id      VARCHAR(36),
  template_name    VARCHAR(255),
  date             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration_minutes SMALLINT UNSIGNED,
  notes            TEXT,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- log_exercises  (exercises performed in a session)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS log_exercises (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  log_id      VARCHAR(36)  NOT NULL,
  exercise_id VARCHAR(36)  NOT NULL,
  position    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  notes       TEXT,
  FOREIGN KEY (log_id)      REFERENCES workout_logs(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)    ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------------
-- log_sets  (individual sets within a logged exercise)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS log_sets (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  log_exercise_id INT UNSIGNED NOT NULL,
  set_index       TINYINT UNSIGNED NOT NULL,
  reps            TINYINT UNSIGNED NOT NULL,
  weight          DECIMAL(6,2),
  status          ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (log_exercise_id) REFERENCES log_exercises(id) ON DELETE CASCADE
);
