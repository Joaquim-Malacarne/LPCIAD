import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { PostService } from '../services/post';
import { PostListItem } from '../models/post.model';
import { PostDetailItem } from '../models/post-detail.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.css']
})
export class PostDetail implements OnInit {

  post: PostDetailItem | null = null;
  relatedPosts: PostListItem[] = [];
  loading = true;
  error: string | null = null;

  activeLang: 'pt' | 'en' = 'pt';
  hasEnglish = false;
  renderedContent: SafeHtml = '';

  private postId = 0;

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
      this.activeLang = 'pt';
      this.loadPost(id, 'pt');
      this.loadRelated(id);
    });
  }

  private loadPost(id: number, lang: string): void {
    this.loading = true;
    this.error = null;

    this.postService.getById(id, lang).subscribe({
      next: (data: PostDetailItem) => {
        this.post = data;
        this.renderContent(data.content, data.images, id);

        if (lang === 'pt') {
          this.postService.getById(id, 'en').subscribe({
            next: () => { this.hasEnglish = true; },
            error: () => { this.hasEnglish = false; }
          });
        }

        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar o post.';
        this.loading = false;
      }
    });
  }

  private loadRelated(currentId: number): void {
    this.postService.getAll().subscribe({
      next: (posts: PostListItem[]) => {
        this.relatedPosts = posts
          .filter(p => p.id !== currentId)
          .slice(0, 3);
      },
      error: () => {}
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

  setLang(lang: 'pt' | 'en'): void {
    if (lang === this.activeLang) return;
    this.activeLang = lang;
    this.loadPost(this.postId, lang);
  }

  goToPost(id: number): void {
    this.router.navigate(['/post', id]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getImageUrl(post: PostListItem): string | null {
    return post.images?.length > 0
      ? this.postService.getImageUrl(post.id, post.images[0])
      : null;
  }

  getCoverUrl(): string | null {
    if (!this.post || this.post.images.length === 0) return null;
    return this.postService.getImageUrl(this.post.id, this.post.images[0]);
  }

  getExtraImages(): string[] {
    return this.post ? this.post.images.slice(1) : [];
  }

  getExtraImageUrl(imageName: string): string {
    return this.postService.getImageUrl(this.post!.id, imageName);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  extractTitle(content: string): string {
    const match = content.match(/^#\s+(.+)/m);
    return match ? match[1].trim() : `Post ${this.postId}`;
  }
}