import { Routes } from '@angular/router';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: Home },
  { path: '**', redirectTo: '' }
];

