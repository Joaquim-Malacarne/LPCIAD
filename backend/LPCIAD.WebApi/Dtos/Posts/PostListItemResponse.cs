namespace LPCIAD.WebApi.Dtos.Posts;

public class PostListItemResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public List<string> Images { get; set; } = new();
    public bool IsActive { get; set; }
}