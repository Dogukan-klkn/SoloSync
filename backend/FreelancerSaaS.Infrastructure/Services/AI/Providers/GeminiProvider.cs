using System.Text;
using System.Text.Json;
using FreelancerSaaS.Core.Configuration;
using FreelancerSaaS.Core.Interfaces;

namespace FreelancerSaaS.Infrastructure.Services.AI.Providers
{
    public class GeminiProvider : IAIProvider
    {
        private readonly HttpClient _http;
        private readonly GeminiProviderSettings _cfg;

        public GeminiProvider(HttpClient http, GeminiProviderSettings cfg)
        {
            _http = http;
            _cfg  = cfg;
        }

        public string Name => "Gemini";

        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(_cfg.ApiKey) && !string.IsNullOrWhiteSpace(_cfg.Model);

        public async Task<string> CompleteAsync(string systemPrompt, string userPrompt, CancellationToken ct = default)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_cfg.Model}:generateContent?key={_cfg.ApiKey}";

            var body = new
            {
                systemInstruction = new { parts = new[] { new { text = systemPrompt } } },
                contents = new[]
                {
                    new { role = "user", parts = new[] { new { text = userPrompt } } },
                },
                generationConfig = new
                {
                    temperature        = 0.2,
                    maxOutputTokens    = 800,
                    responseMimeType   = "application/json",
                },
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, url);
            req.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            var response = await _http.SendAsync(req, ct);
            var json     = await response.Content.ReadAsStringAsync(ct);
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"Gemini API hatası ({(int)response.StatusCode}): {json}");

            using var doc = JsonDocument.Parse(json);
            return doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? string.Empty;
        }
    }
}
