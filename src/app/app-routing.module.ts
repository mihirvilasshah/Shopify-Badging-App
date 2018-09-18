import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectBadgeComponent } from './selectbadge/selectbadge.component';
import { CustomizeComponent } from './customize/customize.component';
import { SelectProductsComponent } from './select-products/select-products.component';
import { RemoveBadgesComponent } from './remove-badges/remove-badges.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'badge',
    pathMatch: 'full'
  },
  {
    path: 'badge',
    component: SelectBadgeComponent,
  },
  {
    path: 'customize',
    component: CustomizeComponent
  },
  {
    path: 'products',
    component: SelectProductsComponent,
  },
  {
    path: 'remove',
    component: RemoveBadgesComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
