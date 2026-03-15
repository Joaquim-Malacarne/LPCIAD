using LPCIAD.WebApi.Dtos.Posts;
using Microsoft.AspNetCore.Http;

namespace LPCIAD.WebApi.Services;

public interface IPostService
{
    List<PostListItemResponse> GetAll();
    PostDetailResponse? GetById(int id, string? lang);
    (bool Success, string? Error) Create(
        string contentPt,
        string? contentEn,
        string? description,
        List<IFormFile> images);
    (bool Success, string? Error) Update(
        int id,
        string contentPt,
        string? contentEn,
        string? description,
        List<IFormFile> images);
    (byte[]? File, string? ContentType) GetImage(int id, string imageName);
    void Delete(int id);
}