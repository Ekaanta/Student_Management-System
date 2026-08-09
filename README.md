# Role-Based Assignment & Submission Management System - Database & Module Specs

This document details the **MongoDB Atlas Database Integration**, **Remote / Hosted PostgreSQL Database Foundation**, Entity Framework Core models, database relationships, constraints, safe delete rules, development seed data, and feature module documentation.

---

## 🍃 MongoDB Atlas Database Integration & Setup

The ASP.NET Core backend includes full **MongoDB Atlas Integration** using the official `MongoDB.Driver` SDK.

### 📍 Cluster & Database Overview
- **Cluster Host**: `cluster0.bzt8ohz.mongodb.net`
- **Username**: `ekantabanik_db_user`
- **Database Name**: `assignment_management`
- **Connection Format**:
  ```text
  mongodb+srv://ekantabanik_db_user:<db_password>@cluster0.bzt8ohz.mongodb.net/?appName=Cluster0
  ```

> [!IMPORTANT]
> **Security Requirement**: `<db_password>` is a placeholder. Passwords must never be hardcoded in source files or committed to Git. Configure your MongoDB password securely via environment variables or .NET User Secrets.

---

### 🔑 Environment Variables Configuration

Set your MongoDB connection parameters in your OS environment or deployment platform:

- **Windows PowerShell**:
  ```powershell
  $env:MONGODB_CONNECTION_STRING="mongodb+srv://ekantabanik_db_user:YOUR_SECRET_PASSWORD@cluster0.bzt8ohz.mongodb.net/?appName=Cluster0"
  $env:MONGODB_DATABASE_NAME="assignment_management"
  ```
- **Windows CMD**:
  ```cmd
  set MONGODB_CONNECTION_STRING=mongodb+srv://ekantabanik_db_user:YOUR_SECRET_PASSWORD@cluster0.ge9suxb.mongodb.net/?appName=Cluster0
  set MONGODB_DATABASE_NAME=assignment_management
  ```
- **Linux / macOS Shell**:
  ```bash
  export MONGODB_CONNECTION_STRING="mongodb+srv://ekantabanik_db_user:YOUR_SECRET_PASSWORD@cluster0.ge9suxb.mongodb.net/?appName=Cluster0"
  export MONGODB_DATABASE_NAME="assignment_management"
  ```

---

### 📂 MongoDB Collections & Document Schemas

| Collection Name | Entity Model | Key Attributes & Document Fields |
| :--- | :--- | :--- |
| `users` | `User` | `Id` (Guid), `Name` (Computed), `Email`, `PasswordHash`, `Role` (1=Admin, 2=Teacher, 3=Student), `ProfilePictureUrl`, `IsActive`, `CreatedAtUtc` |
| `classes` | `SchoolClass` | `Id` (Guid), `Name`, `Code`, `AcademicYear`, `Description`, `IsActive`, `CreatedAtUtc` |
| `subjects` | `Subject` | `Id` (Guid), `Name`, `Code`, `Description`, `IsActive`, `CreatedAtUtc` |
| `teacherClassSubjects` | `ClassSubject` | `Id` (Guid), `TeacherId`, `ClassId`, `SubjectId`, `CreatedAtUtc` |
| `studentClasses` | `ClassEnrollment` | `Id` (Guid), `StudentId`, `ClassId`, `EnrolledAtUtc`, `CreatedAtUtc` |
| `assignments` | `Assignment` | `Id` (Guid), `TeacherId`, `ClassSubjectId`, `Title`, `Description`, `MaxScore` / `MaximumMarks`, `DueDateUtc` (Deadline), `Status` (1=Draft, 2=Published, 3=Closed), `PublishedAtUtc`, `CreatedAtUtc` |
| `submissions` | `Submission` | `Id` (Guid), `AssignmentId`, `StudentId`, `SubmittedContent` / `Answer`, `AttachmentUrl`, `SubmittedAtUtc`, `Grade` / `Marks`, `Feedback`, `Status` (1=Submitted, 2=Reviewed, 6=Graded) |

---

### 🛡️ MongoDB Indexes Created Automatically

When the backend initializes, `MongoDbContext.EnsureIndexesCreatedAsync` automatically verifies and creates the following indexes on MongoDB Atlas:

1. **`users`**:
   - Unique Index: `Email` (`ux_users_email`)
2. **`classes`**:
   - Unique Index: `Code` (`ux_classes_code`)
3. **`subjects`**:
   - Unique Index: `Code` (`ux_subjects_code`)
4. **`teacherClassSubjects`**:
   - Unique Compound Index: `(TeacherId, ClassId, SubjectId)` (`ux_teacher_class_subject`)
5. **`studentClasses`**:
   - Unique Compound Index: `(StudentId, ClassId)` (`ux_student_class`)
6. **`submissions`**:
   - Unique Compound Index: `(AssignmentId, StudentId)` (`ux_assignment_student_submission`)
7. **`assignments`**:
   - Compound Query Index: `(TeacherId, ClassSubjectId, DueDateUtc)` (`ix_assignments_teacher_class_deadline`)

---

### 🌱 MongoDB Atlas Automatic Development Seeder

