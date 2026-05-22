import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-admin-hub',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterModule, TranslatePipe],
  templateUrl: './admin-hub.html',
  styleUrls: ['./admin-hub.css']
})
export class AdminHub {
  lang$ = inject(LanguageService).currentLang$;

  private readonly auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}
