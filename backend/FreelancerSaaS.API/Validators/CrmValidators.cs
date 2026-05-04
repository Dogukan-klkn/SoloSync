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

    public class StartTimeEntryValidator : AbstractValidator<StartTimeEntryRequest>
    {
        public StartTimeEntryValidator()
        {
            RuleFor(x => x.ProjectTaskId)
                .NotEmpty().WithMessage("Görev seçimi zorunludur.");

            RuleFor(x => x.Description)
                .MaximumLength(500).When(x => x.Description != null);
        }
    }

    public class CreateManualTimeEntryValidator : AbstractValidator<CreateManualTimeEntryRequest>
    {
        public CreateManualTimeEntryValidator()
        {
            RuleFor(x => x.ProjectTaskId)
                .NotEmpty().WithMessage("Görev seçimi zorunludur.");

            RuleFor(x => x.StartTime)
                .NotEmpty().WithMessage("Başlangıç zamanı zorunludur.");

            RuleFor(x => x.EndTime)
                .NotEmpty().WithMessage("Bitiş zamanı zorunludur.");

            RuleFor(x => x.Description)
                .MaximumLength(500).When(x => x.Description != null);
        }
    }

    public class UpdateTimeEntryValidator : AbstractValidator<UpdateTimeEntryRequest>
    {
        public UpdateTimeEntryValidator()
        {
            RuleFor(x => x.StartTime)
                .NotEmpty().WithMessage("Başlangıç zamanı zorunludur.");

            RuleFor(x => x.EndTime)
                .NotEmpty().WithMessage("Bitiş zamanı zorunludur.");

            RuleFor(x => x.Description)
                .MaximumLength(500).When(x => x.Description != null);
        }
    }

    public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceRequest>
    {
        public CreateInvoiceValidator()
        {
            RuleFor(x => x.CustomerId)
                .NotEmpty().WithMessage("Müşteri seçimi zorunludur.");

            RuleFor(x => x.IssueDate)
                .NotEmpty().WithMessage("Fatura tarihi zorunludur.");

            RuleFor(x => x.DueDate)
                .NotEmpty().WithMessage("Son ödeme tarihi zorunludur.");
        }
    }

    public class AddPaymentValidator : AbstractValidator<AddPaymentRequest>
    {
        public AddPaymentValidator()
        {
            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Ödeme tutarı sıfırdan büyük olmalıdır.");

            RuleFor(x => x.PaymentDate)
                .NotEmpty().WithMessage("Ödeme tarihi zorunludur.");
        }
    }

    public class CreateCommentValidator : AbstractValidator<CreateCommentRequest>
    {
        public CreateCommentValidator()
        {
            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Yorum içeriği boş olamaz.")
                .MaximumLength(2000).WithMessage("Yorum en fazla 2000 karakter olabilir.");

            RuleFor(x => x)
                .Must(x => x.ProjectTaskId.HasValue || x.InvoiceId.HasValue)
                .WithMessage("ProjectTaskId veya InvoiceId'den biri dolu olmalıdır.")
                .Must(x => !(x.ProjectTaskId.HasValue && x.InvoiceId.HasValue))
                .WithMessage("Aynı anda hem görev hem fatura yorumu oluşturulamaz.");
        }
    }

    public class CreateClientRequestValidator : AbstractValidator<CreateClientRequestRequest>
    {
        public CreateClientRequestValidator()
        {
            RuleFor(x => x.ProjectId)
                .NotEmpty().WithMessage("Proje seçimi zorunludur.");

            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Mesaj içeriği boş olamaz.")
                .MaximumLength(5000).WithMessage("Mesaj en fazla 5000 karakter olabilir.");
        }
    }
}
