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
    <!-- WCAG 2.4.1 (Pular blocos): permite que usuários de teclado saltem o header -->
    <a class="skip-link" href="#main-content">Pular para o conteúdo principal</a>
    <app-header></app-header>
    <main id="main-content" tabindex="-1">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-language-selector></app-language-selector>
  `
})
export class App {}
