import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, firstValueFrom, forkJoin, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export type Lang = 'pt' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private langSubject: BehaviorSubject<Lang>;
  readonly currentLang$: Observable<Lang>;

  private translations: Record<Lang, Record<string, string>> = { pt: {}, en: {} };

  constructor(
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // lê idioma salvo ou usa 'pt' como padrão; atualiza <html lang> imediatamente
    const stored = isPlatformBrowser(this.platformId)
      ? (localStorage.getItem('lang') as Lang | null) ?? 'pt'
      : 'pt';
    this.langSubject = new BehaviorSubject<Lang>(stored);
    this.currentLang$ = this.langSubject.asObservable();
    this.updateHtmlLang(stored);
  }

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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
    this.langSubject.next(lang);
    // WCAG 3.1.1: sincroniza <html lang> sempre que o idioma muda
    this.updateHtmlLang(lang);
  }

  translate(key: string): string {
    return this.translations[this.langSubject.value]?.[key] ?? key;
  }

  private updateHtmlLang(lang: Lang): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    }
  }
}
