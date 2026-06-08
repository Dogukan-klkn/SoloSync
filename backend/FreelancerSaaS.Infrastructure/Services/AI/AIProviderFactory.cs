using FreelancerSaaS.Core.Configuration;
using FreelancerSaaS.Core.Interfaces;
using FreelancerSaaS.Infrastructure.Services.AI.Providers;
using Microsoft.Extensions.Options;

namespace FreelancerSaaS.Infrastructure.Services.AI
{
    public class AIProviderFactory
    {
        private readonly IHttpClientFactory _httpFactory;
        private readonly AiSettings _settings;

        public AIProviderFactory(IHttpClientFactory httpFactory, IOptions<AiSettings> settings)
        {
            _httpFactory = httpFactory;
            _settings    = settings.Value;
        }

        public IAIProvider ResolvePrimary()
        {
            var name = (_settings.Provider ?? "Groq").Trim();
            var provider = CreateByName(name);
            if (provider.IsConfigured) return provider;

            // Yapılandırılmış ilk sağlayıcıyı dene
            foreach (var candidate in new[] { "Groq", "Gemini", "Anthropic", "OpenAI", "Ollama" })
            {
                if (candidate.Equals(name, StringComparison.OrdinalIgnoreCase)) continue;
                var p = CreateByName(candidate);
                if (p.IsConfigured) return p;
            }

            return ResolveFallback();
        }

        public bool HasConfiguredProvider()
        {
            foreach (var candidate in new[] { _settings.Provider, "Groq", "Gemini", "Anthropic", "OpenAI", "Ollama" })
            {
                if (string.IsNullOrWhiteSpace(candidate)) continue;
                if (CreateByName(candidate).IsConfigured) return true;
            }
            return false;
        }

        public IAIProvider ResolveFallback() => new FallbackProvider();

        private IAIProvider CreateByName(string name) => name.ToLowerInvariant() switch
        {
            "groq"      => new OpenAiCompatibleProvider(Http("groq"), "Groq", _settings.Groq),
            "openai"    => new OpenAiCompatibleProvider(Http("openai"), "OpenAI", _settings.OpenAI),
            "ollama"    => new OpenAiCompatibleProvider(Http("ollama"), "Ollama", _settings.Ollama, requireApiKey: false),
            "gemini"    => new GeminiProvider(Http("gemini"), _settings.Gemini),
            "anthropic" => new AnthropicProvider(Http("anthropic"), _settings.Anthropic),
            "fallback"  => new FallbackProvider(),
            _           => new OpenAiCompatibleProvider(Http("groq"), "Groq", _settings.Groq),
        };

        private HttpClient Http(string name) => _httpFactory.CreateClient($"ai-{name}");
    }
}
