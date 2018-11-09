import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatTabsModule,MatSelectModule } from '@angular/material';

@NgModule({
  imports: [MatButtonModule, MatTabsModule, MatSelectModule],
  exports: [MatButtonModule, MatTabsModule, MatSelectModule],
})
export class MaterialModule { }