When `MongoDbSeeder.SeedAsync` runs:
- It checks if any document exists in the `users` collection.
- If empty, it automatically seeds initial development accounts (`admin@example.com`, `teacher@example.com`, `student@example.com` with password `Password123!`), 1 Class (`Grade 10 - Section A`), 1 Subject (`Mathematics`), 1 `TeacherClassSubject` assignment, and 1 `StudentClass` enrollment.

---

## 🎓 Step 4: Student Module Architecture & Specifications

The **Student Module** allows enrolled students to view coursework for their classes, submit answers before deadlines, update submissions, and review grades & teacher feedback.

### 🔑 Business Rules & Security Enforcement
1. **Role Authorization**: All Student APIs require `[Authorize(Roles = "Student,Admin")]`.
2. **Class-Course Isolation**: Students can ONLY view assignments for classes in which they are actively enrolled via `ClassEnrollment`.
3. **Draft Privacy**: Assignments with status `Draft` are strictly hidden from students. Only `Published` assignments are accessible.
4. **Deadline Enforcement**:
   - Submissions and submission updates are allowed strictly before the assignment's deadline (`DueDateUtc`).
   - Attempting to submit or update an answer after the deadline returns `400 Bad Request` ("Submission deadline has passed.").
5. **Student Ownership & Privacy**:
   - Students can ONLY access or modify their own submission records.
   - Attempting to view or modify another student's submission returns `403 Forbidden`.
6. **Results & Feedback Visibility**:
   - Grades and teacher feedback are displayed to the student once evaluated by the instructor.

---

### 🌐 Student Module API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/student/classes` | Get classes in which current student is enrolled |
| `GET` | `/api/v1/student/assignments` | List published assignments for student's classes (optional `classId` filter) |
| `GET` | `/api/v1/student/assignments/{id}` | Get published assignment details & student's submission status |
| `POST` | `/api/v1/student/submissions` | Create submission for an assignment before deadline |
| `PUT` | `/api/v1/student/submissions/{submissionId}` | Update an existing submission before deadline |
| `GET` | `/api/v1/student/submissions` | List student's own submission history |
| `GET` | `/api/v1/student/submissions/{submissionId}` | Get single submission details (includes grade & feedback) |

---

## 👨‍🏫 Step 3: Teacher Module Architecture & Specifications

The **Teacher Module** empowers educators to manage coursework, assign work to assigned classes and subjects, review student submissions, and deliver grades & feedback.

### 🔑 Business Rules & Security Enforcement
1. **Role Authorization**: All Teacher APIs require `[Authorize(Roles = "Teacher,Admin")]`.
2. **Teacher Class-Subject Assignment Check**: A teacher can ONLY create assignments for `ClassSubject` pairs to which they were assigned by an Administrator. Attempting to create coursework for unassigned classes returns `403 Forbidden`.
3. **Teacher Assignment Ownership**: A teacher cannot view, edit, publish, delete, or inspect submissions for an assignment created by or assigned to another teacher (`403 Forbidden`).
4. **Draft vs. Published Workflow**:
   - Assignments can be created as `Draft` or `Published`.
   - Draft assignments can be edited freely and published when ready.
   - Published assignments trigger `PublishedAtUtc = DateTime.UtcNow`.
5. **Marks Validation**:
   - `MaxScore` (Maximum Marks) must be greater than zero (`> 0`).
   - Assigned grades cannot be negative (`>= 0`) and cannot exceed `MaxScore` (`Grade <= MaxScore`). Attempting to assign marks greater than `MaxScore` returns `400 Bad Request`.

---

### 🌐 Teacher Module API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/teacher/class-subjects` | Get classes & subjects assigned to current teacher |
| `GET` | `/api/v1/teacher/assignments` | List assignments created by teacher (filters: `classSubjectId`, `status`) |
| `GET` | `/api/v1/teacher/assignments/{id}` | Get assignment details by ID |
| `POST` | `/api/v1/teacher/assignments` | Create assignment (`saveAsDraft=true/false`) |
| `PUT` | `/api/v1/teacher/assignments/{id}` | Update assignment details |
| `DELETE` | `/api/v1/teacher/assignments/{id}` | Delete assignment |
| `POST` | `/api/v1/teacher/assignments/{id}/publish` | Publish a draft assignment |
| `GET` | `/api/v1/teacher/assignments/{id}/submissions` | View student submissions for an assignment |
| `GET` | `/api/v1/teacher/submissions/{submissionId}` | Get single submission details |
| `POST` | `/api/v1/teacher/submissions/{submissionId}/grade` | Grade submission, assign marks & feedback |

---

## 🗄️ Hosted PostgreSQL Setup & Environment Configuration

The application is configured to connect to a **Remote / Hosted PostgreSQL Database**.

### Connection String Format
```text
Host=<REMOTE_HOST>;Port=5432;Database=assignment_management;Username=<REMOTE_USERNAME>;Password=<REMOTE_PASSWORD>;SSL Mode=Require
```

---

## ⚡ Running backend & frontend

### Launch ASP.NET Core Backend
```powershell
$env:PATH = "C:\Users\Ekanta Banik Durjoy\AppData\Local\Microsoft\dotnet;$env:PATH"
$env:DOTNET_ROOT = "C:\Users\Ekanta Banik Durjoy\AppData\Local\Microsoft\dotnet"
dotnet run --project backend/AssignmentSystem.Api/AssignmentSystem.Api.csproj --urls "http://localhost:5000"
```

### Launch Next.js Frontend
```powershell
npm run dev
```
