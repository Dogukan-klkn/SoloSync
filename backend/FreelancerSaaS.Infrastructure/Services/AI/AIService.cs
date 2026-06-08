using System.Text.Json;
using System.Text.Json.Serialization;
using FreelancerSaaS.Core.Configuration;
using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Interfaces;
using FreelancerSaaS.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FreelancerSaaS.Infrastructure.Services.AI
{
    public class AIService : IAIService
    {
        private readonly AIProviderFactory _factory;
        private readonly AiSettings _settings;
        private readonly ILogger<AIService> _logger;

        private const string SystemPrompt = """
            Sen bir freelancer proje yönetim asistanısın.
            Müşterinin serbest metin isteğini freelancer için net, aksiyon odaklı görev formatına dönüştürürsün.
            Yanıtını YALNIZCA geçerli JSON olarak ver; markdown veya açıklama ekleme.
            JSON şeması:
            {
              "summary": "max 150 kelime, freelancer'ın Kanban'da göreceği görev özeti",
              "priority": "High veya Medium veya Low",
              "clientPreview": "müşteriye gösterilecek 1-2 cümlelik anlayış özeti (Türkçe, samimi)",
              "taskItems": ["birden fazla ayrı iş varsa her biri için kısa madde, yoksa boş dizi"],
              "tags": ["küçük harf ASCII etiketler, Türkçe karakter kullanma, örn: tasarim, mobil, hata"]
            }
            """;

        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy        = JsonNamingPolicy.CamelCase,
            Converters                  = { new JsonStringEnumConverter() },
        };

        public AIService(AIProviderFactory factory, IOptions<AiSettings> settings, ILogger<AIService> logger)
        {
            _factory  = factory;
            _settings = settings.Value;
            _logger   = logger;
        }

        public async Task<ClientRequestAnalysisResult> AnalyzeClientRequestAsync(string message, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(message))
                return BuildFallback(message, "fallback");

            var userPrompt = $"Müşteri mesajı:\n{message}";

            if (!_factory.HasConfiguredProvider())
            {
                _logger.LogWarning("AI API anahtari yapilandirilmamis — fallback kullaniliyor");
                var fb = _factory.ResolveFallback();
                var raw = await fb.CompleteAsync(SystemPrompt, userPrompt, ct);
                return ParseOrFallback(raw, message, "fallback", isAi: false);
            }

            var primary = _factory.ResolvePrimary();
            try
            {
                if (primary.Name != "Fallback")
                {
                    _logger.LogInformation("AI analiz: {Provider} kullaniliyor", primary.Name);
                    var raw = await primary.CompleteAsync(SystemPrompt, userPrompt, ct);
                    return ParseOrFallback(raw, message, primary.Name, isAi: true);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "AI saglayici {Provider} basarisiz", primary.Name);
                if (!_settings.FallbackOnError) throw;
            }

            if (_settings.FallbackOnError)
            {
                var fb = _factory.ResolveFallback();
                var raw = await fb.CompleteAsync(SystemPrompt, userPrompt, ct);
                return ParseOrFallback(raw, message, "fallback", isAi: false);
            }

            return BuildFallback(message, primary.Name);
        }

        public async Task<string> SummarizeClientRequestAsync(string message)
        {
            var analysis = await AnalyzeClientRequestAsync(message);
            return analysis.Summary;
        }

        private ClientRequestAnalysisResult ParseOrFallback(string raw, string message, string provider, bool isAi)
        {
            try
            {
                var json = StripMarkdownFence(raw);
                var parsed = JsonSerializer.Deserialize<AiJsonPayload>(json, JsonOpts);
                if (parsed == null || string.IsNullOrWhiteSpace(parsed.Summary))
                    return BuildFallback(message, provider);

                return new ClientRequestAnalysisResult
                {
                    Summary       = LegacyDbText.Sanitize(TrimSummary(parsed.Summary)),
                    Priority      = NormalizePriority(parsed.Priority),
                    ClientPreview = LegacyDbText.Sanitize(string.IsNullOrWhiteSpace(parsed.ClientPreview)
                        ? TrimSummary(parsed.Summary)
                        : parsed.ClientPreview.Trim()),
                    TaskItems     = parsed.TaskItems?
                        .Where(t => !string.IsNullOrWhiteSpace(t))
                        .Select(t => LegacyDbText.Sanitize(t.Trim()))
                        .ToList() ?? [],
                    Tags          = SanitizeTags(parsed.Tags),
                    Provider      = provider.ToLowerInvariant(),
                    IsAiPowered   = isAi,
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "AI JSON ayrıştırma başarısız, fallback kullanılıyor");
                return BuildFallback(message, provider);
            }
        }

        private static ClientRequestAnalysisResult BuildFallback(string message, string provider)
        {
            var text = message ?? string.Empty;
            var summary = text.Length > 300 ? text[..300] + "..." : text;
            return new ClientRequestAnalysisResult
            {
                Summary       = summary,
                Priority      = "Medium",
                ClientPreview = "Isteginiz freelancer'iniza iletilecek.",
                TaskItems     = [],
                Tags          = ["musteri-istegi"],
                Provider      = provider.ToLowerInvariant(),
                IsAiPowered   = false,
            };
        }

        private static string StripMarkdownFence(string raw)
        {
            var s = raw.Trim();
            if (s.StartsWith("```"))
            {
                var end = s.IndexOf('\n');
                if (end > 0) s = s[(end + 1)..];
                if (s.EndsWith("```")) s = s[..^3];
            }
            return s.Trim();
        }

        private static string TrimSummary(string s) =>
            s.Length > 500 ? s[..500] : s;

        private static string NormalizePriority(string? p) =>
            p?.Trim().ToLowerInvariant() switch
            {
                "high" or "yüksek" or "urgent" => "High",
                "low"  or "düşük" or "dusuk"  => "Low",
                _                               => "Medium",
            };

        private static List<string> SanitizeTags(List<string>? tags)
        {
            var list = tags?
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim().ToLowerInvariant()
                    .Replace('ş', 's').Replace('ğ', 'g').Replace('ü', 'u')
                    .Replace('ö', 'o').Replace('ç', 'c').Replace('ı', 'i'))
                .Where(t => t.Length > 0)
                .Distinct()
                .Take(5)
                .ToList() ?? [];

            if (!list.Contains("musteri-istegi"))
                list.Insert(0, "musteri-istegi");
            return list;
        }

        private sealed class AiJsonPayload
        {
            public string       Summary       { get; set; } = string.Empty;
            public string?      Priority      { get; set; }
            public string?      ClientPreview { get; set; }
            public List<string> TaskItems     { get; set; } = [];
            public List<string> Tags          { get; set; } = [];
        }
    }
}
