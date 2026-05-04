using System.Security.Claims;
using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelancerSaaS.API.Controllers
{
    [ApiController]
    [Route("api/comments")]
    [Authorize]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _service;
        public CommentController(ICommentService service) => _service = service;

        private Guid UserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] Guid? projectTaskId, [FromQuery] Guid? invoiceId)
        {
            if (projectTaskId.HasValue)
                return Ok(await _service.GetByTaskAsync(projectTaskId.Value, UserId()));
            if (invoiceId.HasValue)
                return Ok(await _service.GetByInvoiceAsync(invoiceId.Value, UserId()));
            return BadRequest(new { message = "projectTaskId veya invoiceId gerekli." });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCommentRequest req)
        {
            var result = await _service.CreateAsync(req, UserId());
            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCommentRequest req)
        {
            var result = await _service.UpdateAsync(id, req, UserId());
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id, UserId());
            return NoContent();
        }
    }
}
