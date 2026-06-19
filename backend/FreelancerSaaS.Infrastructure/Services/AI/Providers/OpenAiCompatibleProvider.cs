using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FreelancerSaaS.Core.Configuration;
using FreelancerSaaS.Core.Interfaces;

namespace FreelancerSaaS.Infrastructure.Services.AI.Providers
{
    /// <summary>OpenAI uyumlu API (Groq, OpenAI, Ollama, Together, Mistral vb.).</summary>
    public class OpenAiCompatibleProvider : IAIProvider
    {
        private readonly HttpClient _http;
        private readonly OpenAiProviderSettings _cfg;
        private readonly bool _requireApiKey;

        public OpenAiCompatibleProvider(HttpClient http, string name, OpenAiProviderSettings cfg, bool requireApiKey = true)
        {
            _http           = http;
            Name            = name;
            _cfg            = cfg;
            _requireApiKey  = requireApiKey;
        }

        public string Name { get; }

        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(_cfg.Model) &&
            (!string.IsNullOrWhiteSpace(_cfg.ApiKey) || !_requireApiKey);

        public async Task<string> CompleteAsync(string systemPrompt, string userPrompt, CancellationToken ct = default)
        {
            var baseUrl = _cfg.BaseUrl.TrimEnd('/');
            var body = new
            {
                model    = _cfg.Model,
                messages = new object[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user",   content = userPrompt },
                },
                temperature = 0.2,
                max_tokens  = 800,
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/chat/completions");
            if (!string.IsNullOrWhiteSpace(_cfg.ApiKey))
                req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cfg.ApiKey);

            req.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            var response = await _http.SendAsync(req, ct);
            var json     = await response.Content.ReadAsStringAsync(ct);
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"{Name} API hatası ({(int)response.StatusCode}): {json}");

            using var doc = JsonDocument.Parse(json);
            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? string.Empty;
        }
    }
}
