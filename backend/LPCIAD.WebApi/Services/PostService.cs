using LPCIAD.WebApi.Dtos.Posts;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace LPCIAD.WebApi.Services;

public class PostService : IPostService
{
    private readonly string _rootPath;

    public PostService()
    {
        _rootPath = Path.Combine(Directory.GetCurrentDirectory(), "Posts");
    }

    public List<PostListItemResponse> GetAll()
    {
        if (!Directory.Exists(_rootPath))
            return new();

        return Directory.GetDirectories(_rootPath)
            .Select(dir =>
            {
                if (!int.TryParse(Path.GetFileName(dir), out var id))
                    return null;

                var ptPath = GetPtPath(id);
                if (!System.IO.File.Exists(ptPath))
                    return null;

                var metadata = ReadMetadata(id, ptPath);

                return new PostListItemResponse
                {
                    Id = id,
                    Title = ExtractTitle(System.IO.File.ReadAllText(ptPath), id),
                    Description = metadata.Description,
                    Date = metadata.CreatedAt,
                    UpdatedAt = metadata.UpdatedAt,
                    Images = GetImages(id),
                    IsActive = metadata.IsActive,
                    Tags = metadata.Tags
                };
            })
            .Where(p => p != null)
            .OrderByDescending(p => p!.Date)
            .ToList()!;
    }

    public PostDetailResponse? GetById(int id, string? lang)
    {
        var folder = GetPostFolder(id);
        if (!Directory.Exists(folder))
            return null;

        var contentPath = ResolveContentPath(id, lang);
        if (contentPath == null)
            return null;

        var content = System.IO.File.ReadAllText(contentPath);
        var metadata = ReadMetadata(id, contentPath);

        return new PostDetailResponse
        {
            Id = id,
            Date = metadata.CreatedAt,
            Content = content,
            Description = metadata.Description,
            Images = GetImages(id),
            Tags = metadata.Tags
        };
    }

    public (bool Success, int Id, string? Error) Create(
        string contentPt,
        string? contentEn,
        string? description,
        List<string>? tags,
        List<IFormFile> images)
    {
        if (string.IsNullOrWhiteSpace(contentPt))
            return (false, 0, "Conteúdo em português é obrigatório");

        EnsureRoot();

        var id = GetNextId();
        SavePost(id, contentPt, contentEn, description, tags, images, DateTime.UtcNow, isNew: true, isActive: true);

        return (true, id, null);
    }

    public (bool Success, string? Error) Update(
        int id,
        string contentPt,
        string? contentEn,
        string? description,
        List<string>? tags,
        List<IFormFile> images)
    {
        if (string.IsNullOrWhiteSpace(contentPt))
            return (false, "Conteúdo em português é obrigatório");

        if (!Directory.Exists(GetPostFolder(id)))
            return (false, "Post não encontrado");

        var metadata = ReadMetadata(id, GetPtPath(id));
        SavePost(id, contentPt, contentEn, description, tags, images, metadata.CreatedAt, isNew: false, isActive: metadata.IsActive);

        return (true, null);
    }

    public (bool Success, string? Error) ToggleActive(int id)
    {
        if (!Directory.Exists(GetPostFolder(id)))
            return (false, "Post não encontrado");

        var metadata = ReadMetadata(id, GetPtPath(id));
        WriteMetadata(id, metadata.Description, metadata.Tags, metadata.CreatedAt, !metadata.IsActive);

        return (true, null);
    }

    public (byte[]? File, string? ContentType) GetImage(int id, string imageName)
    {
        var path = Path.Combine(GetPostFolder(id), "images", imageName);

        if (!System.IO.File.Exists(path))
            return (null, null);

        return (System.IO.File.ReadAllBytes(path), GetContentType(path));
    }

    public void Delete(int id)
    {
        var folder = GetPostFolder(id);
        if (!Directory.Exists(folder))
            throw new Exception("Post não encontrado");

        var metadata = ReadMetadata(id, GetPtPath(id));
        WriteMetadata(id, metadata.Description, metadata.Tags, metadata.CreatedAt, false);
    }

    private void SavePost(
        int id,
        string contentPt,
        string? contentEn,
        string? description,
        List<string>? tags,
        List<IFormFile> images,
        DateTime createdAt,
        bool isNew,
        bool isActive)
    {
        var folder = GetPostFolder(id);
        var imagesFolder = Path.Combine(folder, "images");

        Directory.CreateDirectory(folder);
        Directory.CreateDirectory(imagesFolder);

        System.IO.File.WriteAllText(GetPtPath(id), Normalize(contentPt));

        var enPath = GetEnPath(id);
        if (!string.IsNullOrWhiteSpace(contentEn))
            System.IO.File.WriteAllText(enPath, Normalize(contentEn));
        else if (System.IO.File.Exists(enPath))
            System.IO.File.Delete(enPath);

        WriteMetadata(id, description, tags, createdAt, isActive);

        foreach (var image in images)
        {
            var filePath = Path.Combine(imagesFolder, image.FileName);
            using var stream = new FileStream(filePath, FileMode.Create);
            image.CopyTo(stream);
        }
    }

