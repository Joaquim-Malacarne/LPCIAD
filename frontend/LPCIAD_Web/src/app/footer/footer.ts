import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer implements OnInit {
  visible = true;
  currentYear = new Date().getFullYear();
  lang$ = inject(LanguageService).currentLang$;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkVisibility(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => this.checkVisibility(e.url));
  }

  private checkVisibility(url: string): void {
    this.visible = !url.startsWith('/admin');
  }
}
