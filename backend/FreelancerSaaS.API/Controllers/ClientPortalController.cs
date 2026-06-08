using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FreelancerSaaS.API.Controllers
{
    [ApiController]
    [Route("api/client-portal")]
    [Authorize]
    public class ClientPortalController : ControllerBase
    {
        private readonly IClientPortalService _service;

        public ClientPortalController(IClientPortalService service)
        {
            _service = service;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET api/client-portal/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var result = await _service.GetMyProfileAsync(GetUserId());
            return result == null ? NotFound("Müşteri profili bulunamadı.") : Ok(result);
        }

        // PUT api/client-portal/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateClientProfileRequest request)
        {
            try
            {
                var result = await _service.UpdateMyProfileAsync(GetUserId(), request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // GET api/client-portal/projects
        [HttpGet("projects")]
        public async Task<IActionResult> GetMyProjects()
        {
            var result = await _service.GetMyProjectsAsync(GetUserId());
            return Ok(result);
        }

        // GET api/client-portal/projects/{id}
        [HttpGet("projects/{id:guid}")]
        public async Task<IActionResult> GetMyProject(Guid id)
        {
            var result = await _service.GetMyProjectByIdAsync(id, GetUserId());
            return result == null ? NotFound() : Ok(result);
        }

        // GET api/client-portal/projects/{id}/milestones
        [HttpGet("projects/{id:guid}/milestones")]
        public async Task<IActionResult> GetMyMilestones(Guid id)
        {
            var result = await _service.GetMyMilestonesAsync(id, GetUserId());
            return Ok(result);
        }

        // GET api/client-portal/projects/{id}/tasks
        [HttpGet("projects/{id:guid}/tasks")]
        public async Task<IActionResult> GetMyTasks(Guid id)
        {
            var result = await _service.GetMyTasksAsync(id, GetUserId());
            return Ok(result);
        }

        // GET api/client-portal/invoices
        [HttpGet("invoices")]
        public async Task<IActionResult> GetMyInvoices([FromQuery] string? status = null)
        {
            var result = await _service.GetMyInvoicesAsync(GetUserId(), status);
            return Ok(result);
        }

        // GET api/client-portal/invoices/{id}
        [HttpGet("invoices/{id:guid}")]
        public async Task<IActionResult> GetMyInvoice(Guid id)
        {
            var result = await _service.GetMyInvoiceByIdAsync(id, GetUserId());
            return result == null ? NotFound() : Ok(result);
        }

        // PATCH api/client-portal/invoices/{id}/action
        [HttpPatch("invoices/{id:guid}/action")]
        public async Task<IActionResult> InvoiceAction(Guid id, [FromBody] ClientActionRequest request)
        {
            try
            {
                var result = await _service.ClientInvoiceActionAsync(id, request, GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
        }

        // POST api/client-portal/projects/{id}/requests
        [HttpPost("projects/{id:guid}/requests")]
        public async Task<IActionResult> SendRequest(Guid id, [FromBody] CreateClientRequestRequest request)
        {
            request.ProjectId = id;
            try
            {
                var result = await _service.SendRequestAsync(request, GetUserId());
                return Created(string.Empty, result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        // GET api/client-portal/projects/{id}/requests
        [HttpGet("projects/{id:guid}/requests")]
        public async Task<IActionResult> GetMyRequests(Guid id)
        {
            var result = await _service.GetMyRequestsAsync(id, GetUserId());
            return Ok(result);
        }

        // POST api/client-portal/projects/{id}/requests/preview — göndermeden AI önizleme
        [HttpPost("projects/{id:guid}/requests/preview")]
        public async Task<IActionResult> PreviewRequest(Guid id, [FromBody] PreviewClientRequestRequest request)
        {
            try
            {
                var result = await _service.PreviewRequestAsync(request.Message, id, GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }
    }
}
