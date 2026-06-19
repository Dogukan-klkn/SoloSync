using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Entities;
using FreelancerSaaS.Core.Interfaces;
using FreelancerSaaS.Infrastructure.Data;
using FreelancerSaaS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FreelancerSaaS.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                throw new ArgumentException("Bu e-posta zaten kayıtlı.");

            var user = new User
            {
                FirstName    = request.FirstName,
                LastName     = request.LastName,
                Email        = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role         = request.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return await GenerateAuthResponse(user);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("E-posta veya şifre hatalı.");

            if (!user.IsActive)
                throw new UnauthorizedAccessException("Hesabınız devre dışı bırakılmış.");

            return await GenerateAuthResponse(user);
        }

        public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.RefreshToken == request.RefreshToken &&
                u.RefreshTokenExpiryTime > DateTime.UtcNow);

            if (user == null)
                throw new UnauthorizedAccessException("Geçersiz veya süresi dolmuş refresh token.");

            return await GenerateAuthResponse(user);
        }

        public async Task<UserProfileResponse?> GetProfileAsync(Guid userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            return user == null ? null : MapProfile(user);
        }

        public async Task<UserProfileResponse> UpdateProfileAsync(Guid userId, UpdateUserProfileRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

            if (!string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase) &&
                await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != userId))
                throw new ArgumentException("Bu e-posta adresi başka bir hesap tarafından kullanılıyor.");

            user.FirstName          = request.FirstName.Trim();
            user.LastName           = request.LastName.Trim();
            user.Email              = request.Email.Trim();
            user.ProfilePictureUrl  = string.IsNullOrWhiteSpace(request.ProfilePictureUrl) ? null : request.ProfilePictureUrl.Trim();
            user.UpdatedAt          = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapProfile(user);
        }

        public async Task<VerifyInvitationCodeResponse> VerifyInvitationCodeAsync(VerifyInvitationCodeRequest request)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email.ToLower() == email);

            if (customer == null)
                throw new UnauthorizedAccessException("E-posta veya kod hatalı.");

            if (customer.IsInvitationAccepted || customer.ClientUserId != null)
                throw new ArgumentException("Bu davetiye zaten kullanılmış.");

            if (customer.InvitationSentAt == null ||
                DateTime.UtcNow - customer.InvitationSentAt.Value > TimeSpan.FromHours(24))
                throw new ArgumentException("Davetiye kodunun süresi dolmuş.");

            var expectedHash = CustomerService.HashOtp(request.Code.Trim());
            if (customer.InvitationToken != expectedHash)
                throw new UnauthorizedAccessException("E-posta veya kod hatalı.");

            // Geçici setup token üret (10 dk geçerli)
            var setupToken = GenerateSetupToken(customer.Id, customer.Email);

            return new VerifyInvitationCodeResponse
            {
                SetupToken   = setupToken,
                Email        = customer.Email,
                CompanyName  = customer.CompanyName,
            };
        }

        public async Task<AuthResponse> CompleteClientSetupAsync(CompleteClientSetupRequest request, string setupToken)
        {
            var (customerId, email) = ValidateSetupToken(setupToken);

            var customer = await _context.Customers.FindAsync(customerId)
                ?? throw new KeyNotFoundException("Müşteri bulunamadı.");

            if (customer.Email != email)
                throw new UnauthorizedAccessException("Geçersiz setup token.");

            if (customer.ClientUserId != null)
                throw new ArgumentException("Bu hesap zaten aktive edilmiş.");

            // Aynı email ile daha önce User oluşturulmuşsa (ör. müşteri silinip yeniden eklendiyse)
            // mevcut User'ı bu Customer'a bağla, şifresini ve adını güncelle.
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == customer.Email);
            User user;

            if (existingUser != null)
            {
                existingUser.FirstName    = request.FirstName.Trim();
                existingUser.LastName     = request.LastName.Trim();
                existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                existingUser.IsActive     = true;
                existingUser.UpdatedAt    = DateTime.UtcNow;
                user = existingUser;
            }
            else
            {
                user = new User
                {
                    FirstName    = request.FirstName.Trim(),
                    LastName     = request.LastName.Trim(),
                    Email        = customer.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    Role         = UserRole.Client,
                    IsActive     = true,
                };
                _context.Users.Add(user);
            }

            await _context.SaveChangesAsync();

            customer.ClientUserId         = user.Id;
            customer.IsInvitationAccepted = true;
            customer.UpdatedAt            = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GenerateAuthResponse(user);
        }

        private string GenerateSetupToken(Guid customerId, string email)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
            var creds       = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new("setup_customer_id", customerId.ToString()),
                new("setup_email", email),
                new("setup_pending", "true"),
            };

            var token = new JwtSecurityToken(
                issuer:            jwtSettings["Issuer"],
                audience:          jwtSettings["Audience"],
                claims:            claims,
                expires:           DateTime.UtcNow.AddMinutes(10),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private (Guid customerId, string email) ValidateSetupToken(string token)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));

            var handler = new JwtSecurityTokenHandler();
            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer           = true,
                ValidateAudience         = true,
                ValidateLifetime         = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer              = jwtSettings["Issuer"],
                ValidAudience            = jwtSettings["Audience"],
                IssuerSigningKey         = key,
                ClockSkew                = TimeSpan.Zero,
            }, out _);

            var customerIdClaim = principal.FindFirst("setup_customer_id")?.Value;
            var emailClaim      = principal.FindFirst("setup_email")?.Value;
            var isPending       = principal.FindFirst("setup_pending")?.Value == "true";

            if (!isPending || customerIdClaim == null || emailClaim == null)
                throw new UnauthorizedAccessException("Geçersiz setup token.");

            return (Guid.Parse(customerIdClaim), emailClaim);
        }

        private static UserProfileResponse MapProfile(User user) => new()
        {
            Id                 = user.Id,
            FirstName          = user.FirstName,
            LastName           = user.LastName,
            Email              = user.Email,
            Role               = user.Role.ToString(),
            ProfilePictureUrl  = user.ProfilePictureUrl,
        };

        // ─── Private Helpers ─────────────────────────────────

        private async Task<AuthResponse> GenerateAuthResponse(User user)
        {
            var accessToken  = GenerateAccessToken(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken           = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            user.UpdatedAt              = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                Id           = user.Id,
                AccessToken  = accessToken,
                RefreshToken = refreshToken,
                Email        = user.Email,
                FullName     = $"{user.FirstName} {user.LastName}",
                Role         = user.Role.ToString()
            };
        }

        private string GenerateAccessToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
            var creds       = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email,          user.Email),
                new(ClaimTypes.Role,           user.Role.ToString()),
                new(ClaimTypes.Name,           $"{user.FirstName} {user.LastName}")
            };

            var token = new JwtSecurityToken(
                issuer:            jwtSettings["Issuer"],
                audience:          jwtSettings["Audience"],
                claims:            claims,
                expires:           DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["TokenExpirationMins"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
        {
            var bytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }
    }
}
