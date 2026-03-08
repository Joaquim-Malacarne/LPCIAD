import { Routes } from '@angular/router';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: Home },
  {
    path: 'admin/add-post',
    loadComponent: () =>
      import('./admin/add-post/add-post').then(m => m.AddPost)
  },
  { path: '**', redirectTo: '' }
];