# Course Management System

A full-stack web application for managing course records with complete CRUD operations.

## Tech Stack
- Backend: Java 17, Spring Boot, Spring Data JPA, MySQL
- Frontend: React + Vite
- API Style: RESTful JSON APIs

## Features
- JWT-based authentication (Login/Register)
- Role-based authorization (`ADMIN`, `USER`)
- Create course records
- View all courses
- Update existing course details
- Delete courses
- Input validation and error handling

## Project Structure
- `backend/` - Spring Boot REST API
- `frontend/` - React application

## Course Data Model
Each course includes:
- `id` (auto-generated)
- `courseCode` (unique)
- `courseName`
- `description`
- `durationInWeeks`

## MySQL Setup
1. Ensure MySQL server is running.
2. Create/update credentials in `backend/src/main/resources/application.properties`:
   - `spring.datasource.username`
   - `spring.datasource.password`
3. Or set environment variables before running backend:
  - `DB_USERNAME` (default: `root`)
  - `DB_PASSWORD` (default: empty)
4. Database `course_management` is auto-created if it does not exist.

## Security Configuration
Set these environment variables for production:
- `JWT_SECRET` (required, must be strong and long, at least 32 characters)
- `JWT_EXPIRATION_MS` (default: `86400000` i.e. 24h)

Admin seed credentials should be provided explicitly via environment variables.

Set admin seed credentials:
- `DEFAULT_ADMIN_USERNAME`
- `DEFAULT_ADMIN_PASSWORD`

## Run Backend
From the `backend` folder:

```bash
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

## Run Frontend
From the `frontend` folder:

```bash
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## API Endpoints
### Auth Endpoints
Base URL: `http://localhost:8080/api/auth`

- `POST /register` - register new user (default role: `USER`)
- `POST /login` - login and receive JWT token

### Course Endpoints
Base URL: `http://localhost:8080/api/courses`

- `GET /` - get all courses (`USER` or `ADMIN`)
- `GET /{id}` - get course by ID (`USER` or `ADMIN`)
- `POST /` - create course (`ADMIN` only)
- `PUT /{id}` - update course (`ADMIN` only)
- `DELETE /{id}` - delete course (`ADMIN` only)

Use header for protected routes:
- `Authorization: Bearer <jwt_token>`

## Sample JSON (Register/Login)
```json
{
  "username": "john",
  "password": "password123"
}
```

## Sample JSON (Create/Update)
```json
{
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "description": "Basic programming concepts using Java",
  "durationInWeeks": 12
}
```
