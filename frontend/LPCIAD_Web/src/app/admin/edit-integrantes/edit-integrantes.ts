import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, HostListener, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { marked } from 'marked';
import { IntegrantesService } from '../../services/integrantes';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-edit-integrantes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './edit-integrantes.html',
  styleUrls: ['./edit-integrantes.css']
})
export class EditIntegrantes implements OnInit, OnDestroy {

  markdownPt = '';
  markdownEn = '';
  activeLang: 'pt' | 'en' = 'pt';
  isDragOver = false;
  loading = true;
  saving = false;

  toastMessage = '';
  toastVisible = false;
  toastSuccess = false;

  lang$ = inject(LanguageService).currentLang$;

  @ViewChild('editorTextarea') private editorTextareaRef!: ElementRef<HTMLTextAreaElement>;

  private imageMap = new Map<string, File>();
  private blobUrls = new Map<string, string>();
  private editorFocused = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private integrantesService: IntegrantesService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    this.integrantesService.getContent('pt').subscribe({
      next: (data) => {
        this.markdownPt = data.content;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.integrantesService.getContent('en').subscribe({
      next: (data) => { this.markdownEn = data.content; },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls.clear();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  get activeMarkdown(): string {
    return this.activeLang === 'pt' ? this.markdownPt : this.markdownEn;
  }

  set activeMarkdown(value: string) {
    if (this.activeLang === 'pt') this.markdownPt = value;
    else this.markdownEn = value;
  }

  get wordCount(): number {
    return this.activeMarkdown.trim() ? this.activeMarkdown.trim().split(/\s+/).length : 0;
  }

  get charCount(): number { return this.activeMarkdown.length; }
  get lineCount(): number { return this.activeMarkdown.split('\n').length; }

  get renderedMarkdown(): SafeHtml {
    const html = marked.parse(this.activeMarkdown) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  setLang(lang: 'pt' | 'en'): void { this.activeLang = lang; }

  onEditorFocus(): void { this.editorFocused = true; }
  onEditorBlur(): void { this.editorFocused = false; }

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

  private insertImage(file: File): void {
    const ext = file.type.split('/')[1] ?? 'png';
    const name = `img-${crypto.randomUUID()}.${ext}`;
    const blobUrl = URL.createObjectURL(file);
    this.imageMap.set(name, file);
    this.blobUrls.set(name, blobUrl);

    const snippet = `\n![${name}](${blobUrl})\n`;
    const textarea = this.editorTextareaRef?.nativeElement;
    const start = textarea?.selectionStart ?? this.activeMarkdown.length;
    const end = textarea?.selectionEnd ?? start;
    const current = this.activeMarkdown;

    this.activeMarkdown = current.substring(0, start) + snippet + current.substring(end);

    if (textarea) {
      const newPos = start + snippet.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    }
  }

  private fixMarkdown(md: string): string {
    let result = md;
    this.imageMap.forEach((_, name) => {
      const blobUrl = this.blobUrls.get(name);
      if (!blobUrl) return;
      const realUrl = this.integrantesService.getImageUrl(name);
      result = result.replace(
        new RegExp(`!\\[${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\(blob:[^)]+\\)`, 'g'),
        `![${name}](${realUrl})`
      );
    });
    return result;
  }

  private showToast(message: string, success = false): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastSuccess = success;
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

  onSave(): void {
    if (this.saving) return;
    this.saving = true;

    const images = Array.from(this.imageMap.entries()).map(
      ([name, file]) => new File([file], name, { type: file.type })
    );

    const doSave = (pt: string, en: string, imgs: File[]) => {
      this.integrantesService.update(pt, en, imgs).subscribe({
        next: () => {
          this.saving = false;
          this.showToast('Conteúdo salvo com sucesso!', true);
        },
        error: (err: unknown) => {
          this.saving = false;
          this.showToast(this.extractError(err));
        }
      });
    };

    if (images.length === 0) {
      doSave(this.markdownPt, this.markdownEn, []);
    } else {
      // Step 1: upload images
      this.integrantesService.update(this.markdownPt, this.markdownEn, images).subscribe({
        next: () => {
          // Step 2: fix blob URLs in markdown and save final version
          const fixedPt = this.fixMarkdown(this.markdownPt);
          const fixedEn = this.fixMarkdown(this.markdownEn);

          this.markdownPt = fixedPt;
          this.markdownEn = fixedEn;
          this.blobUrls.forEach(url => URL.revokeObjectURL(url));
          this.blobUrls.clear();
          this.imageMap.clear();

          doSave(fixedPt, fixedEn, []);
        },
        error: (err: unknown) => {
          this.saving = false;
          this.showToast(this.extractError(err));
        }
      });
    }
  }

  onClear(): void {
    if (this.activeLang === 'pt') this.markdownPt = '';
    else this.markdownEn = '';
  }
}
