import { Component } from '@angular/core';
import { BadgeService } from './badge.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  products={}
  selected = false;
  title = 'badger';

  // constructor(private productService:BadgeService){

  // }
  // ngOnInit(){
  //   this.productService.getProduct()
  // }
}
