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
  top = 200;
  finalx;
  finaly;
  left = 0;
  css = "top-left";
  dragevent;
  top1 = true;
  pos = false; // [disabled]="!pos" for NEXT
  selected = 'top-left';
  opvalue = 0;
  sliderval;
  inBounds = true;
  edge = {
    top: true,
    bottom: true,
    left: true,
    right: true
  };
  endOffset = {x:0,y:0};
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

    this.endOffset.x = badge.getCoorx();
    this.endOffset.y = badge.getCoory();
    console.log("constructor-endoffset", this.endOffset)


    //this.endOffset = badge.getCoor2();



    this.top = this.endOffset.x;
    this.left = this.endOffset.y;
    this.opvalue = badge.getOpval();
    this.sliderval = this.opvalue * 100;
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

  

  leftpx() {
    var x = this.endOffset.x;
    // this.endOffset.x = this.img1x;
    console.log(x);
    //this.finalx = (this.endOffset.x-this.BadgeWidth*4.10)/100;
    //document.getElementById("image1").style.left = x + 'px';
    this.badge.setCoorx(this.endOffset.x);

  }
  toppx() {
    var y = this.endOffset.y;
    // this.endOffset.y = this.img1y;
    console.log(y);
    //document.getElementById("image1").style.top = y + 'px';
    this.badge.setCoory(this.endOffset.y);

  }

  // BadgeWidth2(){
  //   var w=this.imgW;
  //   document.getElementById("img1").style.width=w+'%';

  // }

  // BadgeHeight2(){
  //   var h=this.imgH;
  //   document.getElementById("img1").style.height=h+'%';

  // }
  BorderRadius1() {
    //this.BorderRadius = R;
    //.getElementById("image1").style['border-radius'] = this.BorderRadius + '%';
    this.badge.setBorderRadius(this.BorderRadius);
  }

  BadgeWidth1() {
    //this.BadgeWidth = W;
    //document.getElementById("image1").style.width = this.BadgeWidth + '%';
    this.badge.setBadgeWidth(this.BadgeWidth);
  }

  BadgeHeight1() {
    //this.BadgeHeight = H;
    //document.getElementById("image1").style.height = this.BadgeHeight + '%';
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
    this.dragevent = event;
    console.log("event", event);
    
    this.endOffset.x = event.x;

    this.endOffset.y = event.y;
    this.badge.setCoorx(this.endOffset.x);
    this.badge.setCoory(this.endOffset.y);

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
      

       this.finalx = (this.endOffset.x-this.BadgeWidth*4.10)/100;
     
        this.badge.setCoorFinal(this.endOffset.x, this.endOffset.y);
      
      

      this.router.navigate(["/products"]);
      this.spinner.hide();


    }, 1000);
  }

  slidervalue(value) {
    this.sliderval = value;
    this.opvalue = value / 100;

    //document.getElementById("image1").style.opacity = this.opvalue;

    this.badge.setOpval(this.opvalue);
    console.log("in slidervalue" + this.opvalue);
    console.log("get val" + this.badge.getOpval());


  }

  onloadFun() {
    console.log("onload");
    document.getElementById("image12").style.top = this.top+'px';
    document.getElementById("image12").style.left = this.left+'px';
  }




}