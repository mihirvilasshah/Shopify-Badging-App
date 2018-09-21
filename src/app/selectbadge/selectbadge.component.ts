import { Component, OnInit } from '@angular/core';
import { BadgeService } from '../badge.service';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute, Router, NavigationExtras} from "@angular/router";
import {  FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';

@Component({
  selector: 'app-selectbadge',
  templateUrl: './selectbadge.component.html',
  styleUrls: ['./selectbadge.component.scss']
})
export class SelectBadgeComponent implements OnInit {

  public uploader: FileUploader = new FileUploader({url: "http://localhost:3000/api/upload", itemAlias: 'photo'});

  constructor(private badge: BadgeService, private http: HttpClient, private router: Router) {
  }
  
  ngOnInit() {
    console.log("ngonInit");
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if(status){
        console.log('item', item,'status', status,'response', response);
         alert('File uploaded successfully');
      }
      else{
        alert("Error uploading a file");
      }   
     };
  };


  count1: number = 0;
  pic_name = "";
  customizeBadge():void {
     this.count1 = this.count1 + 1; 
     console.log(this.pic_name);
     
     let navigationExtras: NavigationExtras = {
      queryParams: {
         picName:this.pic_name
      }
  };
  this.router.navigate(["/customize"], navigationExtras);
  }


  public onTap() {
    console.log("inside on tap");
    var cursor = this.http.get("https://2db78424.ngrok.io/picture/");
    console.log(cursor);
    
  }

  // uploadPic(name){
 
 
  //   console.log('inside submit type of name'+name);
  //   this.http.post("https://5b326143.ngrok.io/uploadPic/",name);
  //   //this.badge.getProduct();
  // }

}