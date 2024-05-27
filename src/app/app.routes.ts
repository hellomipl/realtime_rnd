import { Routes } from '@angular/router';
import { FeedDisplayComponent } from './components/feed-display/feed-display.component';

export const routes: Routes = [{
    path: '',
    redirectTo: 'feed',
    pathMatch: 'full',
},
{
    path: 'feed',
    loadComponent:()=>import('./components/feed-display/feed-display.component').then(m=>m.FeedDisplayComponent),
}
];
