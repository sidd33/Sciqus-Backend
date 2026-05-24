CREATE TABLE courses (
  course_id SERIAL PRIMARY KEY,
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_duration INTEGER NOT NULL,
  duration_unit VARCHAR(10) DEFAULT 'months'
);

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('admin', 'student'))
);

CREATE TABLE students (
  student_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  course_id INTEGER REFERENCES courses(course_id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE PROCEDURE add_student(
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_email VARCHAR,
  p_phone VARCHAR,
  p_course_id INTEGER
)
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM courses WHERE course_id = p_course_id) THEN
    RAISE EXCEPTION 'Course does not exist';
  END IF;
  INSERT INTO students (first_name, last_name, email, phone, course_id)
  VALUES (p_first_name, p_last_name, p_email, p_phone, p_course_id);
END;
$$;

CREATE OR REPLACE PROCEDURE update_student(
  p_student_id INTEGER,
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_email VARCHAR,
  p_phone VARCHAR,
  p_course_id INTEGER,
  p_status VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM students WHERE student_id = p_student_id) THEN
    RAISE EXCEPTION 'Student does not exist';
  END IF;
  IF p_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE course_id = p_course_id) THEN
    RAISE EXCEPTION 'Course does not exist';
  END IF;
  UPDATE students SET
    first_name = COALESCE(p_first_name, first_name),
    last_name = COALESCE(p_last_name, last_name),
    email = COALESCE(p_email, email),
    phone = COALESCE(p_phone, phone),
    course_id = COALESCE(p_course_id, course_id),
    status = COALESCE(p_status, status),
    updated_at = CURRENT_TIMESTAMP
  WHERE student_id = p_student_id;
END;
$$;

CREATE OR REPLACE PROCEDURE delete_student(
  p_student_id INTEGER,
  p_force BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM students WHERE student_id = p_student_id) THEN
    RAISE EXCEPTION 'Student does not exist';
  END IF;
  IF p_force = FALSE AND EXISTS (SELECT 1 FROM students WHERE student_id = p_student_id AND course_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Student is associated with a course. Use force=true to delete anyway.';
  END IF;
  DELETE FROM students WHERE student_id = p_student_id;
END;
$$;
