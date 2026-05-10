import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { marked } from 'marked';
import { IntegrantesService } from '../services/integrantes';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-integrantes',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './integrantes.html',
  styleUrls: ['./integrantes.css']
})
export class Integrantes implements OnInit, OnDestroy {

  renderedContent: SafeHtml = '';
  loading = true;
  error = false;
  empty = false;

  lang$ = inject(LanguageService).currentLang$;
  private languageService = inject(LanguageService);
  private langSub?: Subscription;

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

    // BehaviorSubject emits current lang immediately, then on every change
    this.langSub = this.languageService.currentLang$.subscribe(lang => {
      this.loadContent(lang);
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadContent(lang: string): void {
    this.loading = true;
    this.error = false;

    this.integrantesService.getContent(lang).subscribe({
      next: (data) => {
        this.empty = !data.content.trim();
        if (!this.empty) {
          const html = marked.parse(this.replaceImages(data.content, data.images)) as string;
          this.renderedContent = this.sanitizer.bypassSecurityTrustHtml(html);
        }
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  private replaceImages(content: string, images: string[]): string {
    let md = content;
    images.forEach(img => {
      const apiUrl = this.integrantesService.getImageUrl(img);
      md = md.replace(
        new RegExp(`!\\[([^\\]]*)\\]\\(${img}\\)`, 'g'),
        `![$1](${apiUrl})`
      );
    });
    return md;
  }
}
