import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BadgeService } from '../badge.service';
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
// import { MultiSelectComponent, CheckBoxSelectionService } from '@syncfusion/ej2-ng-dropdowns';

export interface filter {
  name: string;
}

@Component({
  selector: 'app-select-products',
  templateUrl: './select-products.component.html',
  styleUrls: ['./select-products.component.scss']
})


export class SelectProductsComponent implements OnInit {

  // filters = ["Price","Date","Title"];

  price1;
  price2;
  date1: string;
  date2: string;
  title1: string;
  counter: number = 0;
  publishedNo: number = 0;
  tr;
  dr;
  pr;
  pr1;
  wb = "no";
  wob = "no";
  tag;

  selectedEntry;
  titles;
  pids;
  badges;
  selectedids = [];
  selectedAll;
  prodData;
  cities2 = [
    { id: 1, name: 'Vilnius' },
    { id: 2, name: 'Kaunas' },
    { id: 3, name: 'Pavilnys', disabled: true },
    { id: 4, name: 'Pabradė' },
    { id: 5, name: 'Klaipėda' }
  ];
  selectedProducts = [];

  selected_image_src = "";
  badgeCss = "";

  structuredTitle = [];
  showTitle = [];

  oneDeselect;

  applyTitle = false;
  countTitle = 0;
  applyTag = false;
  countTag = 0;
  applyPrice = false;
  countPrice = 0;
  applyDate = false;
  countDate = 0;
  msg = "";
  show = false;
  head = ['Title', 'ID', 'Badge Applied'];

  p: number = 1;

  filterControl = new FormControl('', [Validators.required]);
  filters: filter[] = [
    { name: 'Price' },
    { name: 'Date' },
    { name: 'Title' },
    { name: 'Tag' },
  ];
  opvalue;
  endOffset;
  tagArray;
  split = [];


  constructor(private badge: BadgeService, private route: ActivatedRoute, private spinner: NgxSpinnerService, private router: Router, private http: HttpClient, public ngxSmartModalService: NgxSmartModalService) {
    // this.badge.getProduct();
    // this.route.queryParams.subscribe(params => {
    //   if (params["picName"])
    //     this.selected_image_src = params["picName"];
    //   if (params["badgeCss"])
    //     this.badgeCss = params["badgeCss"];
    this.endOffset = badge.getCoor();
    this.opvalue = badge.getOpval();
    this.selected_image_src = badge.getBadgePic();
    // this.badgeCss=badge.getBadgeCss();
    console.log("select products badge name" + this.selected_image_src);
    console.log("select products x " + this.endOffset.x + " and y value " + this.endOffset.y);
    console.log("select products opval" + this.opvalue);
    // let cur = this.http.get("http://172.16.18.189:3000/shopdet")
    // cur.subscribe(data => {
    //   console.log("here is the response", data);
    //   var currency = data;
    // });
    let tag = this.http.get("http://172.16.18.189:3000/tags")
    tag.subscribe(data => {
      console.log("here is the response", data);
      this.tagArray = data;
      console.log(this.tagArray);
      var temp = [];
      for (var i = 0; i < this.tagArray.length; i++) {
        temp = this.tagArray[i].split(',');
        console.log(temp);
        for (var j = 0; j < temp.length; j++) {
          if (temp[j] != "")
            this.split.push(temp[j]);

        }
        temp = [];
      }
      console.log(this.split);
    });

    // console.log("select products badge css"+ this.badgeCss);

    // });

  }

  ngOnInit() {

  }

