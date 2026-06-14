import { Routes } from '@angular/router';

export const cvRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature-overview/home.component').then((m) => m.HomeComponent),
    title: 'Lubomir of Slavigrad Chronicles - Digital CV & Portfolio',
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'cv',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'portfolio',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'resume',
    redirectTo: '',
    pathMatch: 'full',
  },
];
