namespace FreelancerSaaS.Infrastructure.Services
{
    /// <summary>
    /// WIN1252/LATIN1 PostgreSQL veritabanlarında Türkçe/Unicode karakter kaynaklı
    /// FK/insert hatalarını önlemek için sistem üretimi metinleri güvenli hale getirir.
    /// </summary>
    internal static class LegacyDbText
    {
        public static string Sanitize(string? text)
        {
            if (string.IsNullOrEmpty(text)) return text ?? string.Empty;

            return text
                .Replace('…', '.')
                .Replace('İ', 'I').Replace('ı', 'i')
                .Replace('Ş', 'S').Replace('ş', 's')
                .Replace('Ğ', 'G').Replace('ğ', 'g')
                .Replace('Ü', 'U').Replace('ü', 'u')
                .Replace('Ö', 'O').Replace('ö', 'o')
                .Replace('Ç', 'C').Replace('ç', 'c');
        }
    }
}
