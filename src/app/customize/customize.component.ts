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


  selected_image_src = "";
  pic_name = "";
  badge_css = "top-left";
  top = '200px';
  left = '0px';
  css = "top-left";
  top1 = true;
  pos = false; // [disabled]="!pos" for NEXT
  selected = 'top-left';
  opvalue;
  inBounds = true;
  edge = {
    top: true,
    bottom: true,
    left: true,
    right: true
  };
  endOffset;
  img1 = { x: 0, y: 0 };
  img1x = 0;
  img1y = 0;
  imgW = 15;
  imgH = 15;
  imgR = 0;

  position = 'drag';
  BadgeWidth = 15;
  BadgeHeight = 15;
  BorderRadius = 0;



  constructor(private badge: BadgeService, private route: ActivatedRoute, private spinner: NgxSpinnerService, private router: Router) {
    // this.badge.getProduct();
    this.selected_image_src = badge.getBadgePic();

    this.endOffset = badge.getCoor();
    this.img1 = badge.getCoor2();

    

    this.top = this.endOffset.x;
    this.left = this.endOffset.y;
    this.opvalue = badge.getOpval();
    this.BadgeWidth = badge.getBadgeWidth();
    this.BadgeHeight = badge.getBadgeHeight();
    this.BorderRadius = badge.getBorderRadius();




    // document.getElementById("image12").style.top="200px";
    // var c = document.getElementById("image12").childNodes.length;
    // console.log(c);
    // document.getElementsByName("badge").style.top=this.top;
    // document.getElementsByName("badge").style.left=this.left;
    // this.badge_css=badge.getBadgeCss();
    // console.log("inside constructor:"+this.selected_image_src);
    // this.route.queryParams.subscribe(params => {
    //   if( params["picName"])
    //   this.selected_image_src = params["picName"];

    //   console.log(this.selected_image_src);
    // });
    console.log("customize badge pic " + this.selected_image_src);
    console.log("customize x and y value" + this.endOffset.x + " " + this.endOffset.y);
    console.log("customize opval " + this.opvalue);

    // console.log("customize badge css "+this.badge_css);
    // console.log("position"+this.css);

  }

  drag() {
    this.endOffset.x = 0;
    this.endOffset.y = 0;
  }

  input() {
    this.img1.x = 0;
    this.img1.y = 0;
  }

  leftpx() {
    var x = this.img1.x;
    // this.endOffset.x = this.img1x;
    console.log(x);
    document.getElementById("image1").style.left = x + 'px';
    this.badge.setCoor2(this.img1.x, this.img1.y);

  }
  toppx() {
    var y = this.img1.y;
    // this.endOffset.y = this.img1y;
    console.log(y);
    document.getElementById("image1").style.top = y + 'px';
    this.badge.setCoor2(this.img1.x, this.img1.y);

  }

  // BadgeWidth2(){
  //   var w=this.imgW;
  //   document.getElementById("img1").style.width=w+'%';

  // }

  // BadgeHeight2(){
  //   var h=this.imgH;
  //   document.getElementById("img1").style.height=h+'%';

  // }
  BorderRadius1(R) {
    this.BorderRadius = R;
    document.getElementById("image1").style['border-radius'] = this.BorderRadius + '%';
    this.badge.setBorderRadius(this.BorderRadius);
  }

  BadgeWidth1(W) {
    this.BadgeWidth = W;
    document.getElementById("image1").style.width = this.BadgeWidth + '%';
    this.badge.setBadgeWidth(this.BadgeWidth);
  }

  BadgeHeight1(H) {
    this.BadgeHeight = H;
    document.getElementById("image1").style.height = this.BadgeHeight + '%';
    this.badge.setBadgeHeight(this.BadgeHeight);
  }
  onStart(event) {
    console.log('started output:', event);
  }

  onStop(event, id) {
    console.log('stopped output:', event);
    console.log("id:" + id);

  }



  onMoveEnd(event) {
    this.endOffset.x = event.x;
    this.endOffset.y = event.y;
    this.badge.setCoor(this.endOffset.x, this.endOffset.y);
  }



  // nextFunc(){
  //   console.log("in next func");
  // }

  //  checkEdge(event) {
  //   this.edge = event;
  //   console.log('edge:', event);
  // } 




  positionControl = new FormControl('', [Validators.required]);
  positions: position[] = [
    { name: 'top-right' },
    { name: 'top-left' },
    { name: 'bottom-left' },
    { name: 'bottom-right' },
  ];

  selectProducts() {
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

      if(this.position=='drag'){
        this.badge.setCoorFinal(this.endOffset.x,this.endOffset.y);
      }
      else{
        this.badge.setCoorFinal(this.img1.x,this.img1.y);
      }

      this.router.navigate(["/products"]);
      this.spinner.hide();


    }, 1000);
  }

  slidervalue(value) {
    this.opvalue = value / 100;

    document.getElementById("image1").style.opacity = this.opvalue;

    this.badge.setOpval(this.opvalue);
    console.log("in slidervalue" + this.opvalue);
    console.log("get val" + this.badge.getOpval());


  }

  onloadFun() {
    console.log("onload");
    document.getElementById("image12").style.top = this.top;
    document.getElementById("image12").style.left = this.left;
  }




}
