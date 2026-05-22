import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { marked } from 'marked';
import { POST_TAGS, TAG_COLORS } from '../../models/post-tag.model';
import { PostService } from '../../services/post';
import { PostDetailItem } from '../../models/post-detail.model';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-post.html',
  styleUrls: ['./add-post.css']
})
export class PostForm implements OnInit, OnDestroy {

  mode: Mode = 'create';
  postId: number | null = null;
  loadingPost: boolean = false;

  description: string = '';
  markdownPt: string = '';
  markdownEn: string = '';
  activeLang: 'pt' | 'en' = 'pt';
  isDragOver: boolean = false;
  saving: boolean = false;

  toastMessage: string = '';
  toastVisible: boolean = false;

  readonly availableTags = POST_TAGS;
  readonly tagColors = TAG_COLORS;
  selectedTags: string[] = [];

  @ViewChild('editorTextarea') private editorTextareaRef!: ElementRef<HTMLTextAreaElement>;

  private imageMap = new Map<string, File>();
  private blobUrls = new Map<string, string>();
  private editorFocused = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.mode = 'edit';
      this.postId = Number(idParam);
      this.loadPost(this.postId);
    }
  }

  ngOnDestroy(): void {
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls.clear();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  private loadPost(id: number): void {
    this.loadingPost = true;

    forkJoin({
      pt: this.postService.getById(id, 'pt'),
      en: this.postService.getById(id, 'en'),
    }).subscribe({
      next: ({ pt, en }: { pt: PostDetailItem; en: PostDetailItem }) => {
        this.markdownPt = pt.content ?? '';
        // Quando EN não existe, a API retorna o conteúdo PT como fallback.
        // Nesse caso, tratamos EN como vazio para não pré-preencher incorretamente.
        this.markdownEn = pt.content === en.content ? '' : (en.content ?? '');
        this.description = pt.description ?? '';
        this.selectedTags = [...(pt.tags ?? [])];
        this.loadingPost = false;
      },
      error: () => {
        this.showToast('Erro ao carregar o post para edição.');
        this.loadingPost = false;
      }
    });
  }

  get activeMarkdown(): string {
    return this.activeLang === 'pt' ? this.markdownPt : this.markdownEn;
  }

  set activeMarkdown(value: string) {
    if (this.activeLang === 'pt') {
      this.markdownPt = value;
    } else {
      this.markdownEn = value;
    }
  }

  get wordCount(): number {
    return this.activeMarkdown.trim() ? this.activeMarkdown.trim().split(/\s+/).length : 0;
  }

  get charCount(): number {
    return this.activeMarkdown.length;
  }

  get lineCount(): number {
    return this.activeMarkdown.split('\n').length;
  }

  get renderedMarkdown(): SafeHtml {
    const html = marked.parse(this.activeMarkdown) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  setLang(lang: 'pt' | 'en'): void {
    this.activeLang = lang;
  }

  toggleTag(tag: string): void {
    const idx = this.selectedTags.indexOf(tag);
    if (idx >= 0) {
      this.selectedTags.splice(idx, 1);
    } else {
      this.selectedTags.push(tag);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  onEditorFocus(): void { this.editorFocused = true; }
  onEditorBlur(): void  { this.editorFocused = false; }

  onBack(): void {
    this.router.navigate(['/admin/posts-dashboard']);
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    if (!this.editorFocused) return;
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        event.preventDefault();
        const file = items[i].getAsFile();
        if (file) this.insertImage(file);
        break;
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
    this.editorTextareaRef?.nativeElement.focus();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) this.insertImage(files[i]);
    }
  }

  private generateImageName(file: File): string {
    const ext = file.type.split('/')[1] ?? 'png';
    return `img-${crypto.randomUUID()}.${ext}`;
  }

  private insertImage(file: File): void {
    const name = this.generateImageName(file);
    const blobUrl = URL.createObjectURL(file);
    this.imageMap.set(name, file);
    this.blobUrls.set(name, blobUrl);

    const snippet = `\n![${name}](${blobUrl})\n`;
    const textarea = this.editorTextareaRef?.nativeElement;
    const start = textarea?.selectionStart ?? this.activeMarkdown.length;
    const end   = textarea?.selectionEnd   ?? start;

    this.activeMarkdown =
      this.activeMarkdown.substring(0, start) + snippet + this.activeMarkdown.substring(end);

    if (textarea) {
      const newPos = start + snippet.length;
      setTimeout(() => { textarea.focus(); textarea.setSelectionRange(newPos, newPos); }, 0);
    }
  }

  private fixMarkdown(md: string, postId: number): string {
    let result = md;
    this.imageMap.forEach((_, name) => {
      const blobUrl = this.blobUrls.get(name);
      if (!blobUrl) return;
      const realUrl = this.postService.getImageUrl(postId, name);
      result = result.replace(
        new RegExp(`!\\[${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\(blob:[^)]+\\)`, 'g'),
        `![${name}](${realUrl})`
      );
    });
    return result;
  }

  private cleanupBlobs(): void {
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls.clear();
    this.imageMap.clear();
  }

  private showToast(message: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => (this.toastVisible = false), 4000);
  }

  private extractError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (typeof err.error === 'string' && err.error.trim()) return err.error;
      return `Erro ${err.status}: ${err.statusText}`;
    }
    return 'Erro inesperado. Tente novamente.';
  }

  private navigateToDashboard(message: string): void {
    this.router.navigate(['/admin/posts-dashboard'], { state: { successMessage: message } });
  }

  onSave(): void {
    if (!isPlatformBrowser(this.platformId) || this.saving) return;
    this.saving = true;
    if (this.mode === 'create') {
      this.saveCreate();
    } else {
      this.saveEdit();
    }
  }

  private saveCreate(): void {
    const images = Array.from(this.imageMap.entries())
      .map(([name, file]) => new File([file], name, { type: file.type }));

    this.postService.create(this.markdownPt, this.markdownEn, this.description, this.selectedTags, images)
      .subscribe({
        next: (response: { id: number }) => {
          const postId = response.id;
          const fixedPt = this.fixMarkdown(this.markdownPt, postId);
          const fixedEn = this.fixMarkdown(this.markdownEn, postId);
          this.cleanupBlobs();

          this.postService.update(postId, fixedPt, fixedEn, this.description, this.selectedTags, [])
            .subscribe({
              next: () => this.navigateToDashboard('Post publicado com sucesso!'),
              error: (err: unknown) => { this.saving = false; this.showToast(this.extractError(err)); }
            });
        },
        error: (err: unknown) => { this.saving = false; this.showToast(this.extractError(err)); }
      });
  }

  private saveEdit(): void {
    const id = this.postId!;
    const hasNewImages = this.imageMap.size > 0;
    const newImages = Array.from(this.imageMap.entries())
      .map(([name, file]) => new File([file], name, { type: file.type }));

    // 1ª chamada: salva texto + envia novas imagens (imagens existentes são preservadas)
    this.postService.update(id, this.markdownPt, this.markdownEn, this.description, this.selectedTags, newImages)
      .subscribe({
        next: () => {
          if (hasNewImages) {
            // 2ª chamada: substitui blob URLs pelas URLs reais no markdown
            const fixedPt = this.fixMarkdown(this.markdownPt, id);
            const fixedEn = this.fixMarkdown(this.markdownEn, id);
            this.cleanupBlobs();

            this.postService.update(id, fixedPt, fixedEn, this.description, this.selectedTags, [])
              .subscribe({
                next: () => this.navigateToDashboard('Post atualizado com sucesso!'),
                error: (err: unknown) => { this.saving = false; this.showToast(this.extractError(err)); }
              });
          } else {
            this.navigateToDashboard('Post atualizado com sucesso!');
          }
        },
        error: (err: unknown) => { this.saving = false; this.showToast(this.extractError(err)); }
      });
  }

  // Nielsen #5 (Prevenção de erros): confirma antes de descartar conteúdo não vazio
  onClear(): void {
    const currentContent = this.activeLang === 'pt' ? this.markdownPt : this.markdownEn;

    if (currentContent.trim().length === 0) return;

    if (!isPlatformBrowser(this.platformId)) return;

    const langLabel = this.activeLang === 'pt' ? 'PT' : 'EN';
    const confirmed = window.confirm(
      `Deseja apagar todo o conteúdo do editor em ${langLabel}? Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    if (this.activeLang === 'pt') {
      this.markdownPt = '';
    } else {
      this.markdownEn = '';
    }
  }
}
