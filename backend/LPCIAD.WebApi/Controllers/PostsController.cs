using LPCIAD.WebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LPCIAD.WebApi.Controllers;

[ApiController]
[Route("Posts")]
public class PostsController : ControllerBase
{
    private readonly IPostService _service;

    public PostsController(IPostService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_service.GetAll());
    }

    [HttpGet("{id:int}/Language/{lang}")]
    public IActionResult GetById(int id, string? lang)
    {
        var post = _service.GetById(id, lang);

        if (post == null)
            return NotFound("Post não encontrado");

        return Ok(post);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public IActionResult CreatePost(
        [FromForm] string contentPt,
        [FromForm] string? contentEn,
        [FromForm] string? description,
        [FromForm] List<string>? tags,
        [FromForm] List<IFormFile> images)
    {
        var result = _service.Create(contentPt, contentEn, description, tags, images);

        if (!result.Success)
            return BadRequest(result.Error);

        return Ok(new { id = result.Id });
    }

    [HttpPut("{id:int}")]
    [Consumes("multipart/form-data")]
    public IActionResult UpdatePost(
        int id,
        [FromForm] string contentPt,
        [FromForm] string? contentEn,
        [FromForm] string? description,
        [FromForm] List<string>? tags,
        [FromForm] List<IFormFile> images)
    {
        var result = _service.Update(id, contentPt, contentEn, description, tags, images);

        if (!result.Success)
            return BadRequest(result.Error);

        return Ok("Post atualizado com sucesso");
    }

    [HttpGet("{id:int}/Image/{imageName}")]
    public IActionResult GetPostImage(int id, string imageName)
    {
        var result = _service.GetImage(id, imageName);

        if (result.File == null)
            return NotFound("Imagem não encontrada");

        return File(result.File, result.ContentType!);
    }

    [HttpPatch("{id:int}/ToggleActive")]
    public IActionResult ToggleActive(int id)
    {
        var result = _service.ToggleActive(id);

        if (!result.Success)
            return BadRequest(result.Error);

        return Ok();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        _service.Delete(id);
        return NoContent();
    }
}