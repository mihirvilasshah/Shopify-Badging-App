import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatTabsModule,MatSelectModule } from '@angular/material';
import {MatStepperModule} from '@angular/material/stepper';

@NgModule({
  imports: [MatButtonModule, MatTabsModule, MatSelectModule,MatStepperModule],
  exports: [MatButtonModule, MatTabsModule, MatSelectModule,MatStepperModule],
})
export class MaterialModule { }