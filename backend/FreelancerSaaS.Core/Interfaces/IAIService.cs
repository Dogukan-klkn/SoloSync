namespace FreelancerSaaS.Core.Interfaces
{
    public interface IAIService
    {
        Task<string> SummarizeClientRequestAsync(string message);
    }
}
