# Assignment & Submission Management System

A production-grade, enterprise-ready **Role-Based Assignment & Submission Management System** built with **.NET 8 Web API** (Clean Architecture), **Next.js 16 App Router** (TypeScript, TailwindCSS), and **MongoDB Atlas** database integration.

---

## 1. Project Overview

The **Assignment & Submission Management System** provides a complete end-to-end digital portal for educational institutions. It streamlines administrative governance, academic course setup, teacher assignment creation and grading, and student coursework submission with real-time deadline enforcement and MongoDB database persistence.

---

## 2. Problem Statement

Educational institutions face challenges managing coursework lifecycles manually:
- Lack of centralized role governance between Administrators, Teachers, and Students.
- Unreliable submission tracking and lack of strict automated deadline enforcement.
- Difficulty maintaining high-availability document storage for real-time reporting and structured entity queries.

This system resolves these pain points by offering a unified role-based web application with strict deadline validation, instant resource isolation, and real-time MongoDB database persistence.

---

## 3. Key System Features

- 🔐 **Secure Role-Based Authentication**: BCrypt password hashing and JWT token authorization.
- 👑 **Admin Governance Dashboard**: Full CRUD management for Users (Admins, Teachers, Students), School Classes, Subjects, and Teacher assignments.
- 📚 **Teacher Coursework Management**: Create coursework as **Draft** or **Published**, edit assignments, set max marks, enforce future due dates, review student submissions, and assign numerical scores with feedback.
- 🎓 **Student Coursework Portal**: View enrolled classes, submit answers with optional attachment URLs, update answers prior to deadline, and inspect teacher marks and feedback.
- ⏳ **Automated Deadline Enforcement**: Strict backend rejection (`400 Bad Request`) for any submission or answer modification attempt past `DueDateUtc`.
- ⚡ **Real-Time MongoDB Integration**: Automatic real-time persistence on `ApplicationDbContext.SaveChangesAsync()` to MongoDB Atlas document collections.
- 🌗 **Responsive Modern UI**: Dark and Light theme toggle support built with TailwindCSS.

---

## 4. User Roles & Permissions

### 👑 Administrator (`Admin`)
- View global system overview metrics (total users, teachers, students, classes, subjects, assignments, submissions).
- Full User Management (Create user, update details, activate/deactivate account, permanently delete user).
- Manage School Classes & Courses (Create, edit, delete).
- Manage Academic Subjects (Create, edit, delete).
- Assign Teachers to Class-Subject pairings and unassign them.

### 📚 Teacher (`Teacher`)
- View assigned classes and subjects.
- Create assignments assigned to their authorized Class-Subject pairings.
- Save coursework as **Draft** or **Publish** immediately to students.
- Edit draft or published assignment details and due dates.
- Delete owned assignments.
- Review student submissions for owned assignments.
- Grade submissions (`0 <= Score <= MaxScore`) and record detailed feedback text.

### 🎓 Student (`Student`)
- View active class enrollments.
- View published coursework for enrolled classes only.
- View detailed assignment instructions, max marks, and due dates.
- Submit coursework answers with text content and optional attachment link.
- Edit submitted answers prior to the due date.
- View assigned marks, evaluation status (`Submitted`, `Graded`, `Reviewed`), and teacher feedback.

---

## 5. Technology Stack

### Backend (.NET 8 Web API)
- **Framework**: .NET 8 SDK (C# 12)
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, API)
- **Document DB Driver**: MongoDB C# Driver (`MongoDB.Driver` 3.4.0)
- **Security & JWT**: `System.IdentityModel.Tokens.Jwt`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `BCrypt.Net-Next`
- **Validation**: FluentValidation 11
- **Logging**: Serilog ASP.NET Core (`Serilog.AspNetCore`, `Serilog.Sinks.Console`)
- **API Documentation**: Swashbuckle / Swagger (`Swashbuckle.AspNetCore` 6.6.2)
- **Testing**: xUnit, Moq, EF Core InMemory Database

### Frontend (Next.js 16)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4, Custom CSS tokens
- **Icons & UI**: Lucide React, Custom SVG Icons
- **State & Context**: React Context API (`AuthContext`, `ThemeContext`)

