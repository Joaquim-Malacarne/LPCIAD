import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async onSubmit(): Promise<void> {
    if (!this.username || !this.password) return;

    this.loading = true;
    this.error = '';

    try {
      await this.auth.login(this.username, this.password);
      this.router.navigate(['/admin/posts-dashboard']);
    } catch {
      this.error = 'Credenciais inválidas. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
}
