import { Routes } from '@angular/router';
import { FeedDisplayComponent } from './components/feed-display/feed-display.component';

export const routes: Routes = [{
    path: '',
    redirectTo: 'share',
    pathMatch: 'full',
},
{
    path: 'feed',
    loadComponent:()=>import('./components/feed-display/feed-display.component').then(m=>m.FeedDisplayComponent),
}
,
{
    path: 'share',
    loadComponent:()=>import('./components/screen-share/screen-share.component').then(m=>m.ScreenShareComponent),
}
];
