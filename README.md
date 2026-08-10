# Assignment & Submission Management System

A production-grade, enterprise-ready **Role-Based Assignment & Submission Management System** built with **.NET 8 Web API** (Clean Architecture), **Next.js 16 App Router** (TypeScript, TailwindCSS), and **MongoDB Atlas** database integration.

---

## Live Production Deployments

- **Live Frontend Portal (Vercel)**: **[https://student-management-system-durjoy.vercel.app](https://student-management-system-durjoy.vercel.app)**
- **Live Backend Web API (Render)**: **[https://student-management-backend-36k1.onrender.com](https://student-management-backend-36k1.onrender.com)**
- **Interactive Swagger Docs**: **[https://student-management-backend-36k1.onrender.com/swagger](https://student-management-backend-36k1.onrender.com/swagger)**

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

- **Secure Role-Based Authentication**: BCrypt password hashing and JWT token authorization.
- **Admin Governance Dashboard**: Full CRUD management for Users (Admins, Teachers, Students), School Classes, Subjects, and Teacher assignments.
- **Teacher Coursework Management**: Create coursework as **Draft** or **Published**, edit assignments, set max marks, enforce future due dates, review student submissions, and assign numerical scores with feedback.
-  **Student Coursework Portal**: View enrolled classes, submit answers with optional attachment URLs, update answers prior to deadline, and inspect teacher marks and feedback.
-  **Automated Deadline Enforcement**: Strict backend rejection (`400 Bad Request`) for any submission or answer modification attempt past `DueDateUtc`.
-  **Real-Time MongoDB Integration**: Automatic real-time persistence on `ApplicationDbContext.SaveChangesAsync()` to MongoDB Atlas document collections.
- **Responsive Modern UI**: Dark and Light theme toggle support built with TailwindCSS.

---

## 4. User Roles & Permissions

### Administrator (`Admin`)
- View global system overview metrics (total users, teachers, students, classes, subjects, assignments, submissions).
- Full User Management (Create user, update details, activate/deactivate account, permanently delete user).
- Manage School Classes & Courses (Create, edit, delete).
- Manage Academic Subjects (Create, edit, delete).
- Assign Teachers to Class-Subject pairings and unassign them.

### Teacher (`Teacher`)
- View assigned classes and subjects.
- Create assignments assigned to their authorized Class-Subject pairings.
- Save coursework as **Draft** or **Publish** immediately to students.
- Edit draft or published assignment details and due dates.
- Delete owned assignments.
- Review student submissions for owned assignments.
- Grade submissions (`0 <= Score <= MaxScore`) and record detailed feedback text.

### Student (`Student`)
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
                    │       Next.js 16 Frontend (Vercel)           │
                    │   https://student-management-system-durjoy...│
                    └──────────────────────┬───────────────────────┘
                                           │  REST / JSON (JWT Auth)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │      .NET 8 Web API Docker (Render)          │
                    │  https://student-management-backend-36k1... │
                    └──────────────────────┬───────────────────────┘
                                           │ Instant Document Sync
                                           ▼
                                ┌───────────────────┐
                                │   MongoDB Atlas   │
                                │ (Document Store)  │
                                └───────────────────┘
```

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

---

## 8. Authentication & Authorization

- **Password Hashing**: BCrypt hashing with salt (`BCrypt.Net-Next`).
- **JWT Authentication**: JSON Web Tokens issued upon login containing standard claims: `NameIdentifier` (User ID), `Email`, and `Role` (`Admin`, `Teacher`, `Student`).
- **Role Guards**: Backend API controllers use ASP.NET Core `[Authorize(Roles = "...")]` attributes.
- **Resource Ownership Verification**: Teacher & Student ownership checks enforce strict data privacy.

---

## 9. API Overview Table

| Controller | Method | Endpoint Route | Role Required | Description |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Register new user account |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Authenticate & receive JWT token |
| **Auth** | `GET` | `/api/v1/auth/me` | Authenticated | Get current user profile |
| **Admin** | `GET` | `/api/v1/admin/overview` | Admin | Get system-wide metrics |
| **Admin** | `GET`/`POST`/`DELETE` | `/api/v1/admin/users` | Admin | User Management & Permanent Delete |
| **Teacher**| `GET`/`POST` | `/api/v1/teacher/assignments` | Teacher, Admin | List / Create assignments |
| **Teacher**| `POST` | `/api/v1/teacher/submissions/{id}/grade` | Teacher, Admin | Grade student submission |
| **Student**| `GET`/`POST` | `/api/v1/student/submissions` | Student, Admin | Submit & view coursework answers |

---

## 10. Testing & Verification

Run backend unit tests:
```powershell
dotnet test backend/AssignmentSystem.UnitTests/AssignmentSystem.UnitTests.csproj
```
**Status**: 26 / 26 Unit Tests Passed.
