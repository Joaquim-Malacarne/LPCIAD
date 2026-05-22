import { Routes } from '@angular/router';
import { Home } from './home/home';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: Home },
  {
    path: 'posts',
    loadComponent: () =>
      import('./posts-page/posts-page').then(m => m.PostsPage)
  },
  {
    path: 'integrantes',
    loadComponent: () =>
      import('./integrantes/integrantes').then(m => m.Integrantes)
  },
  {
    path: 'post/:id',
    loadComponent: () =>
      import('./post-detail/post-detail').then(m => m.PostDetail)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login').then(m => m.Login)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/admin-hub/admin-hub').then(m => m.AdminHub)
  },
  {
    path: 'admin/add-post',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/add-post/add-post').then(m => m.PostForm)
  },
  {
    path: 'admin/edit-post/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/add-post/add-post').then(m => m.PostForm)
  },
  {
    path: 'admin/edit-integrantes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/edit-integrantes/edit-integrantes').then(m => m.EditIntegrantes)
  },
  {
    path: 'admin/posts-dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/posts-dashboard/posts-dashboard').then(m => m.PostsDashboard)
  },
  { path: '**', redirectTo: '' }
];