import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BadgeService } from '../badge.service';
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { MultiSelectComponent, CheckBoxSelectionService } from '@syncfusion/ej2-ng-dropdowns';

export interface filter {
  name: string;
}


@Component({
  selector: 'app-remove-badges',
  templateUrl: './remove-badges.component.html',
  styleUrls: ['./remove-badges.component.scss']
})
export class RemoveBadgesComponent implements OnInit {

  // filters = ["Price","Date","Title"];

  price1;
  price2;
  date1: string;
  date2: string;
  title1: string;
  counter: number = 0;

  tr;
  dr;
  pr;

  selectedEntry;
  titles;
  pids;
  selectedids = [];
  selectedAll;
  prodData;

  selectedProducts = [];

  selected_image_src = "";
  badgeCss = "";

  structuredTitle = [];

  oneDeselect;

  applyTitle = false;
  countTitle = 0;
  applyPrice = false;
  countPrice = 0;
  applyDate = false;
  countDate = 0;





  filterControl = new FormControl('', [Validators.required]);
  filters: filter[] = [
    { name: 'Price' },
    { name: 'Date' },
    { name: 'Title' },
  ];


  constructor(private badge: BadgeService, private route: ActivatedRoute, private spinner: NgxSpinnerService, private router: Router, private http: HttpClient) {
    this.badge.getProduct();
    this.route.queryParams.subscribe(params => {
      if (params["picName"])
        this.selected_image_src = params["picName"];
      if (params["badgeCss"])
        this.badgeCss = params["badgeCss"];

      console.log(this.selected_image_src);
      console.log(this.badgeCss);
    });

  }

  ngOnInit() {
  }

  getPriceProd() {

    console.log(this.price1);
    // var result  =this.http.get("http://localhost:3000/getProductPriceRange/"+this.price1+"/"+this.price2);

    let obs = this.http.get("http://localhost:3000/getProductPriceRange/" + this.price1 + "/" + this.price2 + "/withBadges")
    obs.subscribe(data => {
      console.log("here is the response", data);
      console.log(this.pr);

      var items = Object.values(data);
      console.log("items:", items)
      this.titles = items[0];
      this.structuredTitle = [];
      this.titles.forEach(title => {
        this.structuredTitle.push({ name: title, selected: false });
      });
      console.log("titles:", this.titles);
      console.log("structuredTitle:", this.structuredTitle);

      this.pids = items[1];
      // var pids = data[pids];
      this.applyPrice = true;
    })



    // console.log(result);
  }

  applyPriceFn() {

    if (this.countPrice == 1) {
      this.applyPrice = false;  //!(this.applyPrice);
    }
    this.countPrice = 1;
    console.log("count: " + this.countPrice);

    if(this.price1 == 0){
      this.price1 = 0.01;
    }

  }

  getDateProd() {

    console.log(this.date1);
    let obs = this.http.get("http://localhost:3000/getProductDateRange/" + this.date1 + "/" + this.date2 + "/withBadges")
    obs.subscribe(data => {
      console.log("here is the response", data);
      console.log(this.dr);

      var items = Object.values(data);
      console.log("items:", items)
      this.titles = items[0];
      this.structuredTitle = [];
      this.titles.forEach(title => {
        this.structuredTitle.push({ name: title, selected: false });
      });
      console.log("titles:", this.titles);
      console.log("structuredTitle:", this.structuredTitle);

      this.pids = items[1];

      this.applyDate = true;

    })
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
    let obs = this.http.get("http://localhost:3000/getProductTitle/" + this.title1 + "/withBadges");
    obs.subscribe(data => {
      console.log("here is the response", data);
      console.log(this.tr);


      var items = Object.values(data);
      console.log("items:", items)
      this.titles = items[0];
      this.structuredTitle = [];
      this.titles.forEach(title => {
        this.structuredTitle.push({ name: title, selected: false });
      });
      console.log("titles:", this.titles);
      console.log("structuredTitle:", this.structuredTitle);

      this.pids = items[1];
      // var pids = data[pids];

      // this.prodData = data;
      // this.mode = 'CheckBox';
      // this.selectAllText = 'Select All';

      this.applyTitle = true;

    })
  }

  applyTitleFn() {

    if (this.countTitle == 1) {
      this.applyTitle = false;  //!(this.applyTitle);
    }
    this.countTitle = 1;
    console.log("count: " + this.countTitle);

  }

  giveid(flag, value) {

    if (this.selectedAll) {
      for (var i = 0; i < this.structuredTitle.length; i++) {
        this.structuredTitle[i].selected = this.selectedAll;
      }
      this.counter = this.structuredTitle.length;
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
    if (!this.selectedAll && this.counter == this.structuredTitle.length) {
      for (var i = 0; i < this.structuredTitle.length; i++) {
        this.structuredTitle[i].selected = this.selectedAll;
      }
      this.selectedids = [];
      this.counter = 0;
      console.log("selectedIDS (deselected all): " + this.selectedids);

    }
    else if (flag) {
      this.counter = this.counter + 1;

      // this.selectedids.push(value);
      this.selectedids.push(this.pids[value]);
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
    if (this.counter == this.structuredTitle.length)
      this.selectedAll = true;
    else
      this.selectedAll = false;
  }

  unpublish() {
    var id = this.selected_image_src.split("picture/");
    console.log(id);
    console.log(this.selectedids);

    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type':  'application/json'
    //     // 'Authorization': 'my-auth-token'
    //   })
    // };

    let obs = this.http.post("http://localhost:3000/unpublishBadges", { "pid": this.selectedids });
    obs.subscribe(data => {
      console.log("here is the response", data);

    })
    console.log("done");
  }

  


}
