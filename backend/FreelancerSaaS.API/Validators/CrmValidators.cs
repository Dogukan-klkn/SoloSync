using FluentValidation;
using FreelancerSaaS.Core.DTOs;

namespace FreelancerSaaS.API.Validators
{
    public class CreateCustomerValidator : AbstractValidator<CreateCustomerRequest>
    {
        public CreateCustomerValidator()
        {
            RuleFor(x => x.CompanyName)
                .NotEmpty().WithMessage("Şirket adı zorunludur.")
                .MaximumLength(100);

            RuleFor(x => x.ContactName)
                .NotEmpty().WithMessage("İletişim kişisi zorunludur.")
                .MaximumLength(50);

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("E-posta zorunludur.")
                .EmailAddress().WithMessage("Geçerli bir e-posta giriniz.")
                .MaximumLength(100);

            RuleFor(x => x.Phone)
                .MaximumLength(20).When(x => x.Phone != null);

            RuleFor(x => x.TaxNumber)
                .MaximumLength(50).When(x => x.TaxNumber != null);

            RuleFor(x => x.BillingAddress)
                .MaximumLength(250).When(x => x.BillingAddress != null);
        }
    }

    public class CreateProjectValidator : AbstractValidator<CreateProjectRequest>
    {
        public CreateProjectValidator()
        {
            RuleFor(x => x.CustomerId)
                .NotEmpty().WithMessage("Müşteri seçimi zorunludur.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Proje adı zorunludur.")
                .MaximumLength(100);

            RuleFor(x => x.Description)
                .MaximumLength(500).When(x => x.Description != null);

            RuleFor(x => x.Status)
                .InclusiveBetween(1, 4).WithMessage("Geçerli bir durum seçiniz.");

            RuleFor(x => x.Budget)
                .GreaterThan(0).When(x => x.Budget.HasValue)
                .WithMessage("Bütçe 0'dan büyük olmalıdır.");
        }
    }

    public class CreateMilestoneValidator : AbstractValidator<CreateMilestoneRequest>
    {
        public CreateMilestoneValidator()
        {
            RuleFor(x => x.ProjectId).NotEmpty();
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Başlık zorunludur.")
                .MaximumLength(100);
        }
    }

    public class CreateProjectTaskValidator : AbstractValidator<CreateProjectTaskRequest>
    {
        public CreateProjectTaskValidator()
        {
            RuleFor(x => x.ProjectId)
                .NotEmpty().WithMessage("Proje seçimi zorunludur.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Görev başlığı zorunludur.")
                .MaximumLength(200);

            RuleFor(x => x.Description)
                .MaximumLength(1000).When(x => x.Description != null);

            RuleFor(x => x.Status)
                .InclusiveBetween(1, 4).WithMessage("Geçerli bir durum seçiniz (1-4).");

            RuleFor(x => x.Priority)
                .InclusiveBetween(1, 4).WithMessage("Geçerli bir öncelik seçiniz (1-4).");
        }
    }

    public class UpdateProjectTaskValidator : AbstractValidator<UpdateProjectTaskRequest>
    {
        public UpdateProjectTaskValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Görev başlığı zorunludur.")
                .MaximumLength(200);

            RuleFor(x => x.Description)
                .MaximumLength(1000).When(x => x.Description != null);

            RuleFor(x => x.Status)
                .InclusiveBetween(1, 4).WithMessage("Geçerli bir durum seçiniz (1-4).");

            RuleFor(x => x.Priority)
                .InclusiveBetween(1, 4).WithMessage("Geçerli bir öncelik seçiniz (1-4).");
        }
    }
}
