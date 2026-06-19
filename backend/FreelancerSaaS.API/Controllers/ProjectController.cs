using System.Security.Claims;
using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelancerSaaS.API.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _service;
        public ProjectController(IProjectService service) => _service = service;

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET api/projects?customerId=guid
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? customerId)
        {
            var result = await _service.GetProjectsAsync(GetUserId(), customerId);
            return Ok(result);
        }

        // GET api/projects/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetProjectByIdAsync(id, GetUserId());
            return result is null ? NotFound() : Ok(result);
        }

        // POST api/projects — Sadece Freelancer oluşturabilir
        [HttpPost]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
        {
            var result = await _service.CreateProjectAsync(request, GetUserId());
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // PUT api/projects/{id} — Sadece Freelancer güncelleyebilir
        [HttpPut("{id:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectRequest request)
        {
            var result = await _service.UpdateProjectAsync(id, request, GetUserId());
            return Ok(result);
        }

        // DELETE api/projects/{id} — Sadece Freelancer silebilir
        [HttpDelete("{id:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteProjectAsync(id, GetUserId());
            return NoContent();
        }

        // GET api/projects/{id}/milestones
        [HttpGet("{id:guid}/milestones")]
        public async Task<IActionResult> GetMilestones(Guid id)
        {
            var result = await _service.GetMilestonesAsync(id, GetUserId());
            return Ok(result);
        }

        // POST api/projects/milestones — Sadece Freelancer ekleyebilir
        [HttpPost("milestones")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> AddMilestone([FromBody] CreateMilestoneRequest request)
        {
            var result = await _service.AddMilestoneAsync(request, GetUserId());
            return Ok(result);
        }

        // PUT api/projects/milestones/{milestoneId}
        [HttpPut("milestones/{milestoneId:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> UpdateMilestone(Guid milestoneId, [FromBody] UpdateMilestoneRequest request)
        {
            var result = await _service.UpdateMilestoneAsync(milestoneId, request, GetUserId());
            return Ok(result);
        }

        // DELETE api/projects/milestones/{milestoneId}
        [HttpDelete("milestones/{milestoneId:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> DeleteMilestone(Guid milestoneId)
        {
            await _service.DeleteMilestoneAsync(milestoneId, GetUserId());
            return NoContent();
        }

        // GET api/projects/tasks/dashboard — Dashboard Task Board için tüm aktif görevler
        [HttpGet("tasks/dashboard")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> GetDashboardTasks()
        {
            var result = await _service.GetDashboardTasksAsync(GetUserId());
            return Ok(result);
        }

    }
}
