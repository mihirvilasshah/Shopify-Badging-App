import { Component, OnInit, Output, EventEmitter, HostListener, Input } from '@angular/core';
import { BadgeService } from '../badge.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTabChangeEvent } from '@angular/material';
import { NgxSmartModalService } from 'ngx-smart-modal';
// import { AngularFileUploaderModule } from 'angular-file-uploader';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-selectbadge',
  templateUrl: './selectbadge.component.html',
  styleUrls: ['./selectbadge.component.scss']
})
export class SelectBadgeComponent implements OnInit {
  libTab = true;
  UserTab = true;
  selectedIndex = 0;
  LibPictures = [];
  UserPictures = [];
  libCount = 0;
  userCount = 0;
  selectedindex = -1;
  lib = true;
  sel = false;
  count1 = 0;
  pic_name = '';

  public uploader: FileUploader =
  new FileUploader({ url: 'http://localhost:4567/angular/api/upload/tricon-jewel-store', itemAlias: 'photo' });

  constructor(private badge: BadgeService, private http: HttpClient, private router: Router,
     private spinner: NgxSpinnerService, public ngxSmartModalService: NgxSmartModalService) {
       // this.sel = badge.sendMessage();
  }

  private fileList: any = [];
  onFilesChange(fileList: FileList) {
    this.fileList = fileList;
  }

  ngOnInit() {
    console.log('ngonInit');
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    // this.uploader.onAfterAddingAll(this.fileList);
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (status) {
        console.log('item', item, 'status', status, 'response', response);
        alert('File uploaded successfully');
        this.UserPictures = [];
        this.loadBadges();
        this.selectedindex = -1;
      }      else {
        alert('Error uploading a file');
      }
    };
    const count = 0;
    const ids = this.http.get('http://localhost:4567/angular/getMyLibrary/tricon-jewel-store');
    ids.subscribe(val => {
      const temp = Object.values(val);
      temp.forEach(pic => {
        this.LibPictures.push(pic);
      });

      console.log(this.LibPictures);
    });
    this.loadBadges();
    console.log('select badge' + this.badge.getBadgePic);

  }



  loadBadges(): void {

    // var ids = this.http.get('http://localhost:4567/angular/getUserIDS');
    // ids.subscribe(val => {
    //   console.log(val);
    //   var temp = Object.values(val);
    //   temp.forEach(pic => {
    //     this.UserPictures.push('http://localhost:4567/angular/picture/' + pic);
    //   })
    // })

    const ids = this.http.get('http://localhost:4567/angular/getMyBadges/tricon-jewel-store');
    console.log(ids);
    ids.subscribe(val => {
      const temp = Object.values(val);
      temp.forEach(pic => {
        this.UserPictures.push(pic);
      });

      console.log(this.UserPictures);
    });
  }




  customizeBadge(): void {
    console.log('inside customise badge');
    this.spinner.show();
    setTimeout(() => {
      this.count1 = this.count1 + 1;
      this.router.navigate(['/customize']);
      this.spinner.hide();
    }, 1000);
  }


  selectedPic(index: number, from: number): void {
        if (!from) {
      this.pic_name = this.LibPictures[index];
      this.lib = true;
      console.log(this.pic_name);
      this.badge.changeBadge(this.pic_name);

    }    else {
      this.pic_name = this.UserPictures[index];
      this.lib = false;
      console.log(this.pic_name);
      this.badge.changeBadge(this.pic_name);

    }
    // debugger;
    this.selectedindex = index;
    console.log('selected' + this.selectedindex);
    // debugger;
    this.sel = true;
    this.badge.sendMessage(this.sel);

  }



  deleteBadge(index: number): void {
    if (confirm('Are You sure you want to delete?')) {
      console.log('deletebadge front end');
      const x = this.UserPictures[index].imageSource.split('/image/');
      console.log(this.UserPictures[index].imageSource);
      console.log('x', x);
      const deleted = this.http.post('http://localhost:4567/angular/deleteUserBadge/tricon-jewel-store', { 'name': x[1] });
      // var deleted = this.http.post('http://localhost:4567/angular/deleteUserBadge/',{'id':'5ba4c859767a3337741a66e8'});

      deleted.subscribe(val => {
        console.log(val);
        // debugger;
        // console.log(val);
        if (val) {
          alert('badge deleted');
          // this.UserPictures=[];
          this.UserPictures.splice(index, 1);
          this.selectedindex = -1;
          this.sel = false;
          //  this.loadBadges();

        }

      }
      );
    }
  }

  up() {
    console.log(this.fileList);
    const obs = this.http.post('http://localhost:4567/angular/api/upload/tricon-jewel-store', { 'file': this.fileList });
    obs.subscribe(data => {
      console.log('here is the response', data);

    });
  }


}
