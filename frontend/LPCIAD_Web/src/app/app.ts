import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Header } from './header/header';
import { LanguageSelector } from './language-selector/language-selector';

// Angular Material
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    Header,
    LanguageSelector,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
  ],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-language-selector></app-language-selector>
  `
})
export class App {}
