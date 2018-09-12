import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BadgeService } from '../badge.service';

export interface position {
  name: string;
}

// export interface Position {
//   value: string;
//   viewValue: string;
// }

@Component({
  selector: 'app-customize',
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.scss']
})


export class CustomizeComponent {

  constructor(private badge: BadgeService) {
    this.badge.getProduct()

  }

  positionControl = new FormControl('', [Validators.required]);
  positions: position[] = [
    { name: 'top-right' },
    { name: 'top-left' },
    { name: 'bottom-left' },
    { name: 'bottom-right' },
  ];

  // positions: Position[] = [
  //   {value: 'top-right', viewValue: 'top-right'},
  //   {value: 'top-left', viewValue: 'top-left'},
  //   {value: 'bottom-right', viewValue: 'bottom-right'}
  //   {value: 'bottom-left', viewValue: 'bottom-left'}
  // ];



}
