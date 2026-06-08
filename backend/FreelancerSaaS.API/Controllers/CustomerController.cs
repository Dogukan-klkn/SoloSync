using System.Security.Claims;
using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FreelancerSaaS.API.Controllers
{
    [ApiController]
    [Route("api/customers")]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _service;
        public CustomerController(ICustomerService service) => _service = service;

        // JWT'den gelen UserId — Veri izolasyonunun temel noktası
        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET api/customers?search=abc
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            // Service katmanı SADECE bu userId'ye ait müşterileri döner
            var result = await _service.GetCustomersAsync(GetUserId(), search);
            return Ok(result);
        }

        // GET api/customers/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetCustomerByIdAsync(id, GetUserId());
            // Service null döndürüyorsa ya kayıt yok ya da başkasına ait → 404
            return result is null ? NotFound(new { message = "Müşteri bulunamadı veya erişim yetkiniz yok." }) : Ok(result);
        }

        // POST api/customers — Sadece Freelancer oluşturabilir
        [HttpPost]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Create([FromBody] CreateCustomerRequest request)
        {
            try
            {
                var result = await _service.CreateCustomerAsync(request, GetUserId());
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (DbUpdateException)
            {
                return BadRequest(new
                {
                    statusCode = 400,
                    message    = "Girilen Müşteri Portal Kullanıcı ID sistemde kayıtlı bir kullanıcıya ait değil. Lütfen geçerli bir ID giriniz."
                });
            }
        }

        // PUT api/customers/{id} — Sadece Freelancer güncelleyebilir
        [HttpPut("{id:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerRequest request)
        {
            try
            {
                var result = await _service.UpdateCustomerAsync(id, request, GetUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (DbUpdateException)
            {
                return BadRequest(new
                {
                    statusCode = 400,
                    message    = "Girilen Müşteri Portal Kullanıcı ID sistemde kayıtlı bir kullanıcıya ait değil. Lütfen geçerli bir ID giriniz."
                });
            }
        }

        // DELETE api/customers/{id} — Sadece Freelancer silebilir
        [HttpDelete("{id:guid}")]
        [Authorize(Policy = "FreelancerOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _service.DeleteCustomerAsync(id, GetUserId());
                return NoContent();
            }
            catch (DbUpdateException)
            {
                // Restrict constraint — bu müşteriye bağlı aktif projeler var
                return Conflict(new
                {
                    statusCode = 409,
                    message    = "Bu müşteriye ait projeler mevcut olduğu için silinemez. Önce projeleri silin."
                });
            }
        }
    }
}
