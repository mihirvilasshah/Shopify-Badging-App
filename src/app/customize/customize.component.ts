import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BadgeService } from '../badge.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

export interface Position {
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


  selected_image_src = '';
  pic_name = '';
  badge_css = 'top-left';
  top = 200;
  finalx;
  finaly;
  left = 0;
  css = 'top-left';
  dragevent;
  top1 = true;
  pos = false; // [disabled]='!pos' for NEXT
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
  endOffset = {x: 0, y: 0};
  img1 = { x: 0, y: 0 };
  img1x = 0;
  img1y = 0;
  imgW = 15;
  imgH = 15;
  imgR = 0;

  position = 'drag';
  BadgeSize = 15;
  BorderRadius = 0;



  constructor(private badge: BadgeService, private route: ActivatedRoute, private spinner: NgxSpinnerService, private router: Router) {
    // this.badge.getProduct();
    this.selected_image_src = badge.getBadgePic();

    this.endOffset.x = badge.getCoorx();
    this.endOffset.y = badge.getCoory();
    console.log('constructor-endoffset', this.endOffset);


    // this.endOffset = badge.getCoor2();



    this.top = this.endOffset.x;
    this.left = this.endOffset.y;
    this.opvalue = badge.getOpval();
    this.sliderval = this.opvalue * 100;
    this.BadgeSize = badge.getBadgeSize();
    this.BorderRadius = badge.getBorderRadius();
    console.log('customize badge pic ' + this.selected_image_src);
    console.log('customize x and y value' + this.endOffset.x + ' ' + this.endOffset.y);
    console.log('customize opval ' + this.opvalue);

    // console.log('customize badge css '+this.badge_css);
    // console.log('position'+this.css);

  }
  leftpx() {
    const x = this.endOffset.x;
    // this.endOffset.x = this.img1x;
    console.log(x);
    this.badge.setCoorx(this.endOffset.x);

  }
  toppx() {
    const y = this.endOffset.y;
    console.log(y);
  }
  BorderRadius1() {
    this.badge.setBorderRadius(this.BorderRadius);
  }

  BadgeSizer() {

    this.badge.setBadgeSize(this.BadgeSize);
  }
  onStart(event) {
    console.log('started output:', event);
  }

  onStop(event, id) {
    console.log('stopped output:', event);
    console.log('id:' + id);

  }



  onMoveEnd(event) {
    this.dragevent = event;
    console.log('event', event);
    this.endOffset.x = event.x;
    this.endOffset.y = event.y;
    this.badge.setCoorx(this.endOffset.x);
    this.badge.setCoory(this.endOffset.y);
  }

  // positionControl = new FormControl('', [Validators.required]);

  // positions: position[] = [
  //   { name: 'top-right' },
  //   { name: 'top-left' },
  //   { name: 'bottom-left' },
  //   { name: 'bottom-right' },
  // ];

  selectProducts() {
    console.log('inside selectProducts');
    this.spinner.show();
    setTimeout(() => {
        this.badge.setCoorFinal(this.endOffset.x, this.endOffset.y);
      this.router.navigate(['/products']);
      this.spinner.hide();
    }, 1000);
  }
  slidervalue(value) {
    this.sliderval = value;
    this.opvalue = value / 100;
    this.badge.setOpval(this.opvalue);
    console.log('in slidervalue' + this.opvalue);
    console.log('get val' + this.badge.getOpval());
  }

  onloadFun() {
    console.log('onload');
    document.getElementById('image12').style.top = this.top + 'px';
    document.getElementById('image12').style.left = this.left + 'px';
  }
}
