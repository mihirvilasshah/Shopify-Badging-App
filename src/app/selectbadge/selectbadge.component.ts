import { Component, OnInit } from '@angular/core';
import { BadgeService } from '../badge.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTabChangeEvent } from '@angular/material';
import { NgxSmartModalService } from 'ngx-smart-modal';
// import { AngularFileUploaderModule } from "angular-file-uploader";

@Component({
  selector: 'app-selectbadge',
  templateUrl: './selectbadge.component.html',
  styleUrls: ['./selectbadge.component.scss']
})
export class SelectBadgeComponent implements OnInit {

  libTab = true;
  UserTab = true;
  selectedIndex = 0;
  LibPictures=[];
  UserPictures=[];
  libCount=0;
  userCount=0;
  selectedindex=-1;
  lib=true;
  sel=false;

  public uploader: FileUploader = new FileUploader({ url: "http://localhost:3000/api/upload", itemAlias: 'photo' });

  constructor(private badge: BadgeService, private http: HttpClient, private router: Router, private spinner: NgxSpinnerService,public ngxSmartModalService: NgxSmartModalService) {
  }
 
  ngOnInit() {
    console.log("ngonInit");
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (status) {
        console.log('item', item, 'status', status, 'response', response);
        alert('File uploaded successfully');
      }
      else {
        alert("Error uploading a file");
      }

    };
    
    var count = 0;
    var ids = this.http.get("http://localhost:3000/getIDS");
    ids.subscribe(val => { console.log(val);
      var temp=Object.values(val);
      temp.forEach(pic =>
      {
        this.LibPictures.push("http://localhost:3000/picture/"+pic);
      })
    });

    var ids = this.http.get("http://localhost:3000/getUserIDS");
    ids.subscribe(val => { console.log(val);
      var temp=Object.values(val);
      temp.forEach(pic =>
      {
        this.UserPictures.push("http://localhost:3000/picture/"+pic);
      })
    }
      
  );

  };

 
  count1: number = 0;
  pic_name = "";
  customizeBadge(): void {
    console.log("inside customise badge");
    this.spinner.show();
    setTimeout(() => {
      this.count1 = this.count1 + 1;

      console.log("pic name" + this.pic_name);
      // console.log("ids"+this.ids);
      let navigationExtras: NavigationExtras = {
        queryParams: {
          picName: this.pic_name

        }
      };
      this.router.navigate(["/customize"], navigationExtras);
      this.spinner.hide();
    }, 1000);
  }


  public onTap() {
    console.log("inside on tap");
    var cursor = this.http.get("http://localhost:3000/picture/");
    console.log(cursor);

  }

  selectedPic(index:number,from:number): void {
    // debugger;
    
    if(!from){this.pic_name = this.LibPictures[index];
      this.lib=true;
      console.log(this.pic_name);}
      else{
        this.pic_name = this.UserPictures[index];
        this.lib= false;
      console.log(this.pic_name);
      }
    this.selectedindex=index;
    console.log("selected"+this.selectedindex);

      this.sel=true;
  }

  checkSelected(index:number): string {
    // debugger;

    if(index==this.selectedindex)
    return "green";
    else return "black";
      }

      deleteBadge(index:number): void {
        // debugger;
    console.log("delete in progress");
          }
    
    
  

 
}