  withbadgeFn(flag) {
    if (flag) {
      this.wb = "yes";

    }
    else {
      this.wb = "no";
    }
    console.log("wb:  " + this.wb);
    if (this.wb == "yes" && this.wob == "yes") {
      this.showTitle = [];
      this.showTitle = this.structuredTitle;

    }
    if (this.wb == "yes" && this.wob == "no") {
      this.showTitle = [];
      for (var i = 0; i < +this.structuredTitle.length; i++) {
        if (this.structuredTitle[i].badges == "yes") {
          this.showTitle.push({ name: this.titles[i], selected: false, badges: this.badges[i], pids: this.pids[i] });
          console.log(this.showTitle);
        }
      }

    }
    if (this.wb == "no" && this.wob == "yes") {
      this.showTitle = [];
      for (var i = 0; i < +this.structuredTitle.length; i++) {
        if (this.structuredTitle[i].badges == "no") {
          this.showTitle.push({ name: this.titles[i], selected: false, badges: this.badges[i], pids: this.pids[i] });

        }
      }

    }
    if (this.wb == "no" && this.wob == "no") {
      this.showTitle = [];
      this.showTitle = this.structuredTitle;

    }



  }
  withoutbadgeFn(flag) {
    if (flag) {
      this.wob = "yes";

    }
    else {
      this.wob = "no";
    }
    console.log("wob:  " + this.wob);
    if (this.wb == "yes" && this.wob == "yes") {
      this.showTitle = [];
      this.showTitle = this.structuredTitle;

    }
    if (this.wb == "yes" && this.wob == "no") {
      this.showTitle = [];
      for (var i = 0; i < +this.structuredTitle.length; i++) {
        if (this.structuredTitle[i].badges == "yes") {

          this.showTitle.push({ name: this.titles[i], selected: false, badges: this.badges[i], pids: this.pids[i] });

        }
      }

    }
    if (this.wb == "no" && this.wob == "yes") {
      this.showTitle = [];
      for (var i = 0; i < +this.structuredTitle.length; i++) {
        if (this.structuredTitle[i].badges == "no") {
          this.showTitle.push({ name: this.titles[i], selected: false, badges: this.badges[i], pids: this.pids[i] });

        }
      }

    }
    if (this.wb == "no" && this.wob == "no") {
      this.showTitle = [];
      this.showTitle = this.structuredTitle;

    }





  }
  getPriceProd() {

    console.log(this.price1);
    // var result  =this.http.get("http://172.16.18.189:3000/getProductPriceRange/"+this.price1+"/"+this.price2);

    this.spinner.show();
    setTimeout(() => {

      let obs = this.http.get("http://172.16.18.189:3000/getProductPriceRange/" + this.price1 + "/" + this.price2 + "/all")
      obs.subscribe(data => {
        console.log("here is the response", data);
        console.log(this.pr);

        var items = Object.values(data);
        console.log("items:", items)
        this.titles = items[0];
        this.badges = items[2];
        this.pids = items[1];
        console.log("badhes:" + this.badges);
        console.log("pids:" + this.pids);
        // this.publishedNo=this.pids.length;

        this.structuredTitle = [];

        for (var i = 0; i < +this.titles.length; i++) {

          this.structuredTitle.push({ name: this.titles[i], selected: false, badges: this.badges[i], pids: this.pids[i] });
        }
        this.showTitle = this.structuredTitle;

        console.log("titles:", this.titles);
        console.log("structuredTitle:", this.structuredTitle);




        if (this.pids.length == 0) {
          this.msg = "No matches found."
          this.show = false;
        }
        if (this.pids.length > 0) {
          this.msg = ""
          this.show = true;
        }

        // var pids = data[pids];
        this.applyPrice = true;

        // this.show = true;


      })



      this.spinner.hide();
    }, 4000);
    // console.log(result);
  }

  applyPriceFn() {

    if (this.countPrice == 1) {
      this.applyPrice = false;  //!(this.applyPrice);
    }
    this.countPrice = 1;
    console.log("count: " + this.countPrice);

    if (this.price1 == 0) {
      this.price1 = 0.01;
    }
  }

  getDateProd() {

    console.log(this.date1);
    this.spinner.show();
    setTimeout(() => {
      let obs = this.http.get("http://172.16.18.189:3000/getProductDateRange/" + this.date1 + "/" + this.date2 + "/all")
      obs.subscribe(data => {
        console.log("here is the response", data);
        console.log(this.pr);

        var items = Object.values(data);
        console.log("items:", items)
        this.titles = items[0];
        this.badges = items[2];
        this.pids = items[1];
        console.log("badhes:" + this.badges);
        console.log("pids:" + this.pids);


        this.structuredTitle = [];

        for (var i = 0; i < +this.titles.length; i++) {

          this.structuredTitle.push({ name: this.titles[i], selected: false, badges: this.badges[i], pids: this.pids[i] });
        }
        this.showTitle = this.structuredTitle;

        console.log("titles:", this.titles);
        console.log("structuredTitle:", this.structuredTitle);


        if (this.pids.length == 0) {
          this.msg = "No matches found."
          this.show = false;
        }
        if (this.pids.length > 0) {
          this.msg = ""
          this.show = true;
        }
        // var pids = data[pids];
        this.applyDate = true;

        // this.show = true;

      })
      this.spinner.hide();
    }, 1000);
  }

  applyDateFn() {

    if (this.countDate == 1) {
      this.applyDate = false;  //!(this.applyDate);
    }
    this.countDate = 1;
    console.log("count: " + this.countDate);

  }

  public mode: string;
  public selectAllText: string;
  public fields: Object = { text: 'title', value: 'pid' };
  public placeholder: string = 'Select products';

