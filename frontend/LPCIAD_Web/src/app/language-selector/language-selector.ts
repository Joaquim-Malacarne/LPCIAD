import { Component, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, CommonModule],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.css'
})
export class LanguageSelector {
  currentLang = 'BR';
  isOpen = false;
  langs = [
    { code: 'BR', label: 'Português (BR)', flag: '🇧🇷' },
    { code: 'EN', label: 'English (EN)',    flag: '🇺🇸' },
  ];

  private languageService = inject(LanguageService);

  get currentFlag(): string {
    return this.langs.find(l => l.code === this.currentLang)?.flag ?? '🌐';
  }

  select(code: string) {
    this.currentLang = code;
    this.isOpen = false;
    this.languageService.setLang(code === 'BR' ? 'pt' : 'en');
  }
}
