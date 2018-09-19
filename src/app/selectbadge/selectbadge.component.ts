import { Component, OnInit } from '@angular/core';
import { BadgeService } from '../badge.service';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-selectbadge',
  templateUrl: './selectbadge.component.html',
  styleUrls: ['./selectbadge.component.scss']
})
export class SelectBadgeComponent implements OnInit {

  customer = { id: 1, name: 'Ms. Mary', age: 23 };
 
  constructor(private badge: BadgeService, private http: HttpClient, private router: Router) {
  }
  ngOnInit() {

  };

  count1: number = 0;

  customizeBadge():void {
     this.count1 = this.count1 + 1; 
     console.log('in');
  }

  uploadPic(name){
    console.log('inside submit type of name'+name);
    this.http.post("https://1d977961.ngrok.io/uploadPic/",name);
    //this.badge.getProduct();
  }

}