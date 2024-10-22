import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    pathMatch: 'full',
    path: 'doc/:id',
    title: 'Docs|Editor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quill-editor/quill-editor.component').then(
        (m) => m.QuillEditorComponent
      ),
  },
  {
    path: '',
    title: 'Docs Home',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },

  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
