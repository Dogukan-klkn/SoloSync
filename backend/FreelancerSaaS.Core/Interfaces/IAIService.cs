using FreelancerSaaS.Core.DTOs;

namespace FreelancerSaaS.Core.Interfaces
{
    public interface IAIService
    {
        /// <summary>Müşteri mesajını yapılandırılmış görev analizine dönüştürür.</summary>
        Task<ClientRequestAnalysisResult> AnalyzeClientRequestAsync(string message, CancellationToken ct = default);

        /// <summary>Geriye uyumluluk — sadece özet metni döner.</summary>
        Task<string> SummarizeClientRequestAsync(string message);
    }
}
