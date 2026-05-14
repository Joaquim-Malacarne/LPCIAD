import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PostListItem } from '../../models/post.model';
import { PostService } from '../../services/post';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-posts-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './posts-dashboard.html',
  styleUrls: ['./posts-dashboard.css']
})
export class PostsDashboard implements OnInit, OnDestroy {

  posts: PostListItem[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Nielsen #1 (Visibilidade): posts em processamento ficam em estado visual distinto
  togglingIds = new Set<number>();

  // Nielsen #3 (Prevenção de erros): post aguardando confirmação do modal
  confirmPost: PostListItem | null = null;

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible: boolean = false;
  // Nielsen #2 (Controle e liberdade): ação a executar se o usuário clicar "Desfazer"
  undoAction: (() => void) | null = null;

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  lang$ = inject(LanguageService).currentLang$;

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

  showToast(message: string, type: 'success' | 'error' = 'success', undoFn?: () => void): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.undoAction = undoFn ?? null;
    // Toasts com undo ficam 5s; sem undo, 4s
    const duration = undoFn ? 5000 : 4000;
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
      this.undoAction = null;
    }, duration);
  }

  // Nielsen #2: executa o undo e fecha o toast imediatamente
  executeUndo(): void {
    const fn = this.undoAction;
    this.undoAction = null;
    this.toastVisible = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    fn?.();
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
    this.router.navigate(['/admin/edit-post', post.id]);
  }

  onDelete(post: PostListItem): void {
    console.log('Excluir post:', post.id);
  }

  onNewPost(): void {
    this.router.navigate(['/admin/add-post']);
  }

  // Nielsen #3: abre modal de confirmação em vez de agir imediatamente
  onToggleActive(post: PostListItem): void {
    this.confirmPost = post;
  }

  // Chamado quando o admin confirma no modal
  confirmToggle(): void {
    const post = this.confirmPost;
    this.confirmPost = null;
    if (!post) return;

    const prevIsActive = post.isActive;

    // Nielsen #1: feedback visual imediato — botão entra em estado "salvando"
    this.togglingIds.add(post.id);

    this.postService.toggleActive(post.id).subscribe({
      next: () => {
        post.isActive = !post.isActive;
        this.togglingIds.delete(post.id);
        const acao = post.isActive ? 'ativado' : 'desativado';

        // Nielsen #2: toast com "Desfazer" disponível por 5s
        this.showToast(`Post "${post.title}" ${acao}.`, 'success', () => {
          this.togglingIds.add(post.id);
          this.postService.toggleActive(post.id).subscribe({
            next: () => {
              post.isActive = prevIsActive;
              this.togglingIds.delete(post.id);
              this.showToast('Ação desfeita com sucesso.', 'success');
            },
            error: (err: unknown) => {
              this.togglingIds.delete(post.id);
              const msg = err instanceof HttpErrorResponse && typeof err.error === 'string'
                ? err.error
                : 'Erro ao desfazer.';
              this.showToast(msg, 'error');
            }
          });
        });
      },
      error: (err: unknown) => {
        this.togglingIds.delete(post.id);
        const msg = err instanceof HttpErrorResponse && typeof err.error === 'string'
          ? err.error
          : 'Erro ao alterar o status do post.';
        this.showToast(msg, 'error');
      }
    });
  }

  // Nielsen #2 (Controle e liberdade): cancela sem consequências
  cancelToggle(): void {
    this.confirmPost = null;
  }

  // Nielsen #4 (Reconhecimento): só exibe "modificado" se diferente do dia de criação
  isModified(post: PostListItem): boolean {
    if (!post.updatedAt) return false;
    return post.date.slice(0, 10) !== post.updatedAt.slice(0, 10);
  }
}
