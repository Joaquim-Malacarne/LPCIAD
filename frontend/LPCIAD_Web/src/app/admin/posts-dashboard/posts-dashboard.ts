import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostListItem } from '../../models/post.model';
import { PostService } from '../../services/post';

@Component({
  selector: 'app-posts-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './posts-dashboard.html',
  styleUrls: ['./posts-dashboard.css']
})
export class PostsDashboard implements OnInit {

  posts: PostListItem[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private postService: PostService) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;

    this.postService.getAll().subscribe({
      next: (data: PostListItem[]) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erro ao carregar os posts. Verifique se a API está rodando.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onEdit(post: PostListItem): void {
    console.log('Editar post:', post.id);
  }

  onDelete(post: PostListItem): void {
    console.log('Excluir post:', post.id);
  }

  onNewPost(): void {
    console.log('Novo post');
  }

  onToggleActive(post: PostListItem): void {
    post.isActive = !post.isActive;
  }
}