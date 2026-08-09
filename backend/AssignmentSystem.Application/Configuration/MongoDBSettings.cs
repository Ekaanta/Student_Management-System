namespace AssignmentSystem.Application.Configuration;

public class MongoDBSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = "assignment_management";

    public string UsersCollectionName { get; set; } = "users";
    public string ClassesCollectionName { get; set; } = "classes";
    public string SubjectsCollectionName { get; set; } = "subjects";
    public string TeacherClassSubjectsCollectionName { get; set; } = "teacherClassSubjects";
    public string StudentClassesCollectionName { get; set; } = "studentClasses";
    public string AssignmentsCollectionName { get; set; } = "assignments";
    public string SubmissionsCollectionName { get; set; } = "submissions";
}
