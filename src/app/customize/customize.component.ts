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
  endOffset = { x: 0, y: 0 };



  constructor(private badge: BadgeService, private route: ActivatedRoute, private spinner: NgxSpinnerService, private router: Router) {
    // this.badge.getProduct();
    console.log("inside constructor:"+this.selected_image_src);
    this.route.queryParams.subscribe(params => {
      if( params["picName"])
      this.selected_image_src = params["picName"];
   
      console.log(this.selected_image_src);
  });

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



  nextFunc(){
    console.log("in next func");
  }
  
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

      console.log("pic name" + this.selected_image_src);
      // console.log("ids"+this.ids);
      let navigationExtras: NavigationExtras = {
        queryParams: {
          picName: this.selected_image_src,
          badgeCss:this.badge_css
        }
      };
      this.router.navigate(["/products"], navigationExtras);
      this.spinner.hide();
    }, 1000);
  }




}
