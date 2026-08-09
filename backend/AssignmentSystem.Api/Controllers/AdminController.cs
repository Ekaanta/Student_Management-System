using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentSystem.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<ApiResponse<AdminOverviewDto>>> GetOverviewStats(CancellationToken cancellationToken)
    {
        var stats = await _adminService.GetOverviewStatsAsync(cancellationToken);
        return Ok(new ApiResponse<AdminOverviewDto>(true, "Overview stats retrieved successfully.", stats));
    }

    #region Users

    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserDetailDto>>>> GetUsers([FromQuery] UserRole? role, CancellationToken cancellationToken)
    {
        var users = await _adminService.GetUsersAsync(role, cancellationToken);
        return Ok(new ApiResponse<IEnumerable<UserDetailDto>>(true, "Users retrieved successfully.", users));
    }

    [HttpGet("users/{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> GetUserById(Guid id, CancellationToken cancellationToken)
    {
        var user = await _adminService.GetUserByIdAsync(id, cancellationToken);
        return Ok(new ApiResponse<UserDetailDto>(true, "User retrieved successfully.", user));
    }

    [HttpPost("users")]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> CreateUser([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _adminService.CreateUserAsync(request, cancellationToken);
        return Ok(new ApiResponse<UserDetailDto>(true, "User created successfully.", user));
    }

    [HttpPut("users/{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _adminService.UpdateUserAsync(id, request, cancellationToken);
        return Ok(new ApiResponse<UserDetailDto>(true, "User updated successfully.", user));
    }

    [HttpPatch("users/{id:guid}/toggle-status")]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> ToggleUserStatus(Guid id, CancellationToken cancellationToken)
    {
        var user = await _adminService.ToggleUserStatusAsync(id, cancellationToken);
        return Ok(new ApiResponse<UserDetailDto>(true, "User status toggled successfully.", user));
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteUser(Guid id, CancellationToken cancellationToken)
    {
        await _adminService.DeleteUserAsync(id, cancellationToken);
        return Ok(new ApiResponse<object>(true, "User deleted successfully.", null));
    }

    #endregion

    #region School Classes

    [HttpGet("classes")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SchoolClassDto>>>> GetClasses(CancellationToken cancellationToken)
    {
        var classes = await _adminService.GetClassesAsync(cancellationToken);
        return Ok(new ApiResponse<IEnumerable<SchoolClassDto>>(true, "Classes retrieved successfully.", classes));
    }

    [HttpGet("classes/{id:guid}")]
    public async Task<ActionResult<ApiResponse<SchoolClassDto>>> GetClassById(Guid id, CancellationToken cancellationToken)
    {
        var schoolClass = await _adminService.GetClassByIdAsync(id, cancellationToken);
        return Ok(new ApiResponse<SchoolClassDto>(true, "Class retrieved successfully.", schoolClass));
    }

    [HttpPost("classes")]
    public async Task<ActionResult<ApiResponse<SchoolClassDto>>> CreateClass([FromBody] CreateSchoolClassRequest request, CancellationToken cancellationToken)
    {
        var schoolClass = await _adminService.CreateClassAsync(request, cancellationToken);
        return Ok(new ApiResponse<SchoolClassDto>(true, "Class created successfully.", schoolClass));
    }

    [HttpPut("classes/{id:guid}")]
    public async Task<ActionResult<ApiResponse<SchoolClassDto>>> UpdateClass(Guid id, [FromBody] UpdateSchoolClassRequest request, CancellationToken cancellationToken)
    {
        var schoolClass = await _adminService.UpdateClassAsync(id, request, cancellationToken);
        return Ok(new ApiResponse<SchoolClassDto>(true, "Class updated successfully.", schoolClass));
    }

    [HttpDelete("classes/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteClass(Guid id, CancellationToken cancellationToken)
    {
        await _adminService.DeleteClassAsync(id, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Class deleted successfully.", null));
    }

    #endregion

    #region Subjects

    [HttpGet("subjects")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SubjectDto>>>> GetSubjects(CancellationToken cancellationToken)
    {
        var subjects = await _adminService.GetSubjectsAsync(cancellationToken);
        return Ok(new ApiResponse<IEnumerable<SubjectDto>>(true, "Subjects retrieved successfully.", subjects));
    }

    [HttpGet("subjects/{id:guid}")]
    public async Task<ActionResult<ApiResponse<SubjectDto>>> GetSubjectById(Guid id, CancellationToken cancellationToken)
    {
        var subject = await _adminService.GetSubjectByIdAsync(id, cancellationToken);
        return Ok(new ApiResponse<SubjectDto>(true, "Subject retrieved successfully.", subject));
    }

    [HttpPost("subjects")]
    public async Task<ActionResult<ApiResponse<SubjectDto>>> CreateSubject([FromBody] CreateSubjectRequest request, CancellationToken cancellationToken)
    {
        var subject = await _adminService.CreateSubjectAsync(request, cancellationToken);
        return Ok(new ApiResponse<SubjectDto>(true, "Subject created successfully.", subject));
    }

    [HttpPut("subjects/{id:guid}")]
    public async Task<ActionResult<ApiResponse<SubjectDto>>> UpdateSubject(Guid id, [FromBody] UpdateSubjectRequest request, CancellationToken cancellationToken)
    {
        var subject = await _adminService.UpdateSubjectAsync(id, request, cancellationToken);
        return Ok(new ApiResponse<SubjectDto>(true, "Subject updated successfully.", subject));
    }

    [HttpDelete("subjects/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteSubject(Guid id, CancellationToken cancellationToken)
    {
        await _adminService.DeleteSubjectAsync(id, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Subject deleted successfully.", null));
    }

    #endregion

    #region Teacher Assignments

    [HttpGet("teacher-assignments")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ClassSubjectDetailDto>>>> GetTeacherAssignments(CancellationToken cancellationToken)
    {
        var assignments = await _adminService.GetTeacherAssignmentsAsync(cancellationToken);
        return Ok(new ApiResponse<IEnumerable<ClassSubjectDetailDto>>(true, "Teacher assignments retrieved successfully.", assignments));
    }

    [HttpPost("teacher-assignments")]
    public async Task<ActionResult<ApiResponse<ClassSubjectDetailDto>>> AssignTeacher([FromBody] AssignTeacherRequest request, CancellationToken cancellationToken)
    {
        var assignment = await _adminService.AssignTeacherAsync(request, cancellationToken);
        return Ok(new ApiResponse<ClassSubjectDetailDto>(true, "Teacher assigned successfully.", assignment));
    }

    [HttpDelete("teacher-assignments/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> RemoveTeacherAssignment(Guid id, CancellationToken cancellationToken)
    {
        await _adminService.RemoveTeacherAssignmentAsync(id, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Teacher assignment removed successfully.", null));
    }

    #endregion
}
