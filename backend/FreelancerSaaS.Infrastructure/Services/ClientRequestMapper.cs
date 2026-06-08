using System.Text.Json;
using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Entities;

namespace FreelancerSaaS.Infrastructure.Services
{
    internal static class ClientRequestMapper
    {
        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy        = JsonNamingPolicy.CamelCase,
        };

        public static string BuildMetadataJson(ClientRequestAnalysisResult analysis) =>
            JsonSerializer.Serialize(new
            {
                taskItems   = analysis.TaskItems,
                tags        = analysis.Tags,
                provider    = analysis.Provider,
                isAiPowered = analysis.IsAiPowered,
            }, JsonOpts);

        public static ClientRequestResponse MapToResponse(ClientRequest r)
        {
            var resp = new ClientRequestResponse
            {
                Id               = r.Id,
                ProjectId        = r.ProjectId,
                ProjectName      = r.Project?.Name ?? string.Empty,
                CustomerId       = r.CustomerId,
                CustomerName     = r.Customer?.CompanyName ?? string.Empty,
                OriginalMessage  = r.OriginalMessage,
                SummarizedTodo   = r.SummarizedTodo,
                SuggestedPriority = r.SuggestedPriority,
                ClientPreview    = r.ClientPreview,
                Status           = r.Status.ToString(),
                StatusValue      = (int)r.Status,
                ApprovedTaskId   = r.ApprovedTaskId,
                RequestedAt      = r.RequestedAt,
                ReviewedAt       = r.ReviewedAt,
            };

            if (string.IsNullOrWhiteSpace(r.AiMetadataJson)) return resp;

            try
            {
                using var doc = JsonDocument.Parse(r.AiMetadataJson);
                var root = doc.RootElement;
                if (root.TryGetProperty("taskItems", out var items) && items.ValueKind == JsonValueKind.Array)
                    resp.AiTaskItems = items.EnumerateArray()
                        .Select(e => e.GetString() ?? string.Empty)
                        .Where(s => s.Length > 0).ToList();
                if (root.TryGetProperty("tags", out var tags) && tags.ValueKind == JsonValueKind.Array)
                    resp.AiTags = tags.EnumerateArray()
                        .Select(e => e.GetString() ?? string.Empty)
                        .Where(s => s.Length > 0).ToList();
                if (root.TryGetProperty("provider", out var prov))
                    resp.AiProvider = prov.GetString();
                if (root.TryGetProperty("isAiPowered", out var powered))
                    resp.IsAiPowered = powered.GetBoolean();
            }
            catch { /* eski kayıtlar */ }

            return resp;
        }

        public static ProjectTaskPriority MapPriority(string? priority) =>
            priority?.Trim().ToLowerInvariant() switch
            {
                "high" or "urgent" => ProjectTaskPriority.High,
                "low"              => ProjectTaskPriority.Low,
                _                  => ProjectTaskPriority.Medium,
            };

        private static readonly string[] TagColors =
            ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

        public static List<TagRequest> BuildApproveTags(ClientRequest request, List<TagRequest>? extra)
        {
            var labels = new List<string> { "musteri-istegi" };
            var resp   = MapToResponse(request);
            foreach (var t in resp.AiTags)
                if (!labels.Contains(t)) labels.Add(t);

            var all = labels.Select((label, i) => new TagRequest
            {
                Label = label,
                Color = TagColors[i % TagColors.Length],
            }).ToList();

            if (extra != null)
            {
                foreach (var t in extra)
                {
                    if (!all.Any(x => x.Label == t.Label))
                        all.Add(t);
                }
            }
            return all;
        }
    }
}
