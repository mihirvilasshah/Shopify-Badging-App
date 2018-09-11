import { Component, OnInit } from '@angular/core';

export interface Position {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-customize',
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.scss']
})
export class CustomizeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  positions: Position[] = [
    {value: 'top-right', viewValue: 'top-right'},
    {value: 'top-left', viewValue: 'top-left'},
    {value: 'bottom-right', viewValue: 'bottom-right'}
    {value: 'bottom-left', viewValue: 'bottom-left'}
  ];

}
