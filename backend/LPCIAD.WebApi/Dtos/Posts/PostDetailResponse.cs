namespace LPCIAD.WebApi.Dtos.Posts;

public class PostDetailResponse
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string Content { get; set; } = String.Empty;
    public List<string> Images { get; set; } = new();
}