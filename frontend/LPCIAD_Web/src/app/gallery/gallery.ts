import { Component, Inject, OnInit, OnDestroy, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Swiper } from 'swiper';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import { PostService } from '../services/post';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

interface GallerySlide {
  postId: number;
  title: string;
  description?: string;
  date: string;
  imageUrl: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css']
})
export class Gallery implements OnInit, OnDestroy {

  slides: GallerySlide[] = [];
  loading = true;
  error = false;
  lang$ = inject(LanguageService).currentLang$;

  private swiperInstance: Swiper | null = null;
  private focusOutTimer: ReturnType<typeof setTimeout> | null = null;
  private ngZone = inject(NgZone);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.postService.getAll().subscribe({
      next: (posts) => {
        this.slides = posts
          .filter(p => p.isActive && p.images && p.images.length > 0)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(p => ({
            postId: p.id,
            title: p.title,
            description: p.description,
            date: p.date,
            imageUrl: this.postService.getImageUrl(p.id, p.images[0])
          }));

        this.loading = false;

        if (isPlatformBrowser(this.platformId)) {
          this.ngZone.runOutsideAngular(() => setTimeout(() => this.initSwiper(), 0));
        }
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.focusOutTimer) clearTimeout(this.focusOutTimer);
    this.swiperInstance?.destroy(true, true);
  }

  // WCAG 2.2.2 (Pausar, parar): para o autoplay quando foco entra na seção
  onSectionFocusIn(): void {
    if (this.focusOutTimer) {
      clearTimeout(this.focusOutTimer);
      this.focusOutTimer = null;
    }
    if (!isPlatformBrowser(this.platformId)) return;
    this.swiperInstance?.autoplay.stop();
  }

  // WCAG 2.2.2: retoma o autoplay quando foco sai da seção
  // Delay de 100ms cancela o timer se o foco apenas se moveu para outro filho
  onSectionFocusOut(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.focusOutTimer = setTimeout(() => {
      this.swiperInstance?.autoplay.start();
      this.focusOutTimer = null;
    }, 100);
  }

  private initSwiper(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = null;
    }

    if (this.slides.length === 0) return;

    this.swiperInstance = new Swiper('.gallery-swiper', {
      modules: [Navigation, Pagination, Autoplay, A11y],
      // WCAG 4.1.2 (Nome, função, valor): labels ARIA nas setas e nos bullets
      a11y: {
        prevSlideMessage: 'Slide anterior',
        nextSlideMessage: 'Próximo slide',
        paginationBulletMessage: 'Ir para o slide {{index}}',
      },
      loop: this.slides.length > 1,
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 700,
      // WCAG 2.2.2: pauseOnMouseEnter suspende autoplay no hover
      autoplay: { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
    });
  }
}
