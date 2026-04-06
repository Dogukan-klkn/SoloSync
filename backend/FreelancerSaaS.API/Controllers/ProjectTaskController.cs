using System.Security.Claims;
using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelancerSaaS.API.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class ProjectTaskController : ControllerBase
    {
        private readonly IProjectTaskService _service;
        public ProjectTaskController(IProjectTaskService service) => _service = service;

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET api/tasks?projectId=guid
        [HttpGet]
        public async Task<IActionResult> GetByProject([FromQuery] Guid projectId)
        {
            var result = await _service.GetTasksByProjectAsync(projectId, GetUserId());
            return Ok(result);
        }

        // GET api/tasks/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetTaskByIdAsync(id, GetUserId());
            return result is null ? NotFound(new { message = "Görev bulunamadı." }) : Ok(result);
        }

        // POST api/tasks — Sadece Freelancer
        [HttpPost]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Create([FromBody] CreateProjectTaskRequest request)
        {
            var result = await _service.CreateTaskAsync(request, GetUserId());
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // PUT api/tasks/{id} — Sadece Freelancer
        [HttpPut("{id:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectTaskRequest request)
        {
            var result = await _service.UpdateTaskAsync(id, request, GetUserId());
            return Ok(result);
        }

        // DELETE api/tasks/{id} — Sadece Freelancer
        [HttpDelete("{id:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteTaskAsync(id, GetUserId());
            return NoContent();
        }

        // PATCH api/tasks/reorder — Kanban sürükle-bırak sonrası toplu güncelleme
        [HttpPatch("reorder")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Reorder([FromBody] List<ReorderTaskRequest> items)
        {
            var result = await _service.ReorderTasksAsync(items, GetUserId());
            return Ok(result);
        }
    }
}
