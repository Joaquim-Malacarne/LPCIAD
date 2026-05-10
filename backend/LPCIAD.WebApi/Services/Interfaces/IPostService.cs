using LPCIAD.WebApi.Dtos.Posts;
using Microsoft.AspNetCore.Http;

namespace LPCIAD.WebApi.Services;

public interface IPostService
{
    List<PostListItemResponse> GetAll();
    PostDetailResponse? GetById(int id, string? lang);
    (bool Success, int Id, string? Error) Create(
        string contentPt,
        string? contentEn,
        string? description,
        List<string>? tags,
        List<IFormFile> images);
    (bool Success, string? Error) Update(
        int id,
        string contentPt,
        string? contentEn,
        string? description,
        List<string>? tags,
        List<IFormFile> images);
    (bool Success, string? Error) ToggleActive(int id);
    (byte[]? File, string? ContentType) GetImage(int id, string imageName);
    void Delete(int id);
}