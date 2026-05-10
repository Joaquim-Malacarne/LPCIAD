using LPCIAD.WebApi.Dtos.Integrantes;
using Microsoft.AspNetCore.Http;

namespace LPCIAD.WebApi.Services;

public interface IIntegrantesService
{
    IntegrantesContentResponse GetContent(string? lang);
    (bool Success, string? Error) Update(string contentPt, string? contentEn, List<IFormFile> images);
    (byte[]? File, string? ContentType) GetImage(string imageName);
}