    private void EnsureRoot()
    {
        if (!Directory.Exists(_rootPath))
            Directory.CreateDirectory(_rootPath);
    }

    private int GetNextId()
    {
        var ids = Directory.GetDirectories(_rootPath)
            .Select(d => int.Parse(Path.GetFileName(d)))
            .ToList();

        return ids.Count == 0 ? 1 : ids.Max() + 1;
    }

    private string GetPostFolder(int id) =>
        Path.Combine(_rootPath, id.ToString());

    private string GetPtPath(int id) =>
        Path.Combine(GetPostFolder(id), "pt.md");

    private string GetEnPath(int id) =>
        Path.Combine(GetPostFolder(id), "en.md");

    private string? ResolveContentPath(int id, string? lang)
    {
        if (lang?.ToLower() == "en" && System.IO.File.Exists(GetEnPath(id)))
            return GetEnPath(id);

        if (System.IO.File.Exists(GetPtPath(id)))
            return GetPtPath(id);

        return null;
    }

    private (DateTime CreatedAt, DateTime UpdatedAt, string? Description, bool IsActive, List<string> Tags) ReadMetadata(int id, string fallbackPath)
    {
        var path = Path.Combine(GetPostFolder(id), "metadata.json");

        // updatedAt = last time metadata.json was written (any save, update or toggle resets it)
        var updatedAt = System.IO.File.Exists(path)
            ? System.IO.File.GetLastWriteTimeUtc(path)
            : System.IO.File.GetCreationTimeUtc(fallbackPath);

        if (!System.IO.File.Exists(path))
            return (System.IO.File.GetCreationTimeUtc(fallbackPath), updatedAt, null, true, new());

        try
        {
            var text = System.IO.File.ReadAllText(path);
            using var doc = JsonDocument.Parse(text);

            var createdAt = doc.RootElement.TryGetProperty("createdAt", out var c)
                && DateTime.TryParse(c.GetString(), out var parsed)
                ? parsed
                : System.IO.File.GetCreationTimeUtc(fallbackPath);

            var description = doc.RootElement.TryGetProperty("description", out var d)
                ? d.GetString()
                : null;

            var isActive = doc.RootElement.TryGetProperty("isActive", out var a)
                ? a.GetBoolean()
                : true;

            var tags = doc.RootElement.TryGetProperty("tags", out var t) && t.ValueKind == JsonValueKind.Array
                ? t.EnumerateArray().Select(e => e.GetString()!).Where(s => s != null).ToList()
                : new List<string>();

            return (createdAt, updatedAt, description, isActive, tags);
        }
        catch
        {
            return (System.IO.File.GetCreationTimeUtc(fallbackPath), updatedAt, null, true, new());
        }
    }

    private void WriteMetadata(int id, string? description, List<string>? tags, DateTime createdAt, bool isActive)
    {
        var metadata = new { description, createdAt, isActive, tags = tags ?? new List<string>() };

        System.IO.File.WriteAllText(
            Path.Combine(GetPostFolder(id), "metadata.json"),
            JsonSerializer.Serialize(metadata));
    }

    private List<string> GetImages(int id)
    {
        var folder = Path.Combine(GetPostFolder(id), "images");

        if (!Directory.Exists(folder))
            return new();

        return Directory.GetFiles(folder)
            .Select(Path.GetFileName)
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .ToList()!;
    }

    private string ExtractTitle(string content, int id)
    {
        var trimmed = content.TrimStart();

        if (trimmed.StartsWith("# "))
        {
            var afterHash = trimmed.Substring(2);
            var breakIndex = afterHash.IndexOf('\n');
            return breakIndex > 0
                ? afterHash.Substring(0, breakIndex).Trim()
                : afterHash.Trim();
        }

        return $"Post {id}";
    }

    private string Normalize(string content) =>
        content.Replace("\\r\\n", "\n").Replace("\\n", "\n");

    private void ClearDirectory(string folder)
    {
        if (!Directory.Exists(folder))
            return;

        foreach (var file in Directory.GetFiles(folder))
            System.IO.File.Delete(file);
    }

    private string GetContentType(string path)
    {
        return Path.GetExtension(path).ToLowerInvariant() switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }
}
