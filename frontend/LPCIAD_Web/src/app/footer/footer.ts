import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer implements OnInit {
  visible = true;
  currentYear = new Date().getFullYear();

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