### Database & Cloud Infrastructure
- **Database System**: MongoDB Atlas Cloud Database (`Cluster0`, database `assignment_management`)

---

## 6. System Architecture

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
                    └──────────────────────┬───────────────────────┘
                                           │ Instant Document Sync
                                           ▼
                                ┌───────────────────┐
                                │   MongoDB Atlas   │
                                │ (Document Store)  │
                                └───────────────────┘
```

The solution strictly adheres to **Clean Architecture**:
1. **`AssignmentSystem.Domain`**: Contains core entities (`User`, `SchoolClass`, `Subject`, `ClassSubject`, `ClassEnrollment`, `Assignment`, `Submission`), domain enums (`UserRole`, `AssignmentStatus`, `SubmissionStatus`), and base entity contracts.
2. **`AssignmentSystem.Application`**: Contains DTOs, FluentValidation validators, custom exception definitions (`AppException`, `NotFoundException`, `UnauthorizedException`, `ValidationException`), and service interfaces/implementations (`AuthService`, `AdminService`, `TeacherService`, `StudentService`).
3. **`AssignmentSystem.Infrastructure`**: Contains `ApplicationDbContext`, `MongoDbContext` & `MongoDbSeeder` (MongoDB Atlas), `JwtTokenGenerator`, and `PasswordHasherService`.
4. **`AssignmentSystem.Api`**: Controllers (`AuthController`, `AdminController`, `TeacherController`, `StudentController`, `AssignmentsController`, `SubmissionsController`), global exception middleware, and Serilog logging setup.

---

## 7. Database Design & MongoDB Collections

### MongoDB Atlas Collections (`assignment_management` Database)

- **`users`**: User account documents containing `_id`, `Email` (Unique index), `PasswordHash`, `FirstName`, `LastName`, `Role` (Int Enum), `IsActive` (Bool), `ProfilePictureUrl`, `CreatedAtUtc`, `UpdatedAtUtc`.
- **`schoolClasses`**: Class documents containing `_id`, `Name`, `Code` (Unique index), `AcademicYear`, `Description`, `IsActive`, `CreatedAtUtc`, `UpdatedAtUtc`.
- **`subjects`**: Subject documents containing `_id`, `Name`, `Code` (Unique index), `Description`, `IsActive`, `CreatedAtUtc`, `UpdatedAtUtc`.
- **`classSubjects`**: Teacher class assignment documents containing `_id`, `ClassId`, `SubjectId`, `TeacherId`, `CreatedAtUtc`, `UpdatedAtUtc`.
- **`classEnrollments`**: Student enrollment documents containing `_id`, `ClassId`, `StudentId`, `EnrolledAtUtc`, `CreatedAtUtc`, `UpdatedAtUtc`.
- **`assignments`**: Coursework documents containing `_id`, `Title`, `Description`, `MaxScore`, `Status` (Enum: Draft=0, Published=1), `DueDateUtc`, `PublishedAtUtc`, `ClassSubjectId`, `TeacherId`, `CreatedAtUtc`, `UpdatedAtUtc`.
- **`submissions`**: Answer documents containing `_id`, `AssignmentId`, `StudentId`, `SubmittedContent`, `AttachmentUrl`, `SubmittedAtUtc`, `Status` (Enum: Submitted=0, Graded=1, Reviewed=2), `Grade`, `Feedback`, `GradedAtUtc`, `GradedById`, `CreatedAtUtc`, `UpdatedAtUtc`.

### Real-Time MongoDB Atlas Sync Model
Inside [`ApplicationDbContext.cs`](file:///C:/Users/Ekanta%20Banik%20Durjoy/.gemini/antigravity-ide/scratch/assignment-management-system/backend/AssignmentSystem.Infrastructure/Data/ApplicationDbContext.cs), the `SaveChangesAsync()` method intercepts tracked entity changes (`Added`, `Modified`, `Deleted`) and applies them instantly to MongoDB Atlas document collections (`users`, `schoolClasses`, `subjects`, `classSubjects`, `classEnrollments`, `assignments`, `submissions`).

---

## 8. Authentication & Authorization

- **Password Hashing**: BCrypt hashing with salt (`BCrypt.Net-Next`).
- **JWT Authentication**: JSON Web Tokens issued upon login containing standard claims: `NameIdentifier` (User ID), `Email`, and `Role` (`Admin`, `Teacher`, `Student`).
- **Role Guards**: Backend API controllers use ASP.NET Core `[Authorize(Roles = "...")]` attributes:
  - `AdminController`: `[Authorize(Roles = "Admin")]`
  - `TeacherController`: `[Authorize(Roles = "Teacher,Admin")]`
  - `StudentController`: `[Authorize(Roles = "Student,Admin")]`
- **Resource Ownership Verification**:
  - Teachers can only manage coursework and grade submissions for classes assigned to them in `ClassSubjects`.
  - Students can only view published coursework for classes in which they are enrolled in `ClassEnrollments`.
  - Students can only view and update submissions belonging to their own `StudentId`.

---

## 9. Assignment Workflow

```
   ┌────────────────┐      Publish Action      ┌────────────────────┐
   │ Draft          ├─────────────────────────►│ Published          │
   │ (Hidden from   │                          │ (Visible to        │
   │  Students)     │                          │  Enrolled Students)│
   └────────────────┘                          └────────────────────┘
