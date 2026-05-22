import { Component, Input, OnInit, OnChanges, SimpleChanges, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PostService } from '../services/post';
import { PostListItem } from '../models/post.model';
import { POST_TAGS, TAG_COLORS } from '../models/post-tag.model';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-posts-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, RouterModule],
  templateUrl: './posts-feed.html',
  styleUrls: ['./posts-feed.css']
})
export class PostsFeed implements OnInit, OnChanges {
  @Input() title = 'feed.title';
  @Input() excludeId: number | null = null;
  @Input() initialTag: string | null = null;

  readonly availableTags = [...POST_TAGS];

  allPosts: PostListItem[] = [];
  filteredPosts: PostListItem[] = [];
  selectedTags: string[] = [];
  searchText = '';
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
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }
    this.postService.getAll().subscribe({
      next: (data) => {
        this.allPosts = data
          .filter(p => p.isActive && p.id !== this.excludeId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (this.initialTag && !this.selectedTags.includes(this.initialTag)) {
          this.selectedTags = [this.initialTag];
        }
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'feed.error';
        this.loading = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialTag'] && !changes['initialTag'].firstChange && this.allPosts.length > 0) {
      this.selectedTags = this.initialTag ? [this.initialTag] : [];
      this.applyFilters();
    }
    if (changes['excludeId'] && this.allPosts.length > 0) {
      this.allPosts = this.allPosts.filter(p => p.id !== this.excludeId);
      this.applyFilters();
    }
  }

  toggleTag(tag: string): void {
    const idx = this.selectedTags.indexOf(tag);
    if (idx >= 0) {
      this.selectedTags.splice(idx, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.applyFilters();
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedTags = [];
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.searchText.trim().length > 0 || this.selectedTags.length > 0;
  }

  private applyFilters(): void {
    let result = this.allPosts;

    const q = this.searchText.trim().toLowerCase();
    if (q) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (this.selectedTags.length > 0) {
      result = result.filter(p =>
        p.tags?.some(tag => this.selectedTags.includes(tag))
      );
    }

    this.filteredPosts = result;
  }

  goToPost(id: number): void {
    this.router.navigate(['/post', id]);
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
