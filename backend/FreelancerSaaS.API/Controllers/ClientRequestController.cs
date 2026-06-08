using System.Security.Claims;
using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelancerSaaS.API.Controllers
{
    [ApiController]
    [Route("api/client-requests")]
    [Authorize]
    public class ClientRequestController : ControllerBase
    {
        private readonly IClientRequestService _service;
        public ClientRequestController(IClientRequestService service) => _service = service;

        private Guid UserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateClientRequestRequest req)
        {
            var result = await _service.CreateAsync(req, UserId());
            return Ok(result);
        }

        [HttpGet("all")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> ListAll([FromQuery] string? status)
        {
            var result = await _service.GetAllAsync(UserId(), status);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] Guid projectId, [FromQuery] string? status)
        {
            var result = await _service.GetByProjectAsync(projectId, UserId(), status);
            return Ok(result);
        }

        [HttpPatch("{id:guid}/review")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Review(Guid id, [FromBody] ReviewClientRequestRequest req)
        {
            var action = req.Action.ToLowerInvariant();
            if (action == "approve")
            {
                var result = await _service.ApproveAsync(id, req.Tags, UserId());
                return Ok(result);
            }
            else if (action == "reject")
            {
                var result = await _service.RejectAsync(id, UserId());
                return Ok(result);
            }
            return BadRequest(new { message = "Geçersiz eylem. 'approve' veya 'reject' kullanın." });
        }
    }
}
