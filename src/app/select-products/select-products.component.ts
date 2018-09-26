import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BadgeService } from '../badge.service';
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';

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
  pr: string;
  date1: string;
  date2: string;
  title1: string;
  selectedEntry;
  titles;
  pids;
  selected_image_src="";
  badgeCss="top-left";


  filterControl = new FormControl('', [Validators.required]);
  filters: filter[] = [
    { name: 'Price' },
    { name: 'Date' },
    { name: 'Title' },
  ];

 
  constructor(private badge: BadgeService, private route: ActivatedRoute, private spinner: NgxSpinnerService, private router: Router, private http: HttpClient) {
    // this.badge.getProduct();
    this.route.queryParams.subscribe(params => {
      if( params["picName"])
      this.selected_image_src = params["picName"];
      if(params["badgeCss"])
      this.badgeCss=params["badgeCss"];
   
      console.log(this.selected_image_src);
      console.log(this.badgeCss);
  });

  }

  ngOnInit() {
  }

  getPriceProd() {

    console.log(this.price1);
    // var result  =this.http.get("https://209f9b2b.ngrok.io/getProductPriceRange/"+this.price1+"/"+this.price2);

    let obs = this.http.get("https://209f9b2b.ngrok.io/getProductPriceRange/" + this.price1 + "/" + this.price2 + "/" + this.pr)
    obs.subscribe(data => {
      console.log("here is the response", data);

      var items = Object.values(data);
      this.titles = items[0];
      console.log("titles:", this.titles)

      this.pids = items[1];
      console.log("items:", items)
      var pids = data[pids];
    })



    // console.log(result);
  }

  getDateProd() {

    console.log(this.date1);
    let obs = this.http.get("https://209f9b2b.ngrok.io/getProductDateRange/" + this.date1 + "/" + this.date2)
    obs.subscribe(data => {
      console.log("here is the response", data);

      var items = Object.values(data);
      this.titles = items[0];
      console.log("titles:", this.titles)

      this.pids = items[1];
      console.log("items:", items)
      var pids = data[pids];
    })
  }

  getTitleProd() {

    console.log(this.title1);
    let obs = this.http.get("https://209f9b2b.ngrok.io/getProductTitle/" + this.title1)
    obs.subscribe(data => {
      console.log("here is the response", data);

      var items = Object.values(data);
      this.titles = items[0];
      console.log("titles:", this.titles);

      this.pids = items[1];
      console.log("items:", items)
      var pids = data[pids];

    })
  }

  onSelectionChange(entry) {
    this.selectedEntry = entry;
    console.log(this.selectedEntry);
  }



}
