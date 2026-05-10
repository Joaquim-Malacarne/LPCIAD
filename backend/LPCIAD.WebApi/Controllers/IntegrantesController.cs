using LPCIAD.WebApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LPCIAD.WebApi.Controllers;

[ApiController]
[Route("Integrantes")]
public class IntegrantesController : ControllerBase
{
    private readonly IIntegrantesService _service;

    public IntegrantesController(IIntegrantesService service)
    {
        _service = service;
    }

    [HttpGet("Language/{lang}")]
    public IActionResult GetContent(string lang)
    {
        var content = _service.GetContent(lang);
        return Ok(content);
    }

    [HttpPut]
    [Authorize]
    [Consumes("multipart/form-data")]
    public IActionResult Update(
        [FromForm] string contentPt,
        [FromForm] string? contentEn,
        [FromForm] List<IFormFile> images)
    {
        var result = _service.Update(contentPt, contentEn, images);

        if (!result.Success)
            return BadRequest(result.Error);

        return Ok("Integrantes atualizado com sucesso");
    }

    [HttpGet("Image/{imageName}")]
    public IActionResult GetImage(string imageName)
    {
        var result = _service.GetImage(imageName);

        if (result.File == null)
            return NotFound("Imagem não encontrada");

        return File(result.File, result.ContentType!);
    }
}
