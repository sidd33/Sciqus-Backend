# Sciqus Student and Course Management System Backend

A complete REST API backend for managing students and courses, built with Node.js, Express, and PostgreSQL. Screenshots Added (Please Scroll Down)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- pgAdmin or psql terminal

## Setup Instructions

### 1. Database Setup

Before running the server, you need to create the database and its schema.

1. Open pgAdmin or your terminal.
2. Run the following command to create the database:
   ```sql
   CREATE DATABASE sciqus_db;
   ```
3. Connect to the `sciqus_db` database.
4. Execute the SQL script provided in `schema.sql` to create all required tables and stored procedures.

### 2. Environment Variables

Create a `.env` file in the root of the `sciqus-backend` directory (you can copy the provided `.env.example`). Adjust the `DATABASE_URL` with your actual PostgreSQL password if needed:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/sciqus_db
JWT_SECRET=sciqus_secret_key
```

### 3. Install Dependencies

Install the necessary npm packages by running:
```bash
npm install
```

### 4. Start the Server

Start the backend server using:
```bash
npm start
```

### Default Credentials

If you start the server on an empty database (with only the schema created), it will automatically seed default courses and an admin user.

- **Admin Email**: `admin@sciqus.com`
- **Admin Password**: `admin123`

---

## API Endpoints

### Authentication Routes
- **`POST /api/auth/register`** (No auth required)
  - Register a new user.
  - Body: `{ "username": "student1", "email": "student1@example.com", "password": "password123", "role": "student" }`
- **`POST /api/auth/login`** (No auth required)
  - Login to get a JWT token.
  - Body: `{ "email": "admin@sciqus.com", "password": "admin123" }`

### Course Routes
*All require JWT token in Authorization header (`Authorization: Bearer <token>`)*
- **`GET /api/courses`** (Any authenticated user)
  - Get all courses with student count.
- **`GET /api/courses/:id`** (Any authenticated user)
  - Get single course by ID.
- **`GET /api/courses/:id/students`** (Admin only)
  - Get all students enrolled in a specific course.
- **`POST /api/courses`** (Admin only)
  - Create a new course.
  - Body: `{ "course_name": "Physics", "course_code": "PHY101", "course_duration": 6, "duration_unit": "months" }`
- **`PUT /api/courses/:id`** (Admin only)
  - Update a course.
  - Body: `{ "course_name": "Advanced Physics", "course_duration": 12 }`
- **`DELETE /api/courses/:id`** (Admin only)
  - Delete a course (will fail if students are enrolled).

### Student Routes
*All require JWT token in Authorization header (`Authorization: Bearer <token>`)*
- **`GET /api/students`** (Admin only)
  - Get all students with their course details.
- **`GET /api/students/:id`** (Admin sees any, student sees only their own profile)
  - Get single student by ID.
- **`POST /api/students`** (Admin only)
  - Register a new student with course assignment using stored procedure.
  - Body: `{ "first_name": "John", "last_name": "Doe", "email": "john.doe@example.com", "phone": "1234567890", "course_id": 1 }`
- **`PUT /api/students/:id`** (Admin only)
  - Update student details including course change using stored procedure.
  - Body: `{ "phone": "0987654321", "status": "graduated" }`
- **`DELETE /api/students/:id`** (Admin only)
  - Delete student using stored procedure.
  - Supports query param `?force=true` to delete even if a course is assigned.

---

## API Testing Screenshots

All endpoints have been tested successfully. The test results are showcased below, mapped to screenshots in the `preview/` folder.

### Authentication
1. **POST /api/auth/register (201 Created)**  
   ![POST /api/auth/register](preview/1.png)

2. **POST /api/auth/login (200 OK + JWT token)**  
   ![POST /api/auth/login](preview/2.png)

### Courses
3. **GET /api/courses (200 OK + all 5 courses)**  
   ![GET /api/courses](preview/3.png)

4. **GET /api/courses/1 (200 OK + single course)**  
   ![GET /api/courses/1](preview/4.png)

5. **POST /api/courses (201 Created)**  
   ![POST /api/courses](preview/5.png)

6. **PUT /api/courses/1 (200 OK + updated)**  
   ![PUT /api/courses/1](preview/6.png)

7. **DELETE /api/courses/6 (200 OK + deleted)**  
   ![DELETE /api/courses/6](preview/7.png)

### Students
8. **POST /api/students (201 Created)**  
   ![POST /api/students](preview/8.png)

9. **GET /api/students (200 OK + student with course info)**  
   ![GET /api/students](preview/9.png)

10. **GET /api/students/2 (200 OK + single student)**  
   ![GET /api/students/2](preview/10.png)

11. **PUT /api/students/2 (200 OK + updated)**  
   ![PUT /api/students/2](preview/11.png)

12. **GET /api/courses/1/students (200 OK + enrolled students)**  
   ![GET /api/courses/1/students](preview/12.png)

13. **DELETE /api/students/2?force (200 OK + deleted)**  
   ![DELETE /api/students/2?force](preview/13.png)
