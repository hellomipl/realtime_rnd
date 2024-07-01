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
},{
    path:'presenter',
    loadComponent:()=>import('./components/presenter/presenter.component').then(m=>m.PresenterComponent)
},{
    path:'viewer',
    loadComponent:()=>import('./components/viewer/viewer.component').then(m=>m.ViewerComponent)
}
];
