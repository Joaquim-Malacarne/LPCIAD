namespace LPCIAD.WebApi.Dtos.Posts;

public class PostDetailResponse
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string> Images { get; set; } = new();
    public List<string> Tags { get; set; } = new();
}