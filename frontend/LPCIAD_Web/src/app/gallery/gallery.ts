import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Swiper } from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { PostService } from '../services/post';

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
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css']
})
export class Gallery implements OnInit {
  slides: GallerySlide[] = [];
  loading = true;
  error = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.postService.getAll().subscribe({
      next: (posts) => {
        const top5 = posts
          .filter(p => p.isActive && p.images && p.images.length > 0)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        this.slides = top5.map(p => ({
          postId: p.id,
          title: p.title,
          description: p.description,
          date: p.date,
          imageUrl: this.postService.getImageUrl(p.id, p.images[0])
        }));

        this.loading = false;

        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initSwiper(), 0);
        }
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  private initSwiper(): void {
    new Swiper('.gallery-swiper', {
      modules: [Navigation, Pagination, Autoplay],
      loop: this.slides.length > 1,
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 700,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
    });
  }
}