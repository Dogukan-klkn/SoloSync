namespace FreelancerSaaS.Core.Interfaces
{
    /// <summary>Alt seviye LLM sağlayıcı kontratı (OpenAI, Groq, Gemini, Claude, Ollama…).</summary>
    public interface IAIProvider
    {
        string Name { get; }
        bool IsConfigured { get; }
        Task<string> CompleteAsync(string systemPrompt, string userPrompt, CancellationToken ct = default);
    }
}
