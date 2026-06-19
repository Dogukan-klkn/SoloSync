using FreelancerSaaS.Core.Configuration;
using FreelancerSaaS.Core.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace FreelancerSaaS.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _settings;

        public EmailService(IOptions<SmtpSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task SendInvitationAsync(string toEmail, string toName, string freelancerName, string otpCode)
        {
            var subject = $"SoloSync — {freelancerName} sizi davet etti";
            var body = $@"
<html>
<body style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"">
  <h2 style=""color: #7c3aed;"">SoloSync Müşteri Portalı</h2>
  <p>Merhaba <strong>{toName}</strong>,</p>
  <p><strong>{freelancerName}</strong> sizi SoloSync müşteri portalına davet etti.</p>
  <p>Hesabınızı aktive etmek için aşağıdaki doğrulama kodunu kullanın:</p>
  <div style=""background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;"">
    <span style=""font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7c3aed;"">{otpCode}</span>
  </div>
  <p style=""color: #6b7280;"">Bu kod 24 saat geçerlidir.</p>
  <p>Giriş yapmak için: <a href=""http://localhost:5173/client-setup"">SoloSync Client Portal</a></p>
  <hr style=""border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;""/>
  <p style=""color: #9ca3af; font-size: 12px;"">Bu emaili siz talep etmediyseniz görmezden gelebilirsiniz.</p>
</body>
</html>";

            await SendAsync(toEmail, toName, subject, body);
        }

        public async Task SendWelcomeAsync(string toEmail, string toName)
        {
            var subject = "SoloSync — Hesabınız oluşturuldu";
            var body = $@"
<html>
<body style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"">
  <h2 style=""color: #7c3aed;"">Hoş Geldiniz!</h2>
  <p>Merhaba <strong>{toName}</strong>,</p>
  <p>SoloSync hesabınız başarıyla oluşturuldu. Artık müşteri portalına giriş yapabilirsiniz.</p>
  <p><a href=""http://localhost:5173/login"">Giriş Yap</a></p>
</body>
</html>";

            await SendAsync(toEmail, toName, subject, body);
        }

        private async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_settings.Username, _settings.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
