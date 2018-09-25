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
  selector: 'app-select-products',
  templateUrl: './select-products.component.html',
  styleUrls: ['./select-products.component.scss']
})


export class SelectProductsComponent implements OnInit {

  // filters = ["Price","Date","Title"];

  price1: string;
  price2: string;
  date1: string;
  date2: string;
  title1: string;

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

    let obs = this.http.get("http://localhost:3000/getProductPriceRange/" + this.price1 + "/" + this.price2 + "/" + this.pr)
    obs.subscribe(data => {
      console.log("here is the response", data);
      console.log(this.pr);

      var items = Object.values(data);
      this.titles = items[0];
      console.log("titles:", this.titles)

      this.pids = items[1];
      console.log("items:", items)
      // var pids = data[pids];
    })



    // console.log(result);
  }

  getDateProd() {

    console.log(this.date1);
    let obs = this.http.get("http://localhost:3000/getProductDateRange/" + this.date1 + "/" + this.date2+ "/" + this.dr)
    obs.subscribe(data => {
      console.log("here is the response", data);
      console.log(this.dr);

      var items = Object.values(data);
      console.log("items:", items)
      this.titles = items[0];
      console.log("titles:", this.titles)

      this.pids = items[1];
      // var pids = data[pids];
    })
  }

  public mode: string;
  public selectAllText: string;
  public fields: Object = { text: 'title', value: 'pid' };
  public placeholder: string = 'Select products';

  getTitleProd() {

    console.log(this.title1);
    let obs = this.http.get("http://localhost:3000/getProductTitle/" + this.title1 + "/" + this.tr);
    obs.subscribe(data => {
      console.log("here is the response", data);
      console.log(this.tr);


      var items = Object.values(data);
      console.log("items:", items)
      this.titles = items[0];
      console.log("titles:", this.titles);

      this.pids = items[1];
      // var pids = data[pids];

      // this.prodData = data;
      // this.mode = 'CheckBox';
      // this.selectAllText = 'Select All';

    })
  }

  giveid(flag, value) {

    if (flag) {

      this.selectedids.push(value);
      console.log(this.selectedids);
    }
    else {
      var index = this.selectedids.indexOf(value);
      this.selectedids.splice(index, 1);
      console.log(this.selectedids);
    }

    console.log(flag);
    console.log(value);
  }

  selectAll() {
    for (var i = 0; i < this.titles.length; i++) {
      this.titles[i].selected = this.selectedAll;
      console.log("h");
    }
  }

  publish() {
    var id = this.selected_image_src.split("picture/");
    console.log(id);
    console.log(this.selectedids);

    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type':  'application/json'
    //     // 'Authorization': 'my-auth-token'
    //   })
    // };

    let obs = this.http.post("http://localhost:3000/publishBadges", { "bid": id[1], "css": this.badgeCss, "pid": this.selectedids });
    obs.subscribe(data => {
      console.log("here is the response", data);

    })
    console.log("done");
  }

  // with(value){

  //    this.tr = value

  // }


  // onSelectionChange(entry) {
  //   this.selectedEntry = entry;
  //   console.log(this.selectedEntry);
  // }

  // getAllSelectedProducts() {
  //   var selectedProducts = [];

  //   var selectedCheckboxes = document.querySelectorAll('input[name="products"]:checked');
  //   console.log(selectedCheckboxes);
  //   var selectedProductscount = selectedCheckboxes.length;
  //   console.log(selectedProductscount);

  //   for (var i = 0; i < selectedProductscount; i++) {
  //     console.log(selectedCheckboxes[i]);
  //     selectedProducts.push(selectedCheckboxes[i]);
  //     console.log(selectedProducts);
  //   }
  // }



}
