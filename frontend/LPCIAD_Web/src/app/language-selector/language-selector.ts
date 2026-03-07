import { Component } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; 

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, CommonModule, MatIconModule,],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.css'
})
export class LanguageSelector {
  currentLang = 'BR';
  isOpen = false; 
  langs = [
    { code: 'BR', label: 'Português (BR)' },
    { code: 'EN', label: 'English (EN)' },
    { code: 'ES', label: 'Español (ES)' }
  ];

  select(code: string) {
    this.currentLang = code;
    this.isOpen = false; 
  }
}
