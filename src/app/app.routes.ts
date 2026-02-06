import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Lubomir of Slavigrad Chronicles - Digital CV & Portfolio'
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'cv',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'portfolio',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'resume',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'egypt-story',
    loadComponent: () => import('./pages/egypt-story/egypt-story.component').then(m => m.EgyptStoryComponent),
    title: 'I Wandered Through Egypt - Lubomir of Slavigrad Chronicles'
  },
  {
    path: 'demo',
    loadComponent: () => import('./shared/components/ui/collapse-demo.component').then(m => m.CollapseDemoComponent),
    title: 'Collapse Components Demo - Lubomir of Slavigrad Chronicles'
  },

  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - Lubomir of Slavigrad Chronicles'
  },
  {
    path: '**',
    redirectTo: '/404',
    pathMatch: 'full'
  }
];
