using System.Text;
using System.Text.Json;
using FreelancerSaaS.Core.Configuration;
using FreelancerSaaS.Core.Interfaces;

namespace FreelancerSaaS.Infrastructure.Services.AI.Providers
{
    public class AnthropicProvider : IAIProvider
    {
        private readonly HttpClient _http;
        private readonly AnthropicProviderSettings _cfg;

        public AnthropicProvider(HttpClient http, AnthropicProviderSettings cfg)
        {
            _http = http;
            _cfg  = cfg;
        }

        public string Name => "Anthropic";

        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(_cfg.ApiKey) && !string.IsNullOrWhiteSpace(_cfg.Model);

        public async Task<string> CompleteAsync(string systemPrompt, string userPrompt, CancellationToken ct = default)
        {
            var body = new
            {
                model      = _cfg.Model,
                max_tokens = 800,
                system     = systemPrompt,
                messages   = new[] { new { role = "user", content = userPrompt } },
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
            req.Headers.Add("x-api-key", _cfg.ApiKey);
            req.Headers.Add("anthropic-version", "2023-06-01");
            req.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            var response = await _http.SendAsync(req, ct);
            var json     = await response.Content.ReadAsStringAsync(ct);
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"Anthropic API hatası ({(int)response.StatusCode}): {json}");

            using var doc = JsonDocument.Parse(json);
            return doc.RootElement
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString() ?? string.Empty;
        }
    }
}
