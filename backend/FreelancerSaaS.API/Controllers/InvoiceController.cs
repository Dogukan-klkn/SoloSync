using System.Security.Claims;
using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelancerSaaS.API.Controllers
{
    [ApiController]
    [Route("api/invoices")]
    [Authorize]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceService _service;
        public InvoiceController(IInvoiceService service) => _service = service;

        private Guid UserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private string UserRole() => User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] string? status)
        {
            var result = await _service.GetInvoicesAsync(UserId(), status);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var result = await _service.GetByIdAsync(id, UserId());
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest req)
        {
            var result = await _service.CreateAsync(req, UserId());
            return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInvoiceRequest req)
        {
            var result = await _service.UpdateAsync(id, req, UserId());
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id, UserId());
            return NoContent();
        }

        [HttpPost("{id:guid}/items")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> AddItem(Guid id, [FromBody] InvoiceItemRequest req)
        {
            var result = await _service.AddItemAsync(id, req, UserId());
            return Ok(result);
        }

        [HttpDelete("{id:guid}/items/{itemId:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> RemoveItem(Guid id, Guid itemId)
        {
            var result = await _service.RemoveItemAsync(id, itemId, UserId());
            return Ok(result);
        }

        [HttpPost("{id:guid}/payments")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> AddPayment(Guid id, [FromBody] AddPaymentRequest req)
        {
            var result = await _service.AddPaymentAsync(id, req, UserId());
            return Ok(result);
        }

        [HttpPatch("{id:guid}/send")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Send(Guid id)
        {
            var result = await _service.SendInvoiceAsync(id, UserId());
            return Ok(result);
        }

        [HttpPatch("{id:guid}/client-action")]
        public async Task<IActionResult> ClientAction(Guid id, [FromBody] ClientActionRequest req)
        {
            var result = await _service.ClientActionAsync(id, req, UserId(), UserRole());
            return Ok(result);
        }
    }
}
