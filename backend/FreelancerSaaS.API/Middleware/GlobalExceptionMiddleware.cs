using System.Net;
using System.Text.Json;

namespace FreelancerSaaS.API.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var statusCode = exception switch
            {
                UnauthorizedAccessException => HttpStatusCode.Unauthorized,
                ArgumentException           => HttpStatusCode.BadRequest,
                KeyNotFoundException        => HttpStatusCode.NotFound,
                _                           => HttpStatusCode.InternalServerError
            };

            var response = new
            {
                StatusCode = (int)statusCode,
                Message    = exception.Message,
                Details    = exception.InnerException?.Message
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode  = (int)statusCode;

            return context.Response.WriteAsync(
                JsonSerializer.Serialize(response, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                })
            );
        }
    }
}
