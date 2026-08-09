using AssignmentSystem.Application.DTOs;
using FluentValidation;

namespace AssignmentSystem.Application.Validators;

public class CreateSubmissionRequestValidator : AbstractValidator<CreateSubmissionRequest>
{
    public CreateSubmissionRequestValidator()
    {
        RuleFor(x => x.AssignmentId).NotEmpty().WithMessage("Valid Assignment ID is required.");
        RuleFor(x => x.SubmittedContent).NotEmpty().WithMessage("Submission answer content is required.");
    }
}

public class UpdateSubmissionRequestValidator : AbstractValidator<UpdateSubmissionRequest>
{
    public UpdateSubmissionRequestValidator()
    {
        RuleFor(x => x.SubmittedContent).NotEmpty().WithMessage("Submission answer content is required.");
    }
}
