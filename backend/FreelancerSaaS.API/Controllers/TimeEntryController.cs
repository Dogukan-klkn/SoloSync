using System.Security.Claims;
using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelancerSaaS.API.Controllers
{
    [ApiController]
    [Route("api/time-entries")]
    [Authorize]
    public class TimeEntryController : ControllerBase
    {
        private readonly ITimeEntryService _service;

        public TimeEntryController(ITimeEntryService service) => _service = service;

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET /api/time-entries?projectTaskId=&from=&to=
        [HttpGet]
        public async Task<IActionResult> GetEntries(
            [FromQuery] Guid? projectTaskId,
            [FromQuery] string? from,
            [FromQuery] string? to)
        {
            var entries = await _service.GetEntriesAsync(GetUserId(), projectTaskId, from, to);
            return Ok(entries);
        }

        // GET /api/time-entries/running
        [HttpGet("running")]
        public async Task<IActionResult> GetRunning()
        {
            var entry = await _service.GetRunningEntryAsync(GetUserId());
            return entry == null ? NoContent() : Ok(entry);
        }

        // GET /api/time-entries/summary?from=&to=
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(
            [FromQuery] string? from,
            [FromQuery] string? to)
        {
            var summary = await _service.GetSummaryAsync(GetUserId(), from, to);
            return Ok(summary);
        }

        // POST /api/time-entries/start
        [HttpPost("start")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Start([FromBody] StartTimeEntryRequest request)
        {
            var entry = await _service.StartAsync(request, GetUserId());
            return CreatedAtAction(nameof(GetRunning), entry);
        }

        // POST /api/time-entries/{id}/stop
        [HttpPost("{id:guid}/stop")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Stop(Guid id, [FromBody] StopTimeEntryRequest request)
        {
            var entry = await _service.StopAsync(id, request, GetUserId());
            return Ok(entry);
        }

        // POST /api/time-entries/manual
        [HttpPost("manual")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> CreateManual([FromBody] CreateManualTimeEntryRequest request)
        {
            var entry = await _service.CreateManualAsync(request, GetUserId());
            return CreatedAtAction(nameof(GetEntries), entry);
        }

        // PUT /api/time-entries/{id}
        [HttpPut("{id:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTimeEntryRequest request)
        {
            var entry = await _service.UpdateAsync(id, request, GetUserId());
            return Ok(entry);
        }

        // DELETE /api/time-entries/{id}
        [HttpDelete("{id:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id, GetUserId());
            return NoContent();
        }
    }
}
