import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./domains/cv/cv.routes').then((m) => m.cvRoutes),
  },
  {
    path: 'egypt-story',
    loadChildren: () => import('./domains/memoir/memoir.routes').then((m) => m.memoirRoutes),
  },
  {
    path: 'demo',
    loadComponent: () =>
      import('./domains/lab/collapse-demo/collapse-demo.component').then(
        (m) => m.CollapseDemoComponent,
      ),
    title: 'Collapse Components Demo - Lubomir of Slavigrad Chronicles',
  },

  {
    path: '404',
    loadComponent: () => import('./shell/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Page Not Found - Lubomir of Slavigrad Chronicles',
  },
  {
    path: '**',
    redirectTo: '/404',
    pathMatch: 'full',
  },
];
