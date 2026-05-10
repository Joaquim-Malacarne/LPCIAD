import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-loader.html',
  styleUrls: ['./page-loader.css']
})
export class PageLoader implements OnInit {
  loading = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e =>
        e instanceof NavigationStart ||
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError
      )
    ).subscribe(e => {
      this.loading = e instanceof NavigationStart;
    });
  }
}
