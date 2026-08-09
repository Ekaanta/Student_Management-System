# Student & Assignment Management System

A enterprise-grade **Role-Based Assignment & Submission Management System** built with **.NET 8 Web API**, **Clean Architecture**, **Next.js 16 App Router**, **Hosted PostgreSQL**, and **MongoDB Atlas** dual-persistence.

---

## System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │            Next.js 16 Frontend               │
                    │        (TypeScript, TailwindCSS)             │
                    └──────────────────────┬───────────────────────┘
                                           │  REST / JSON (JWT Auth)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │             .NET 8 Web API                   │
                    │      (Clean Architecture, Serilog)           │
                    └──────────────┬────────────────┬──────────────┘
                                   │                │
            EF Core (Read/Write)   │                │ Instant Dual Sync
                                   ▼                ▼
                     ┌───────────────────┐    ┌───────────────────┐
                     │ Hosted PostgreSQL │    │   MongoDB Atlas   │
                     │  (Primary RDBMS)  │    │ (Document Store)  │
                     └───────────────────┘    └───────────────────┘
```

The system follows **Clean Architecture** principles split into 4 distinct layers:
1. **Domain Layer**: Core domain entities (`User`, `SchoolClass`, `Subject`, `ClassSubject`, `ClassEnrollment`, `Assignment`, `Submission`), enums, and domain contracts.
2. **Application Layer**: Business interfaces, DTOs, FluentValidation rules, custom exceptions, and application services (`AuthService`, `AdminService`, `TeacherService`, `StudentService`).
3. **Infrastructure Layer**: EF Core PostgreSQL context, MongoDB Atlas context & seeder, BCrypt password hashing, and JWT token generator.
4. **API Layer**: Controller endpoints (`AuthController`, `AdminController`, `TeacherController`, `StudentController`, `AssignmentsController`, `SubmissionsController`), global exception handling middleware, and Serilog logging.

---

## Role-Based Access Control & Workflow Matrix

| Feature / Action | Admin | Teacher | Student |
| :--- | :---: | :---: | :---: |
| **System Overview & Metrics** | ✅ | ❌ | ❌ |
| **Manage Users (Create/Update/Activate/Delete)** | ✅ | ❌ | ❌ |
| **Manage Classes & Subjects** | ✅ | ❌ | ❌ |
| **Assign Teachers to Classes & Subjects** | ✅ | ❌ | ❌ |
| **View Assigned Classes & Subjects** | ❌ | ✅ | ✅ |
| **Create & Edit Coursework (Draft/Publish)** | ❌ | ✅ | ❌ |
| **View Published Coursework** | ❌ | ✅ | ✅ |
| **Submit Coursework Answers** | ❌ | ❌ | ✅ (Enrolled only) |
| **Update Submission (Before Deadline)** | ❌ | ❌ | ✅ (Owner only) |
| **Review Submissions & Assign Marks/Feedback** | ❌ | ✅ (Teacher Owner) | ❌ |
| **View Marks & Teacher Feedback** | ❌ | ✅ | ✅ (Own Submission) |

---

## Complete End-to-End Workflow

1. **Admin Setup**:
   - Admin creates Student (`student@example.com`) and Teacher (`teacher@example.com`).
   - Admin creates Class (`Grade 10 - Section A`, `G10A`) and Subject (`Mathematics`, `MATH101`).
   - Admin assigns Teacher to `G10A` - `MATH101`.
   - Student enrolls in `G10A`.

2. **Teacher Coursework Creation & Publishing**:
   - Teacher views assigned class & subject (`G10A` - `MATH101`).
   - Teacher creates an assignment (e.g. *"Algebra Midterm Quiz"* with max score 100).
   - Teacher can save as **Draft** or **Publish** immediately.
   - Published assignments become instantly visible to enrolled students.

3. **Student Coursework Submission**:
   - Student views published assignments for enrolled classes.
   - Student submits answer before the due date.
   - Student can update their submitted answer any time before deadline expires.
   - Past due date, submission attempts are rejected with `400 Bad Request`.

4. **Teacher Evaluation & Grading**:
   - Teacher opens submission list for their published assignment.
   - Teacher reviews student answer, assigns numerical score (`0 <= Score <= MaxScore`), adds detailed feedback, and marks status as `Graded`.

5. **Student Results & Feedback**:
   - Student views grade and teacher feedback on their dashboard.

---

## Primary API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register`: Register a new user account.
- `POST /login`: Authenticate and receive JWT bearer token.
- `GET /me`: Fetch authenticated user profile.
- `PUT /profile`: Update profile info & profile picture URL.

### Admin Management (`/api/v1/admin`)
- `GET /overview`: Get global system metrics.
- `GET /users`: List system users (filtered by role).
- `POST /users`: Create new system user.
- `PUT /users/{id}`: Update user information.
- `PATCH /users/{id}/toggle-status`: Activate or deactivate user.
- `DELETE /users/{id}`: Permanently delete user.
- `GET /classes`, `POST /classes`, `PUT /classes/{id}`, `DELETE /classes/{id}`: Manage school classes.
- `GET /subjects`, `POST /subjects`, `PUT /subjects/{id}`, `DELETE /subjects/{id}`: Manage subjects.
- `GET /teacher-assignments`, `POST /teacher-assignments`, `DELETE /teacher-assignments/{id}`: Assign teachers to class subjects.

### Teacher Management (`/api/v1/teacher`)
- `GET /my-classes`: List classes & subjects assigned to teacher.
- `GET /assignments`: List teacher's assignments.
- `POST /assignments`: Create assignment (Draft or Published).
- `PUT /assignments/{id}`: Update assignment details.
- `POST /assignments/{id}/publish`: Publish draft assignment.
- `DELETE /assignments/{id}`: Delete assignment.
- `GET /assignments/{id}/submissions`: List student submissions for assignment.
- `POST /submissions/{submissionId}/grade`: Grade submission with marks and feedback.

### Student Portal (`/api/v1/student`)
- `GET /my-classes`: List enrolled classes.
- `GET /assignments`: List published assignments for enrolled classes.
- `GET /assignments/{id}`: Get assignment details.
- `POST /submissions`: Submit answer to published assignment.
- `PUT /submissions/{submissionId}`: Update answer before deadline.
- `GET /my-submissions`: List all student submissions with grades and feedback.

---

## Dual Persistence Model (PostgreSQL + MongoDB Atlas)

- **PostgreSQL**: Serves as the primary relational database handling EF Core migrations, transactional integrity, foreign key constraints, and relational queries.
- **MongoDB Atlas**: Serves as the high-availability document store synced in real-time on `ApplicationDbContext.SaveChangesAsync()` for instant reporting and document queries.

---

## Prerequisites & Local Setup

### Backend (.NET 8 SDK)
```powershell
# Environment Variables
$env:MONGODB_CONNECTION_STRING="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0"
$env:MONGODB_DATABASE_NAME="assignment_management"

# Run API Server
dotnet run --project backend/AssignmentSystem.Api/AssignmentSystem.Api.csproj --urls "http://localhost:5000"
```

### Frontend (Next.js 16)
```powershell
cd frontend
npm install
npm run dev
```

### Run Tests
```powershell
dotnet test backend/AssignmentSystem.UnitTests/AssignmentSystem.UnitTests.csproj
```
