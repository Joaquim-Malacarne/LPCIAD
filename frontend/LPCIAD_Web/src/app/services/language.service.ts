import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, firstValueFrom, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export type Lang = 'pt' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private langSubject = new BehaviorSubject<Lang>('pt');
  readonly currentLang$ = this.langSubject.asObservable();

  private translations: Record<Lang, Record<string, string>> = { pt: {}, en: {} };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Called by APP_INITIALIZER — blocks first render until translations are loaded.
  // Returns immediately on SSR (server has no relative-URL origin to fetch from).
  init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }
    return firstValueFrom(
      forkJoin({
        pt: this.http.get<Record<string, string>>('/assets/i18n/pt.json'),
        en: this.http.get<Record<string, string>>('/assets/i18n/en.json'),
      })
    ).then(({ pt, en }) => {
      this.translations = { pt, en };
    });
  }

  get currentLang(): Lang {
    return this.langSubject.value;
  }

  setLang(lang: Lang): void {
    this.langSubject.next(lang);
  }

  translate(key: string): string {
    return this.translations[this.langSubject.value]?.[key] ?? key;
  }
}
