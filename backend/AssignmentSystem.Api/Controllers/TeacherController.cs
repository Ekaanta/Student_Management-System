using System.Security.Claims;
using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;
using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentSystem.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Teacher,Admin")]
public class TeacherController : ControllerBase
{
    private readonly ITeacherService _teacherService;

    public TeacherController(ITeacherService teacherService)
    {
        _teacherService = teacherService;
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("id")?.Value;

        if (Guid.TryParse(idClaim, out var userId))
        {
            return userId;
        }

        throw new AppException("Invalid authentication claims or user identity missing.", 401);
    }

    [HttpGet("class-subjects")]
    public async Task<ActionResult<ApiResponse<IEnumerable<TeacherClassSubjectDto>>>> GetMyClassSubjects()
    {
        var teacherId = GetCurrentUserId();
        var data = await _teacherService.GetMyClassSubjectsAsync(teacherId);
        return Ok(new ApiResponse<IEnumerable<TeacherClassSubjectDto>>(true, "Class subjects retrieved successfully.", data));
    }

    [HttpGet("assignments")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AssignmentDto>>>> GetAssignments(
        [FromQuery] Guid? classSubjectId,
        [FromQuery] AssignmentStatus? status)
    {
        var teacherId = GetCurrentUserId();
        var data = await _teacherService.GetTeacherAssignmentsAsync(teacherId, classSubjectId, status);
        return Ok(new ApiResponse<IEnumerable<AssignmentDto>>(true, "Assignments retrieved successfully.", data));
    }

    [HttpGet("assignments/{id:guid}")]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> GetAssignmentById(Guid id)
    {
        var teacherId = GetCurrentUserId();
        var data = await _teacherService.GetAssignmentByIdAsync(teacherId, id);
        return Ok(new ApiResponse<AssignmentDto>(true, "Assignment retrieved successfully.", data));
    }

    [HttpPost("assignments")]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> CreateAssignment(
        [FromBody] CreateAssignmentRequest request,
        [FromQuery] bool saveAsDraft = true)
    {
        var teacherId = GetCurrentUserId();
        var data = await _teacherService.CreateAssignmentAsync(teacherId, request, saveAsDraft);
        return CreatedAtAction(nameof(GetAssignmentById), new { id = data.Id }, new ApiResponse<AssignmentDto>(true, "Assignment created successfully.", data));
    }

    [HttpPut("assignments/{id:guid}")]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> UpdateAssignment(Guid id, [FromBody] UpdateAssignmentRequest request)
    {
        var teacherId = GetCurrentUserId();
        var data = await _teacherService.UpdateAssignmentAsync(teacherId, id, request);
        return Ok(new ApiResponse<AssignmentDto>(true, "Assignment updated successfully.", data));
    }

    [HttpDelete("assignments/{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteAssignment(Guid id)
    {
        var teacherId = GetCurrentUserId();
        var success = await _teacherService.DeleteAssignmentAsync(teacherId, id);
        return Ok(new ApiResponse<bool>(true, "Assignment deleted successfully.", success));
    }

    [HttpPost("assignments/{id:guid}/publish")]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> PublishAssignment(Guid id)
    {
        var teacherId = GetCurrentUserId();
        var data = await _teacherService.PublishAssignmentAsync(teacherId, id);
        return Ok(new ApiResponse<AssignmentDto>(true, "Assignment published successfully.", data));
    }

    [HttpGet("assignments/{id:guid}/submissions")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SubmissionDto>>>> GetSubmissionsForAssignment(Guid id)
    {
        var teacherId = GetCurrentUserId();
        var data = await _teacherService.GetSubmissionsForAssignmentAsync(teacherId, id);
        return Ok(new ApiResponse<IEnumerable<SubmissionDto>>(true, "Submissions retrieved successfully.", data));
    }

    [HttpGet("submissions/{submissionId:guid}")]
    public async Task<ActionResult<ApiResponse<SubmissionDto>>> GetSubmissionById(Guid submissionId)
    {
        var teacherId = GetCurrentUserId();
        var data = await _teacherService.GetSubmissionByIdAsync(teacherId, submissionId);
        return Ok(new ApiResponse<SubmissionDto>(true, "Submission retrieved successfully.", data));
    }

    [HttpPost("submissions/{submissionId:guid}/grade")]
    public async Task<ActionResult<ApiResponse<SubmissionDto>>> GradeSubmission(Guid submissionId, [FromBody] GradeSubmissionRequest request)
    {
        var teacherId = GetCurrentUserId();
        var data = await _teacherService.GradeSubmissionAsync(teacherId, submissionId, request);
        return Ok(new ApiResponse<SubmissionDto>(true, "Submission reviewed and graded successfully.", data));
    }
}
