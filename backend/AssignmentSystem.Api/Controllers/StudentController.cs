using System.Security.Claims;
using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;
using AssignmentSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentSystem.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Student,Admin")]
public class StudentController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentController(IStudentService studentService)
    {
        _studentService = studentService;
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

    [HttpGet("classes")]
    public async Task<ActionResult<ApiResponse<IEnumerable<StudentClassDto>>>> GetMyClasses()
    {
        var studentId = GetCurrentUserId();
        var data = await _studentService.GetMyClassesAsync(studentId);
        return Ok(new ApiResponse<IEnumerable<StudentClassDto>>(true, "Enrolled classes retrieved successfully.", data));
    }

    [HttpGet("assignments")]
    public async Task<ActionResult<ApiResponse<IEnumerable<StudentAssignmentDto>>>> GetStudentAssignments([FromQuery] Guid? classId)
    {
        var studentId = GetCurrentUserId();
        var data = await _studentService.GetStudentAssignmentsAsync(studentId, classId);
        return Ok(new ApiResponse<IEnumerable<StudentAssignmentDto>>(true, "Assignments retrieved successfully.", data));
    }

    [HttpGet("assignments/{id:guid}")]
    public async Task<ActionResult<ApiResponse<StudentAssignmentDto>>> GetStudentAssignmentById(Guid id)
    {
        var studentId = GetCurrentUserId();
        var data = await _studentService.GetStudentAssignmentByIdAsync(studentId, id);
        return Ok(new ApiResponse<StudentAssignmentDto>(true, "Assignment details retrieved successfully.", data));
    }

    [HttpPost("submissions")]
    public async Task<ActionResult<ApiResponse<SubmissionDto>>> CreateSubmission([FromBody] CreateSubmissionRequest request)
    {
        var studentId = GetCurrentUserId();
        var data = await _studentService.CreateSubmissionAsync(studentId, request);
        return CreatedAtAction(nameof(GetMySubmissionById), new { submissionId = data.Id }, new ApiResponse<SubmissionDto>(true, "Submission submitted successfully.", data));
    }

    [HttpPut("submissions/{submissionId:guid}")]
    public async Task<ActionResult<ApiResponse<SubmissionDto>>> UpdateSubmission(Guid submissionId, [FromBody] UpdateSubmissionRequest request)
    {
        var studentId = GetCurrentUserId();
        var data = await _studentService.UpdateSubmissionAsync(studentId, submissionId, request);
        return Ok(new ApiResponse<SubmissionDto>(true, "Submission updated successfully.", data));
    }

    [HttpGet("submissions")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SubmissionDto>>>> GetMySubmissions()
    {
        var studentId = GetCurrentUserId();
        var data = await _studentService.GetMySubmissionsAsync(studentId);
        return Ok(new ApiResponse<IEnumerable<SubmissionDto>>(true, "Submissions retrieved successfully.", data));
    }

    [HttpGet("submissions/{submissionId:guid}")]
    public async Task<ActionResult<ApiResponse<SubmissionDto>>> GetMySubmissionById(Guid submissionId)
    {
        var studentId = GetCurrentUserId();
        var data = await _studentService.GetMySubmissionByIdAsync(studentId, submissionId);
        return Ok(new ApiResponse<SubmissionDto>(true, "Submission retrieved successfully.", data));
    }
}
