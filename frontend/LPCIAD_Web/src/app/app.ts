import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { PageLoader } from './page-loader/page-loader';
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
    Footer,
    PageLoader,
    LanguageSelector,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
  ],
  template: `
    <app-page-loader></app-page-loader>
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <app-language-selector></app-language-selector>
  `
})
export class App {}