```

1. **Creation**: Teacher selects an assigned Class-Subject, inputs title, description, max score (> 0), and due date (must be in the future).
2. **Draft State**: Saved as `Draft` (`Status = 0`). Visible only to the creating Teacher and Admins.
3. **Publish State**: Teacher clicks **Publish**. Status changes to `Published` (`Status = 1`), `PublishedAtUtc` is recorded, and the coursework surfaces to enrolled students.
4. **Validation**: Submitting past `DueDateUtc` is strictly rejected by the backend.

---

## 10. Submission Workflow

1. **Submission**: Enrolled student views published assignment details and submits text answer with optional attachment URL.
2. **Pre-Deadline Update**: Prior to `DueDateUtc`, student can edit their submission answer. `SubmittedAtUtc` and `UpdatedAtUtc` are refreshed.
3. **Post-Deadline Block**: After `DueDateUtc`, submission and modification endpoints throw `AppException("Submission deadline has passed.", 400)`.
4. **Grading & Review**: Assigned Teacher views student submissions, inputs numerical grade (`0 <= Grade <= MaxScore`), provides feedback text, and marks status as `Graded` or `Reviewed`.
5. **Student Results Inspection**: Student views grade score, percentage, evaluation date, evaluator name, and feedback text on their dashboard.

---

## 11. API Overview Table

| Controller | Method | Endpoint Route | Role Required | Description |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Register new user account |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Authenticate & receive JWT token |
| **Auth** | `GET` | `/api/v1/auth/me` | Authenticated | Get current user profile |
| **Auth** | `PUT` | `/api/v1/auth/profile` | Authenticated | Update profile info & picture URL |
| **Admin** | `GET` | `/api/v1/admin/overview` | Admin | Get system-wide metrics |
| **Admin** | `GET` | `/api/v1/admin/users` | Admin | List all users (role filterable) |
| **Admin** | `POST` | `/api/v1/admin/users` | Admin | Create system user |
| **Admin** | `PUT` | `/api/v1/admin/users/{id}` | Admin | Update user details |
| **Admin** | `PATCH` | `/api/v1/admin/users/{id}/toggle-status` | Admin | Toggle active/inactive status |
| **Admin** | `DELETE` | `/api/v1/admin/users/{id}` | Admin | Permanently delete user |
| **Admin** | `GET`/`POST`/`PUT`/`DELETE` | `/api/v1/admin/classes` | Admin | Manage school classes |
| **Admin** | `GET`/`POST`/`PUT`/`DELETE` | `/api/v1/admin/subjects` | Admin | Manage academic subjects |
| **Admin** | `GET`/`POST`/`DELETE` | `/api/v1/admin/teacher-assignments` | Admin | Manage teacher class assignments |
| **Teacher**| `GET` | `/api/v1/teacher/my-classes` | Teacher, Admin | Get assigned classes & subjects |
| **Teacher**| `GET`/`POST` | `/api/v1/teacher/assignments` | Teacher, Admin | List / Create assignments |
| **Teacher**| `GET`/`PUT`/`DELETE` | `/api/v1/teacher/assignments/{id}` | Teacher, Admin | Get / Edit / Delete assignment |
| **Teacher**| `POST` | `/api/v1/teacher/assignments/{id}/publish` | Teacher, Admin | Publish draft assignment |
| **Teacher**| `GET` | `/api/v1/teacher/assignments/{id}/submissions` | Teacher, Admin | List submissions for assignment |
| **Teacher**| `POST` | `/api/v1/teacher/submissions/{submissionId}/grade` | Teacher, Admin | Grade student submission |
| **Student**| `GET` | `/api/v1/student/my-classes` | Student, Admin | List enrolled classes |
| **Student**| `GET` | `/api/v1/student/assignments` | Student, Admin | List published coursework |
| **Student**| `GET` | `/api/v1/student/assignments/{id}` | Student, Admin | Get assignment details |
| **Student**| `POST` | `/api/v1/student/submissions` | Student, Admin | Submit coursework answer |
| **Student**| `PUT` | `/api/v1/student/submissions/{submissionId}` | Student, Admin | Update submission before deadline |
| **Student**| `GET` | `/api/v1/student/my-submissions` | Student, Admin | List student submissions with grades |

---

## 12. Frontend Structure

```
frontend/
├── public/                     # Static assets & icons
├── src/
│   ├── app/
│   │   ├── admin/              # Admin Portal Pages
│   │   │   ├── classes/        # School Class Management
│   │   │   ├── subjects/       # Subject Management
│   │   │   ├── teacher-assignments/ # Teacher Assignment Management
│   │   │   ├── users/          # User Accounts Management (with Delete)
│   │   │   ├── profile/        # Admin Profile Page
│   │   │   ├── layout.tsx      # Admin Dashboard Sidebar & Header
│   │   │   └── page.tsx        # Global Overview Dashboard
│   │   ├── teacher/            # Teacher Portal Pages
│   │   │   ├── assignments/    # Assignment List, Create, Edit, Submissions
│   │   │   ├── classes/        # Assigned Classes View
│   │   │   ├── submissions/    # Grading & Feedback Form Page
│   │   │   ├── profile/        # Teacher Profile Page
│   │   │   ├── layout.tsx      # Teacher Portal Sidebar
│   │   │   └── page.tsx        # Teacher Overview Page
│   │   ├── student/            # Student Portal Pages
│   │   │   ├── assignments/    # Published Assignments & Submit Page
│   │   │   ├── submissions/    # My Submissions, Grade & Feedback View
│   │   │   ├── profile/        # Student Profile Page
│   │   │   ├── layout.tsx      # Student Portal Sidebar
│   │   │   └── page.tsx        # Student Dashboard Page
│   │   ├── login/              # Login Page with Demo Fill & Dark Toggle
│   │   ├── register/           # Self-Registration Page
│   │   ├── globals.css         # Tailwind & Base Theme Styles
│   │   ├── layout.tsx          # Root Layout & Theme/Auth Providers
│   │   └── page.tsx            # Public Landing Page
│   ├── components/
│   │   ├── ThemeToggle.tsx     # Light / Dark Theme Switcher Component
│   │   └── UserProfileForm.tsx # Shared User Profile & Password Component
│   ├── lib/
│   │   ├── api-client.ts       # Centralized Fetch Client with JWT Handling
│   │   ├── auth-context.tsx    # Auth Context Provider & Session Persistence
│   │   ├── theme-context.tsx   # Light / Dark Theme Context Provider
│   │   └── constants.ts        # Base API URL & Config Constants
│   └── types/
│       └── index.ts            # Shared TypeScript Interfaces & Enums
├── package.json
└── tsconfig.json
```

---

## 13. Backend Structure

```
backend/
├── AssignmentSystem.Api/               # API Web Layer
│   ├── Controllers/                    # REST API Controllers
│   │   ├── AdminController.cs
│   │   ├── AssignmentsController.cs
│   │   ├── AuthController.cs
│   │   ├── StudentController.cs
│   │   ├── SubmissionsController.cs
│   │   └── TeacherController.cs
│   ├── Middleware/                     # Global Exception Middleware
│   │   └── GlobalExceptionHandlerMiddleware.cs
│   ├── Program.cs                      # Service DI, Serilog, Cors, Middleware
│   ├── appsettings.json                # API Settings (Database templates)
│   └── AssignmentSystem.Api.csproj
├── AssignmentSystem.Application/       # Application Layer (Use Cases)
│   ├── Configuration/                  # MongoDB Settings Config
│   ├── DTOs/                           # Data Transfer Objects
│   ├── Exceptions/                     # Custom Exception Hierarchy
│   ├── Interfaces/                     # Service & DB Interfaces
│   ├── Services/                       # Business Logic Implementation
│   └── Validators/                     # FluentValidation Rules
├── AssignmentSystem.Domain/            # Domain Layer (Core Entities)
│   ├── Common/                         # Base Entity Definitions
│   ├── Entities/                       # Domain Entities
│   └── Enums/                          # Domain Enums (UserRole, Statuses)
├── AssignmentSystem.Infrastructure/    # Infrastructure Layer (Data & Security)
│   ├── Data/                           # EF Core DbContext & MongoDB Context
│   │   ├── Configurations/             # EF Core Model Configurations
│   │   ├── ApplicationDbContext.cs     # Real-Time SaveChangesAsync Sync
│   │   ├── DbSeeder.cs                 # Database Seeder
│   │   ├── MongoDbContext.cs           # MongoDB Driver Context & Serializers
│   │   └── MongoDbSeeder.cs            # MongoDB Seeder & Index Sync
│   ├── Identity/                       # Password Hashing & JWT Token Gen
│   └── Migrations/                     # Migration Snapshots
├── AssignmentSystem.UnitTests/         # Unit Test Project (xUnit & Moq)
│   ├── AdminModuleTests.cs
│   ├── AuthModuleTests.cs
│   ├── DomainRulesTests.cs
│   ├── StudentModuleTests.cs
│   └── TeacherModuleTests.cs
└── AssignmentSystem.sln                # Visual Studio Solution File
```

---

## 14. Validation & Error Handling

- **Request Validation**: FluentValidation validators (`AuthValidators`, `AdminValidators`, `TeacherValidators`, `StudentValidators`) enforce email format, non-empty text, positive scores, and future due dates.
- **Custom Exceptions**:
  - `AppException(message, statusCode)`: General domain errors.
  - `NotFoundException(entity, id)`: Returns `404 Not Found`.
  - `UnauthorizedException(message)`: Returns `401 Unauthorized`.
  - `ValidationException(errors)`: Returns `400 Bad Request` with field error dictionary.
- **Global Middleware**: `GlobalExceptionHandlerMiddleware` catches all unhandled exceptions and serializes a clean `ApiResponse<T>` JSON payload:
  ```json
  {
    "success": false,
    "message": "Assignment due date must be set in the future.",
    "data": null,
    "errors": []
  }
  ```
- **Structured Logging**: Serilog logs HTTP requests, executed DbCommands, migration outputs, and errors to the console.

---

## 15. Testing & Verification

### xUnit Unit Test Suite
The solution includes **26 automated unit tests** covering Authentication, JWT claims, Admin duplicate checks, Teacher grading bounds, and Student deadline enforcement.

To run all unit tests:
```powershell
dotnet test backend/AssignmentSystem.UnitTests/AssignmentSystem.UnitTests.csproj
```

**Verification Result**: `Passed! - Failed: 0, Passed: 26, Skipped: 0, Total: 26, Duration: 660 ms`

---

## 16. Setup Instructions

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+ & npm](https://nodejs.org/)
- Git

### 1. Clone Repository
```powershell
git clone https://github.com/Ekaanta/Student_Management-System.git
cd Student_Management-System
```

---

## 17. Environment Variables

### Backend Configuration (`appsettings.json` or Environment Variables)

| Variable | Description | Example / Default Value |
| :--- | :--- | :--- |
| `MONGODB_CONNECTION_STRING` | MongoDB Atlas Connection String | `mongodb+srv://<USER>:<PWD>@cluster0.bzt8ohz.mongodb.net/?appName=Cluster0` |
| `MONGODB_DATABASE_NAME` | MongoDB Database Name | `assignment_management` |
| `Jwt:Secret` | 256-bit JWT Signing Secret Key | `SuperSecretKeyForJwtTokenGenerationThatIsAtLeast32BytesLong!` |
| `Jwt:Issuer` | JWT Token Issuer | `AssignmentSystem` |
| `Jwt:Audience` | JWT Token Audience | `AssignmentSystemApp` |
| `Jwt:ExpirationInMinutes` | Token Lifetime in Minutes | `1440` (24 Hours) |

