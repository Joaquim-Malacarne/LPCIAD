import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageSelector } from '../language-selector/language-selector';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelector],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {}
