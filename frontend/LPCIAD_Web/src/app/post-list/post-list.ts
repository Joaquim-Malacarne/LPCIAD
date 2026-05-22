import { Component, OnInit, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PostService } from '../services/post';
import { PostListItem } from '../models/post.model';
import { TAG_COLORS } from '../models/post-tag.model';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.css']
})
export class PostList implements OnInit {

  posts: PostListItem[] = [];
  loading = true;
  error: string | null = null;

  lang$ = inject(LanguageService).currentLang$;
  private languageService = inject(LanguageService);

  constructor(
    private postService: PostService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.postService.getAll().subscribe({
        next: (data: PostListItem[]) => {
          this.posts = data.filter(p => p.isActive);
          this.loading = false;
        },
        error: () => {
          this.error = 'post_list.error';
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  goToPost(id: number): void {
    this.router.navigate(['/post', id]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getImageUrl(post: PostListItem): string | null {
    return post.images?.length > 0
      ? this.postService.getImageUrl(post.id, post.images[0])
      : null;
  }

  getTagBg(tag: string): string {
    return TAG_COLORS[tag]?.bg ?? '#e8eef3';
  }

  getTagColor(tag: string): string {
    return TAG_COLORS[tag]?.text ?? '#555';
  }

  formatDate(dateStr: string, lang?: string | null): string {
    const locale = (lang ?? this.languageService.currentLang) === 'pt' ? 'pt-BR' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}
