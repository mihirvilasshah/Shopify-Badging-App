import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { MatSelectModule} from '@angular/material/select';
import { HttpClientModule }    from '@angular/common/http';
// import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService }  from './in-memory-data.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SelectBadgeComponent } from './select-badge/select-badge.component';
import { CustomizeComponent } from './customize/customize.component';
import { SelectProductsComponent } from './select-products/select-products.component';
import { RemoveBadgesComponent } from './remove-badges/remove-badges.component';
import {BadgeService} from './badge.service'
// import { FormsModule } from '../../node_modules/@angular/forms';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
// import {NgModule} from '@angular/core';
// import {FormsModule, ReactiveFormsModule}  from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    SelectBadgeComponent,
    CustomizeComponent,
    SelectProductsComponent,
    RemoveBadgesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    HttpClientModule
    // HttpClientInMemoryWebApiModule.forRoot(
    //   InMemoryDataService, { dataEncapsulation: false }
    // )
  ],
  providers: [
    BadgeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
