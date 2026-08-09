using AssignmentSystem.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentSystem.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class SubmissionsController : ControllerBase
{
    [HttpGet]
    public ActionResult<ApiResponse<IEnumerable<SubmissionDto>>> GetSubmissions()
    {
        return Ok(new ApiResponse<IEnumerable<SubmissionDto>>(true, "Submissions retrieved.", Array.Empty<SubmissionDto>()));
    }

    [HttpPost]
    [Authorize(Roles = "Student")]
    public ActionResult<ApiResponse<SubmissionDto>> CreateSubmission([FromBody] CreateSubmissionRequest request)
    {
        return Ok(new ApiResponse<SubmissionDto>(true, "Submission received placeholder.", null));
    }
}
