import { Routes } from '@angular/router';

export const memoirRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature-story/egypt-story.component').then((m) => m.EgyptStoryComponent),
    title: 'I Wandered Through Egypt - Lubomir of Slavigrad Chronicles',
  },
];