  getTitleProd() {

    console.log(this.title1);
    this.spinner.show();
    setTimeout(() => {
      let obs = this.http.get("http://172.16.18.189:3000/getProductTitle/" + this.title1 + "/all");
      obs.subscribe(data => {
        console.log("here is the response", data);
        console.log(this.pr);

        var items = Object.values(data);
        console.log("items:", items)
        this.titles = items[0];
        this.badges = items[2];
        this.pids = items[1];
        console.log("badhes:" + this.badges);
        console.log("pids:" + this.pids);


        this.structuredTitle = [];

        for (var i = 0; i < +this.titles.length; i++) {

          this.structuredTitle.push({ name: this.titles[i], selected: false, badges: this.badges[i], pids: this.pids[i] });
        }
        this.showTitle = this.structuredTitle;

        console.log("titles:", this.titles);
        console.log("structuredTitle:", this.structuredTitle);



        if (this.pids.length == 0) {
          this.msg = "No matches found."
          this.show = false;
        }
        if (this.pids.length > 0) {
          this.msg = ""
          this.show = true;
        }
        // var pids = data[pids];
        this.applyTitle = true;

        // this.show = true;

      })

      this.spinner.hide();
    }, 1000);
  }

  applyTitleFn() {

    if (this.countTitle == 1) {
      this.applyTitle = false;  //!(this.applyTitle);
    }
    this.countTitle = 1;
    console.log("count: " + this.countTitle);

  }

  getTagProd() {

    console.log(this.title1);
    this.spinner.show();
    setTimeout(() => {
      let obs = this.http.get("http://172.16.18.189:3000/getProductTag/" + this.tag + "/all");
      obs.subscribe(data => {
        console.log("here is the response", data);
        console.log(this.pr);

        var items = Object.values(data);
        console.log("items:", items)
        this.titles = items[0];
        this.badges = items[2];
        this.pids = items[1];
        console.log("badhes:" + this.badges);
        console.log("pids:" + this.pids);


        this.structuredTitle = [];

        for (var i = 0; i < +this.titles.length; i++) {

          this.structuredTitle.push({ name: this.titles[i], selected: false, badges: this.badges[i], pids: this.pids[i] });
        }
        this.showTitle = this.structuredTitle;

        console.log("titles:", this.titles);
        console.log("structuredTitle:", this.structuredTitle);



        if (this.pids.length == 0) {
          this.msg = "No matches found."
          this.show = false;
        }
        if (this.pids.length > 0) {
          this.msg = ""
          this.show = true;
        }
        // var pids = data[pids];
        this.applyTag = true;

        // this.show = true;

      })

      this.spinner.hide();
    }, 1000);
  }

  applyTagFn() {

    if (this.countTag == 1) {
      this.applyTag = false;  //!(this.applyTitle);
    }
    this.countTag = 1;
    console.log("count: " + this.countTag);

  }

  giveid(flag, value) {

    if (this.selectedAll) {
      for (var i = 0; i < this.showTitle.length; i++) {
        this.showTitle[i].selected = this.selectedAll;
      }
      this.counter = this.showTitle.length;
      var index = this.selectedids.indexOf(value);
      console.log("value if: " + value);
      this.selectedids = [];
      for (var i = 0; i < this.pids.length; i++) {
        this.selectedids.push(this.pids[i]);
      }
      // this.selectedids.splice(index, 1);
      console.log("selectedIDS(selected all): " + this.selectedids);
      console.log("selectedAll value: " + this.selectedAll);
      // console.log("pid value if: " + this.pids);


    }
    if (!this.selectedAll && this.counter == this.showTitle.length) {
      for (var i = 0; i < this.showTitle.length; i++) {
        this.showTitle[i].selected = this.selectedAll;
      }
      this.selectedids = [];
      this.counter = 0;
      console.log("selectedIDS (deselected all): " + this.selectedids);

    }
    else if (flag) {
      this.counter = this.counter + 1;

      // this.selectedids.push(value);
      // var index = this.selectedids.indexOf(value);
      this.selectedids.push(value);
      console.log("flag true:" + this.selectedids);
      // console.log("pid value esle if: " + this.pids);
    }
    if (flag == false) {
      this.counter = this.counter - 1;

      var index = this.selectedids.indexOf(this.pids[value]);
      // this.selectedids.splice(value, 1);
      console.log("spliced: " + this.selectedids.splice(index, 1));
      console.log("if flag false:" + this.selectedids);
      // console.log("pid value else: " + this.pids);
    }

    console.log("flag: " + flag);
    console.log("value: " + value);

    console.log("COUNTER:" + this.counter)
    if (this.counter == this.showTitle.length)
      this.selectedAll = true;
    else
      this.selectedAll = false;
  }

  publish() {
    var id = this.selected_image_src.split("picture/");
    console.log(id);
    console.log(this.selectedids);

    this.spinner.show();
    setTimeout(() => {

      let obs = this.http.post("http://172.16.18.189:3000/publishBadges", { "bid": id[1], "xvalue": this.endOffset.x, "yvalue": this.endOffset.y, "opval": this.opvalue, "pid": this.selectedids });

      obs.subscribe(data => {
        if (data.hasOwnProperty('pid')) {
          this.publishedNo = data['pid'].length;
          console.log("publish", this.publishedNo);
        };

      })
      console.log("done");


      this.spinner.hide();
    }, 1000);

  }
}