import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageSelector } from '../language-selector/language-selector';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelector, TranslatePipe],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  lang$ = inject(LanguageService).currentLang$;
}
