import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PostListItem } from '../../models/post.model';
import { PostService } from '../../services/post';

@Component({
  selector: 'app-posts-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './posts-dashboard.html',
  styleUrls: ['./posts-dashboard.css']
})
export class PostsDashboard implements OnInit, OnDestroy {

  posts: PostListItem[] = [];
  loading: boolean = false;
  error: string | null = null;

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible: boolean = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private postService: PostService, private router: Router) {}

  ngOnInit(): void {
    this.loadPosts();

    const state = history.state as { successMessage?: string };
    if (state?.successMessage) {
      this.showToast(state.successMessage, 'success');
    }
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => (this.toastVisible = false), 4000);
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;

    this.postService.getAll().subscribe({
      next: (data: PostListItem[]) => {
        this.posts = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar os posts. Verifique se a API está rodando.';
        this.loading = false;
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
    this.router.navigate(['/admin/add-post']);
  }

  onToggleActive(post: PostListItem): void {
    this.postService.toggleActive(post.id).subscribe({
      next: () => {
        post.isActive = !post.isActive;
      },
      error: (err: unknown) => {
        const msg = err instanceof HttpErrorResponse && typeof err.error === 'string'
          ? err.error
          : 'Erro ao alterar o status do post.';
        this.showToast(msg, 'error');
      }
    });
  }
}
