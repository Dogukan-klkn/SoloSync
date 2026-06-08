using FreelancerSaaS.Core.Interfaces;

namespace FreelancerSaaS.Infrastructure.Services.AI.Providers
{
    /// <summary>API anahtarı yoksa veya tüm sağlayıcılar başarısız olursa kural tabanlı yedek.</summary>
    public class FallbackProvider : IAIProvider
    {
        public string Name => "Fallback";
        public bool IsConfigured => true;

        public Task<string> CompleteAsync(string systemPrompt, string userPrompt, CancellationToken ct = default)
        {
            // userPrompt içinde müşteri mesajı gömülü — basit JSON üret
            var msg = ExtractMessage(userPrompt);
            var summary = msg.Length > 300 ? msg[..300] + "..." : msg;
            var preview = summary.Length > 120 ? summary[..120] + "..." : summary;

            var json = $$"""
                {
                  "summary": {{JsonEscape(summary)}},
                  "priority": "Medium",
                  "clientPreview": {{JsonEscape("Isteginiz su sekilde anlasildi: " + preview)}},
                  "taskItems": [],
                  "tags": ["musteri-istegi"]
                }
                """;
            return Task.FromResult(json);
        }

        private static string ExtractMessage(string userPrompt)
        {
            const string marker = "Müşteri mesajı:";
            var idx = userPrompt.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
            return idx >= 0 ? userPrompt[(idx + marker.Length)..].Trim() : userPrompt;
        }

        private static string JsonEscape(string s) =>
            "\"" + s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "") + "\"";
    }
}