---

## 18. Database Migration & Seeding Instructions

### MongoDB Atlas Database Initialization
Indexes (`ux_users_email`, `ux_schoolclasses_code`, `ux_subjects_code`) and data seeding initialize automatically upon API startup via `MongoDbSeeder.SeedAsync()`.

---

## 19. Running Frontend

### Development Server
```powershell
cd frontend
npm install
npm run dev
```
The frontend will start on **`http://localhost:3000`**.

### Production Build
```powershell
cd frontend
npm run build
npm run start
```

---

## 20. Running Backend

### Launch API Server
```powershell
$env:MONGODB_CONNECTION_STRING="mongodb+srv://ekantabanik_db_user:<password>@cluster0.bzt8ohz.mongodb.net/?appName=Cluster0"
$env:MONGODB_DATABASE_NAME="assignment_management"

dotnet run --project backend/AssignmentSystem.Api/AssignmentSystem.Api.csproj --urls "http://localhost:5000"
```
The backend API will start listening on **`http://localhost:5000`**.

---

## 21. Swagger / OpenAPI Documentation

Interactive Swagger documentation is enabled for development and testing.

Access Swagger UI:
👉 **`http://localhost:5000/swagger`**

You can execute API requests directly from Swagger by clicking **Authorize** and supplying the Bearer Token returned from `POST /api/v1/auth/login`.

