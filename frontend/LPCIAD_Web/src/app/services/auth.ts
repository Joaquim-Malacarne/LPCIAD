import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly tokenKey = 'auth_token';
  private renewalTimeout: ReturnType<typeof setTimeout> | null = null;

  async login(username: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<{ token: string }>(`${environment.apiUrl}/auth/login`, { username, password })
    );
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, response.token);
    }
    this.scheduleRenewal(response.token);
  }

  logout(): void {
    if (this.renewalTimeout !== null) {
      clearTimeout(this.renewalTimeout);
      this.renewalTimeout = null;
    }
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.tokenKey);
  }

  scheduleRenewal(token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.renewalTimeout !== null) {
      clearTimeout(this.renewalTimeout);
      this.renewalTimeout = null;
    }

    let exp: number;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp: number };
      exp = payload.exp;
    } catch {
      this.logout();
      return;
    }

    const delay = exp * 1000 - 15 * 60 * 1000 - Date.now();

    if (delay <= 0) {
      this.logout();
      return;
    }

    this.renewalTimeout = setTimeout(async () => {
      try {
        const response = await firstValueFrom(
          this.http.post<{ token: string }>(`${environment.apiUrl}/auth/refresh`, {})
        );
        localStorage.setItem(this.tokenKey, response.token);
        this.scheduleRenewal(response.token);
      } catch {
        this.logout();
      }
    }, delay);
  }
}
