import { Routes } from '@angular/router';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: Home },
  {
    path: 'post/:id',
    loadComponent: () =>
      import('./post-detail/post-detail').then(m => m.PostDetail)
  },
  {
    path: 'admin/add-post',
    loadComponent: () =>
      import('./admin/add-post/add-post').then(m => m.AddPost)
  },
  {
    path: 'admin/posts-dashboard',
    loadComponent: () =>
      import('./admin/posts-dashboard/posts-dashboard').then(m => m.PostsDashboard)
  },
  { path: '**', redirectTo: '' }
];