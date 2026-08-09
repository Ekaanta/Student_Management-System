using AssignmentSystem.Application.DTOs;
using FluentValidation;

namespace AssignmentSystem.Application.Validators;

public class CreateAssignmentRequestValidator : AbstractValidator<CreateAssignmentRequest>
{
    public CreateAssignmentRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Assignment title is required.").MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().WithMessage("Assignment description is required.");
        RuleFor(x => x.MaxScore).GreaterThan(0).WithMessage("Maximum marks must be greater than zero.");
        RuleFor(x => x.ClassSubjectId).NotEmpty().WithMessage("Valid Class and Subject selection is required.");
    }
}

public class UpdateAssignmentRequestValidator : AbstractValidator<UpdateAssignmentRequest>
{
    public UpdateAssignmentRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Assignment title is required.").MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().WithMessage("Assignment description is required.");
        RuleFor(x => x.MaxScore).GreaterThan(0).WithMessage("Maximum marks must be greater than zero.");
    }
}

public class GradeSubmissionRequestValidator : AbstractValidator<GradeSubmissionRequest>
{
    public GradeSubmissionRequestValidator()
    {
        RuleFor(x => x.Grade).GreaterThanOrEqualTo(0).WithMessage("Marks cannot be negative.");
    }
}
