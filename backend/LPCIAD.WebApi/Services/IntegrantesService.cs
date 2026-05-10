using LPCIAD.WebApi.Dtos.Integrantes;
using Microsoft.AspNetCore.Http;

namespace LPCIAD.WebApi.Services;

public class IntegrantesService : IIntegrantesService
{
    private readonly string _rootPath;
    private readonly string _ptPath;
    private readonly string _enPath;
    private readonly string _imagesFolder;

    public IntegrantesService()
    {
        _rootPath = Path.Combine(Directory.GetCurrentDirectory(), "Integrantes");
        _ptPath = Path.Combine(_rootPath, "pt.md");
        _enPath = Path.Combine(_rootPath, "en.md");
        _imagesFolder = Path.Combine(_rootPath, "images");
        EnsureInitialized();
    }

    public IntegrantesContentResponse GetContent(string? lang)
    {
        var contentPath = ResolveContentPath(lang);

        return new IntegrantesContentResponse
        {
            Content = contentPath != null && File.Exists(contentPath)
                ? File.ReadAllText(contentPath)
                : string.Empty,
            Images = GetImages()
        };
    }

    public (bool Success, string? Error) Update(string contentPt, string? contentEn, List<IFormFile> images)
    {
        File.WriteAllText(_ptPath, Normalize(contentPt));

        if (!string.IsNullOrWhiteSpace(contentEn))
            File.WriteAllText(_enPath, Normalize(contentEn));
        else if (File.Exists(_enPath))
            File.Delete(_enPath);

        // Appends new images without clearing existing ones
        foreach (var image in images)
        {
            var filePath = Path.Combine(_imagesFolder, image.FileName);
            using var stream = new FileStream(filePath, FileMode.Create);
            image.CopyTo(stream);
        }

        return (true, null);
    }

    public (byte[]? File, string? ContentType) GetImage(string imageName)
    {
        var path = Path.Combine(_imagesFolder, imageName);

        if (!File.Exists(path))
            return (null, null);

        return (File.ReadAllBytes(path), GetContentType(path));
    }

    private void EnsureInitialized()
    {
        Directory.CreateDirectory(_rootPath);
        Directory.CreateDirectory(_imagesFolder);

        if (!File.Exists(_ptPath))
            File.WriteAllText(_ptPath, string.Empty);
    }

    private string? ResolveContentPath(string? lang)
    {
        if (lang?.ToLower() == "en" && File.Exists(_enPath))
            return _enPath;

        return File.Exists(_ptPath) ? _ptPath : null;
    }

    private List<string> GetImages()
    {
        if (!Directory.Exists(_imagesFolder))
            return new();

        return Directory.GetFiles(_imagesFolder)
            .Select(Path.GetFileName)
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .ToList()!;
    }

    private static string Normalize(string content) =>
        content.Replace("\\r\\n", "\n").Replace("\\n", "\n");

    private static string GetContentType(string path) =>
        Path.GetExtension(path).ToLowerInvariant() switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
}
