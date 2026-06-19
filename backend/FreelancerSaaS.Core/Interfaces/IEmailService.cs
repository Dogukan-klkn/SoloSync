namespace FreelancerSaaS.Core.Interfaces
{
    public interface IEmailService
    {
        Task SendInvitationAsync(string toEmail, string toName, string freelancerName, string otpCode);
        Task SendWelcomeAsync(string toEmail, string toName);
    }
}
