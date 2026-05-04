using System.Text;
using System.Text.Json;
using FreelancerSaaS.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FreelancerSaaS.Infrastructure.Services
{
    public class AIService : IAIService
    {
        private readonly HttpClient _http;
        private readonly string? _apiKey;
        private readonly string _model;
        private readonly ILogger<AIService> _logger;

        public AIService(HttpClient http, IConfiguration config, ILogger<AIService> logger)
        {
            _http   = http;
            _logger = logger;
            _apiKey = config["AnthropicSettings:ApiKey"];
            _model  = config["AnthropicSettings:Model"] ?? "claude-haiku-4-5-20251001";
        }

        public async Task<string> SummarizeClientRequestAsync(string message)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                _logger.LogWarning("AnthropicSettings:ApiKey is not configured. Returning fallback summary.");
                return message[..Math.Min(300, message.Length)];
            }

            try
            {
                var prompt = $"Asagidaki musteri mesajini freelancer icin kisa, net, Turkce bir gorev aciklamasina (max 150 kelime) donustur. Sadece gorev aciklamasini yaz, baska bir sey yazma. Musteri mesaji: {message}";

                var body = new
                {
                    model    = _model,
                    max_tokens = 300,
                    messages = new[] { new { role = "user", content = prompt } }
                };

                using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
                req.Headers.Add("x-api-key", _apiKey);
                req.Headers.Add("anthropic-version", "2023-06-01");
                req.Content = new StringContent(
                    JsonSerializer.Serialize(body),
                    Encoding.UTF8,
                    "application/json");

                var response = await _http.SendAsync(req);
                var json     = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(json);
                var text = doc.RootElement
                    .GetProperty("content")[0]
                    .GetProperty("text")
                    .GetString();

                return text ?? message[..Math.Min(300, message.Length)];
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "AI summarization failed. Using fallback.");
                return message[..Math.Min(300, message.Length)];
            }
        }
    }
}
