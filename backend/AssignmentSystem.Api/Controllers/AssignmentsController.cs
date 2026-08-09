using AssignmentSystem.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentSystem.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    [HttpGet]
    public ActionResult<ApiResponse<IEnumerable<AssignmentDto>>> GetAssignments()
    {
        return Ok(new ApiResponse<IEnumerable<AssignmentDto>>(true, "Assignments retrieved.", Array.Empty<AssignmentDto>()));
    }

    [HttpGet("{id:guid}")]
    public ActionResult<ApiResponse<AssignmentDto>> GetAssignmentById(Guid id)
    {
        return Ok(new ApiResponse<AssignmentDto>(false, "Assignment not found.", null));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public ActionResult<ApiResponse<AssignmentDto>> CreateAssignment([FromBody] CreateAssignmentRequest request)
    {
        return Ok(new ApiResponse<AssignmentDto>(true, "Assignment created placeholder.", null));
    }
}
