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
  badge_css="";
  pos=false;



  constructor(private badge: BadgeService, private route: ActivatedRoute, private spinner: NgxSpinnerService, private router: Router) {
    // this.badge.getProduct();
    console.log("inside constructor:"+this.selected_image_src);
    this.route.queryParams.subscribe(params => {
      if( params["picName"])
      this.selected_image_src = params["picName"];
   
      console.log(this.selected_image_src);
  });

  }



  nextFunc(){
    console.log("in next func");
  }

  changeFunc(event){
      if (event == "top-right") {
          document.getElementById("image1").style.position = "relative";
          document.getElementById("image1").style.top = "0px";
          document.getElementById("image1").style.left = "350px";
          this.badge_css="top-right";
          this.pos = true;
      
      } else if (event == "top-left") {
          document.getElementById("image1").style.position = "relative";
          document.getElementById("image1").style.top = "0px";
          document.getElementById("image1").style.left = "0px";
          // document.getElementById("imagediv").style.float = "right";
          this.badge_css="top-left";
          this.pos = true;

      } else if (event == "bottom-right") {
          document.getElementById("image1").style.position = "relative";
          document.getElementById("image1").style.top = "350px";
          document.getElementById("image1").style.left = "350px";
          // document.getElementById("imagediv").style.float = "right";
          this.badge_css="bottom-right";
          this.pos = true;

      } else if (event == "bottom-left") {
          document.getElementById("image1").style.position = "relative";
          document.getElementById("image1").style.top = "350px";
          document.getElementById("image1").style.left = "0px";
          this.badge_css="bottom-left";
          this.pos = true;

      }
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
