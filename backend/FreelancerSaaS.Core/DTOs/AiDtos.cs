namespace FreelancerSaaS.Core.DTOs
{
    /// <summary>Müşteri isteği AI analiz sonucu (iç kullanım + API yanıtı).</summary>
    public class ClientRequestAnalysisResult
    {
        public string       Summary       { get; set; } = string.Empty;
        public string       Priority      { get; set; } = "Medium";
        public string       ClientPreview { get; set; } = string.Empty;
        public List<string> TaskItems     { get; set; } = [];
        public List<string> Tags          { get; set; } = [];
        public string       Provider      { get; set; } = "fallback";
        public bool         IsAiPowered   { get; set; }
    }

    public class PreviewClientRequestRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}
