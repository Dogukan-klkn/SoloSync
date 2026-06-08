namespace FreelancerSaaS.Core.Configuration
{
    /// <summary>
    /// Sağlayıcıdan bağımsız AI yapılandırması.
    /// Provider: Groq | Gemini | Anthropic | OpenAI | Ollama | Fallback
    /// </summary>
    public class AiSettings
    {
        /// <summary>Aktif sağlayıcı adı (büyük/küçük harf duyarsız).</summary>
        public string Provider { get; set; } = "Groq";

        /// <summary>AI başarısız olursa kural tabanlı yedek kullan.</summary>
        public bool FallbackOnError { get; set; } = true;

        public OpenAiProviderSettings Groq { get; set; } = new()
        {
            BaseUrl = "https://api.groq.com/openai/v1",
            Model   = "llama-3.3-70b-versatile",
        };

        public OpenAiProviderSettings OpenAI { get; set; } = new()
        {
            BaseUrl = "https://api.openai.com/v1",
            Model   = "gpt-4o-mini",
        };

        public OpenAiProviderSettings Ollama { get; set; } = new()
        {
            BaseUrl = "http://localhost:11434/v1",
            Model   = "llama3.2",
        };

        public GeminiProviderSettings Gemini { get; set; } = new()
        {
            Model = "gemini-2.0-flash",
        };

        public AnthropicProviderSettings Anthropic { get; set; } = new()
        {
            Model = "claude-haiku-4-5-20251001",
        };
    }

    public class OpenAiProviderSettings
    {
        public string ApiKey  { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://api.openai.com/v1";
        public string Model   { get; set; } = "gpt-4o-mini";
    }

    public class GeminiProviderSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model  { get; set; } = "gemini-2.0-flash";
    }

    public class AnthropicProviderSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model  { get; set; } = "claude-haiku-4-5-20251001";
    }
}
