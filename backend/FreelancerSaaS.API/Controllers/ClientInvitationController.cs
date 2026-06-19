using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelancerSaaS.API.Controllers
{
    [ApiController]
    [Route("api/client-invitation")]
    [AllowAnonymous]
    public class ClientInvitationController : ControllerBase
    {
        private readonly IAuthService _authService;

        public ClientInvitationController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>Email + OTP doğrula, geçici setup token döner.</summary>
        [HttpPost("verify-code")]
        public async Task<IActionResult> VerifyCode([FromBody] VerifyInvitationCodeRequest request)
        {
            var result = await _authService.VerifyInvitationCodeAsync(request);
            return Ok(result);
        }

        /// <summary>Ad, soyad, şifre ile hesabı tamamla. Setup token gerektirir.</summary>
        [HttpPost("complete-setup")]
        public async Task<IActionResult> CompleteSetup([FromBody] CompleteClientSetupRequest request)
        {
            var authHeader = Request.Headers.Authorization.ToString();
            if (!authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return Unauthorized(new { message = "Setup token gerekli." });

            var setupToken = authHeader["Bearer ".Length..].Trim();
            var result = await _authService.CompleteClientSetupAsync(request, setupToken);
            return Ok(result);
        }
    }
}
