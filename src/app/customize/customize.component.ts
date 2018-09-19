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


  nextFunc(){
    console.log("in next func");
  }

  changeFunc(event){
      if (event == "top-right") {
          document.getElementById("image1").style.position = "relative";
          document.getElementById("image1").style.top = "0px";
          document.getElementById("image1").style.left = "450px";
      
      } else if (event == "top-left") {
          document.getElementById("image1").style.position = "relative";
          document.getElementById("image1").style.top = "0px";
          document.getElementById("image1").style.left = "0px";
          // document.getElementById("imagediv").style.float = "right";

      } else if (event == "bottom-right") {
          document.getElementById("image1").style.position = "relative";
          document.getElementById("image1").style.top = "450px";
          document.getElementById("image1").style.left = "450px";
          // document.getElementById("imagediv").style.float = "right";

      } else if (event == "bottom-left") {
          document.getElementById("image1").style.position = "relative";
          document.getElementById("image1").style.top = "450px";
          document.getElementById("image1").style.left = "0px";

      }
  }

  positionControl = new FormControl('', [Validators.required]);
  positions: position[] = [
    { name: 'top-right' },
    { name: 'top-left' },
    { name: 'bottom-left' },
    { name: 'bottom-right' },
  ];




}
