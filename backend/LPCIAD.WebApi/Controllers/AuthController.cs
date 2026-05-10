using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LPCIAD.WebApi.Dtos.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace LPCIAD.WebApi.Controllers;

// Para gerar um novo hash de senha: BCrypt.Net.BCrypt.HashPassword("suaSenha")
// A variável de ambiente JWT__Secret deve ter no mínimo 32 caracteres.

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
        var username = _configuration["Auth:Username"];
        var passwordHash = _configuration["Auth:PasswordHash"];

        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(passwordHash))
            return StatusCode(500, "Autenticação não configurada.");

        if (!string.Equals(request.Username, username, StringComparison.Ordinal))
            return Unauthorized("Credenciais inválidas.");

        bool valid;
        try
        {
            valid = BCrypt.Net.BCrypt.Verify(request.Password, passwordHash);
        }
        catch
        {
            return StatusCode(500, "Erro na configuração de autenticação.");
        }

        if (!valid)
            return Unauthorized("Credenciais inválidas.");

        return Ok(new { token = GenerateToken(username) });
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

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: [new Claim(ClaimTypes.Name, username)],
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
