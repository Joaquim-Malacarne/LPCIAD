import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { marked } from 'marked';
import { PostService } from '../services/post';
import { PostDetailItem } from '../models/post-detail.model';
import { TAG_COLORS } from '../models/post-tag.model';
import { PostsFeed } from '../posts-feed/posts-feed';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, PostsFeed, TranslatePipe],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.css']
})
export class PostDetail implements OnInit, OnDestroy {

  post: PostDetailItem | null = null;
  loading = true;
  error: string | null = null;
  renderedContent: SafeHtml = '';
  postId = 0;

  lang$ = inject(LanguageService).currentLang$;
  private languageService = inject(LanguageService);
  private langSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) { this.router.navigate(['/']); return; }
      this.postId = id;
      this.loadPost(id, this.languageService.currentLang);
    });

    // Skip the initial BehaviorSubject emission — paramMap handles the first load
    this.langSub = this.languageService.currentLang$.pipe(skip(1)).subscribe(lang => {
      if (this.postId) {
        this.loadPost(this.postId, lang);
      }
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadPost(id: number, lang: string): void {
    this.loading = true;
    this.error = null;

    this.postService.getById(id, lang).subscribe({
      next: (data: PostDetailItem) => {
        this.post = data;
        this.renderContent(data.content, data.images, id);
        this.loading = false;
      },
      error: () => {
        this.error = 'post_detail.error';
        this.loading = false;
      }
    });
  }

  private renderContent(markdown: string, images: string[], postId: number): void {
    let md = markdown;
    images.forEach(img => {
      const apiUrl = this.postService.getImageUrl(postId, img);
      md = md.replace(
        new RegExp(`!\\[([^\\]]*)\\]\\(${img}\\)`, 'g'),
        `![$1](${apiUrl})`
      );
    });
    const html = marked.parse(md) as string;
    this.renderedContent = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getCoverUrl(): string | null {
    if (!this.post || this.post.images.length === 0) return null;
    return this.postService.getImageUrl(this.post.id, this.post.images[0]);
  }

  getTagBg(tag: string): string {
    return TAG_COLORS[tag]?.bg ?? '#e8eef3';
  }

  getTagColor(tag: string): string {
    return TAG_COLORS[tag]?.text ?? '#555';
  }

  formatDate(dateStr: string): string {
    const locale = this.languageService.currentLang === 'pt' ? 'pt-BR' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}
