export enum UserRole {
  Admin = 1,
  Teacher = 2,
  Student = 3,
}

export enum AssignmentStatus {
  Draft = 1,
  Published = 2,
  Closed = 3,
}

export enum SubmissionStatus {
  Submitted = 1,
  Reviewed = 2,
  Late = 3,
  Returned = 4,
  Closed = 5,
  Graded = 6,
  ResubmissionRequested = 7,
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAtUtc: string;
  profilePictureUrl?: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePictureUrl?: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePictureUrl?: string;
  createdAtUtc: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface TeacherClassSubjectDto {
  id: string;
  classId: string;
  className: string;
  classCode: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalStudentsEnrolled: number;
}

export interface StudentClassDto {
  classId: string;
  className: string;
  classCode: string;
  academicYear: string;
}

export interface StudentAssignmentDto {
  id: string;
  title: string;
  description: string;
  maxScore: number;
  dueDateUtc: string;
  classSubjectId: string;
  className: string;
  classCode: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  hasSubmitted: boolean;
  studentSubmissionStatus?: SubmissionStatus;
  studentGrade?: number;
  studentFeedback?: string;
  studentSubmittedAtUtc?: string;
  studentSubmissionId?: string;
  isOverdue: boolean;
}

export interface AssignmentDto {
  id: string;
  title: string;
  description: string;
  maxScore: number;
  status: AssignmentStatus;
  dueDateUtc: string;
  publishedAtUtc?: string;
  classSubjectId: string;
  className?: string;
  classCode?: string;
  subjectName?: string;
  subjectCode?: string;
  teacherId: string;
  teacherName: string;
  createdAtUtc: string;
  submissionsCount?: number;
}

export interface SubmissionDto {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  assignmentMaxScore?: number;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  submittedContent: string;
  attachmentUrl?: string;
  submittedAtUtc: string;
  status: SubmissionStatus;
  grade?: number;
  feedback?: string;
  gradedAtUtc?: string;
  gradedById?: string;
  gradedByName?: string;
}

export interface CreateSubmissionRequest {
  assignmentId: string;
  submittedContent: string;
  attachmentUrl?: string;
}

export interface UpdateSubmissionRequest {
  submittedContent: string;
  attachmentUrl?: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  maxScore: number;
  dueDateUtc: string;
  classSubjectId: string;
}

export interface UpdateAssignmentRequest {
  title: string;
  description: string;
  maxScore: number;
  dueDateUtc: string;
}

export interface GradeSubmissionRequest {
  grade: number;
  feedback?: string;
  status?: SubmissionStatus;
}
