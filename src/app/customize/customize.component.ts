import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BadgeService } from '../badge.service';
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';

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


  selected_image_src="";
  pic_name="";
  badge_css="top-left";
  top='200px';
  left='0px';
  css="top-left";
  top1=true;
  pos=false; // [disabled]="!pos" for NEXT
  selected='top-left';
   opvalue;
  inBounds = true;
  edge = {
    top: true,
    bottom: true,
    left: true,
    right: true
  };
  endOffset;
  



  constructor(private badge: BadgeService, private route: ActivatedRoute, private spinner: NgxSpinnerService, private router: Router) {
    // this.badge.getProduct();
    this.selected_image_src=badge.getBadgePic();
    this.endOffset = badge.getCoor();
    this.opvalue=badge.getOpval();
    // this.badge_css=badge.getBadgeCss();
    // console.log("inside constructor:"+this.selected_image_src);
    // this.route.queryParams.subscribe(params => {
    //   if( params["picName"])
    //   this.selected_image_src = params["picName"];
   
    //   console.log(this.selected_image_src);
  // });
  console.log("customize badge pic "+this.selected_image_src);
  console.log("customize x and y value"+this.endOffset.x+" "+this.endOffset.y);
  console.log("customize opval"+this.opvalue);

      // console.log("customize badge css "+this.badge_css);
      // console.log("position"+this.css);

  }
  onStart(event) {
    console.log('started output:', event);
  }

  onStop(event) {
    console.log('stopped output:', event);
  }

 

  onMoveEnd(event) {
    this.endOffset.x = event.x;
    this.endOffset.y = event.y;

  }



  // nextFunc(){
  //   console.log("in next func");
  // }
  
   checkEdge(event) {
    this.edge = event;
    console.log('edge:', event);
  } 
  
  


  positionControl = new FormControl('', [Validators.required]);
  positions: position[] = [
    { name: 'top-right' },
    { name: 'top-left' },
    { name: 'bottom-left' },
    { name: 'bottom-right' },
  ];

  selectProducts(){
    console.log("inside selectProducts");
    this.spinner.show();
    setTimeout(() => {

      // console.log("pic name" + this.selected_image_src);
      // // console.log("ids"+this.ids);
      // let navigationExtras: NavigationExtras = {
      //   queryParams: {
      //     picName: this.selected_image_src,
      //     badgeCss:this.badge_css
      //   }
      // };
      // this.router.navigate(["/products"], navigationExtras);
      this.router.navigate(["/products"]);
      this.spinner.hide();
    }, 1000);
  }

  slidervalue(value){
    this.opvalue = value/100;

document.getElementById("image1").style.opacity = this.opvalue;

this.badge.setOpval(value);
console.log("in slidervalue"+this.opvalue);


  }




}