---

## 22. Important Design Decisions

1. **Real-Time MongoDB Atlas Persistence**: Synchronizing tracked changes to MongoDB Atlas inside `SaveChangesAsync()` ensures document collections stay synchronized without complex outbox polling.
2. **BsonClassMap Navigation Unmapping**: EF Core entity classes reference navigation properties (e.g. `User.Submissions`). During MongoDB driver serialization, unmapping navigation properties prevents circular graph references and duplicate write exceptions.
3. **Soft Delete vs Hard Delete**:
   - Toggling user status (`IsActive = false`) acts as a soft delete / account lock.
   - Permanent delete (`DELETE /api/v1/admin/users/{id}`) removes records completely and deletes the matching document from MongoDB Atlas.
4. **Clean Separation of Role Portals**: Dedicated route layouts (`/admin/*`, `/teacher/*`, `/student/*`) provide custom sidebars and navigation suited for each user persona.

---

## 23. Assumptions

The following design decisions and assumptions were explicitly made based on real-world academic domain logic:
1. **Single Enrolled Class Coursework Scope**: Students only see published assignments for classes in which they have an active enrollment (`ClassEnrollment`).
2. **Single Active Submission Per Assignment**: A student submits one primary answer per assignment. Prior to `DueDateUtc`, the student updates their existing submission rather than creating multiple submission records.
3. **Teacher Assignment Ownership**: Only the teacher assigned to a `ClassSubject` pair (or an Admin) can create coursework or evaluate student submissions for that specific class.
4. **Score & Grade Boundaries**: Maximum assignment marks must be greater than zero (`MaxScore > 0`). Student grades cannot be negative (`Grade >= 0`) or exceed `MaxScore`.
5. **Future Due Date Validation**: New coursework due dates must be set in the future (`DueDateUtc > DateTime.UtcNow`).
