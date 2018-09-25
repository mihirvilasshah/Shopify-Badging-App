import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { MatSelectModule} from '@angular/material/select';
import { HttpClientModule }    from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SelectBadgeComponent } from './selectbadge/selectbadge.component';
import { CustomizeComponent } from './customize/customize.component';
import { SelectProductsComponent } from './select-products/select-products.component';
import { RemoveBadgesComponent } from './remove-badges/remove-badges.component';
import {BadgeService} from './badge.service'
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FileSelectDirective } from 'ng2-file-upload';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    SelectBadgeComponent,
    CustomizeComponent,
    SelectProductsComponent,
    RemoveBadgesComponent,
    FileSelectDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    HttpClientModule,
    NgxSpinnerModule
    // HttpClientInMemoryWebApiModule.forRoot(
    //   InMemoryDataService, { dataEncapsulation: false }
    // )
  ],




  providers: [
    BadgeService
  ],
  bootstrap: [AppComponent]
})

// const routes:Routes = [
//   { 
//     path: 'selectBadge',
//     component: SelectBadgeComponent
//   },
//   { 
//     path: 'customizeBadge', 
//     component: CustomizeComponent 
//   },
//   {
//     path: 'removeBadge/:id',
//     component: RemoveBadgesComponent
//   },

//   { 
//     path: 'sidebar',
//     component: SidebarComponent
//   },
//   { 
//     path: 'selectProducts',
//     component: SelectProductsComponent
//   }
// ]
export class AppModule { }
