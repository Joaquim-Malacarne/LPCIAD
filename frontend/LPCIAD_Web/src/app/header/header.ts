import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageSelector } from '../language-selector/language-selector';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,
    LanguageSelector],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  navItems = ['UNIVERSIDADE','GRADUAÇÃO','PÓS-GRADUAÇÃO','PESQUISA','EXTENSÃO','BIBLIOTECA','EDITORA','INTERNACIONAL','EDITAIS'];
}
