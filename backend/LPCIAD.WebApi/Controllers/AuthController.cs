using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LPCIAD.WebApi.Dtos.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace LPCIAD.WebApi.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var users = _configuration.GetSection("Auth:Users").Get<List<AuthUserConfig>>();

        if (users is null || users.Count == 0)
            return StatusCode(500, "Autenticação não configurada.");

        var user = users.FirstOrDefault(u =>
            string.Equals(u.Username, request.Username, StringComparison.Ordinal));

        if (user is null)
            return Unauthorized("Credenciais inválidas.");

        bool valid;
        try
        {
            valid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch
        {
            return StatusCode(500, "Erro na configuração de autenticação.");
        }

        if (!valid)
            return Unauthorized("Credenciais inválidas.");

        return Ok(new { token = GenerateToken(user.Username) });
    }

    [HttpPost("refresh")]
    [Authorize]
    public IActionResult Refresh()
    {
        var username = User.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrEmpty(username))
            return Unauthorized();

        return Ok(new { token = GenerateToken(username) });
    }

    private string GenerateToken(string username)
    {
        var secret = _configuration["JWT:Secret"]
            ?? throw new InvalidOperationException("JWT:Secret (env: JWT__Secret) não configurado.");

        var hours = _configuration.GetValue<int>("JWT:ExpirationHours", 8);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: [new Claim(ClaimTypes.Name, username)],
            expires: DateTime.UtcNow.AddHours(hours),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
