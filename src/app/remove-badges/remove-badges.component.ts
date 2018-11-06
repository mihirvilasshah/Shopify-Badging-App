import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BadgeService } from '../badge.service';
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { IMyDpOptions } from 'mydatepicker';
// import { MultiSelectComponent, CheckBoxSelectionService } from '@syncfusion/ej2-ng-dropdowns';

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
  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'yyyy-mm-dd',
    width: '60%'
  };
  public model1: any;
  public model2: any; // = { date: { year:   2018, month: 12, day: 31 } }

  price1;
  price2;
  date1: string;
  date2: string;
  title1: string;
  counter: number = 0;
  unpublishedNo: number = 0;
  tr;
  dr;
  pr;
  pr1;
  tag;
  src = [];

  selectedEntry;
  titles;
  pids;
  badges = [];
  badge_selected = "true";
  selectedids = [];
  selectedbids = [];
  selectedAll;
  prodData;
  selectedbid = false;

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
  wb;
  wob;
  currency;
  tagArray;
  split = [];
  p: number = 1;
  tags;
  isApplied;
  created_At;
  prodsel = true;
  selectedFilter;

  filterControl = new FormControl('', [Validators.required]);
  filters: filter[] = [
    { name: 'Price' },
    { name: 'Created Date' },
    { name: 'Title' },
    { name: 'Tag' },
  ];


  constructor(private badge: BadgeService, private route: ActivatedRoute, private spinner: NgxSpinnerService, private router: Router, private http: HttpClient, public ngxSmartModalService: NgxSmartModalService) {
    // this.badge.getProduct();
    this.route.queryParams.subscribe(params => {
      if (params["picName"])
        this.selected_image_src = params["picName"];
      if (params["badgeCss"])
        this.badgeCss = params["badgeCss"];

      console.log(this.selected_image_src);
      console.log(this.badgeCss);
      let cur = this.http.get("http://localhost:3000/currency")
      cur.subscribe(dat => {
        console.log("here is the response", dat);
        this.currency = dat[0].currency;
      });
      let tag = this.http.get("http://localhost:3000/tags")
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
        let x = (tags) => this.split.filter((v, i) => this.split.indexOf(v) === i)
        x(this.split);
        this.split = x(this.split);
        console.log(this.split);
        console.log(x(this.split));

      });



    });

  }

  ngOnInit() {

  }


  getPriceProd() {

    console.log(this.price1);
    // var result  =this.http.get("http://localhost:3000/getProductPriceRange/"+this.price1+"/"+this.price2);

    this.spinner.show();
    setTimeout(() => {

      let obs = this.http.get("http://localhost:3000/getProductPriceRange/" + this.price1 + "/" + this.price2 + "/withBadges")
      obs.subscribe(data => {
        console.log("here is the response", data);
        console.log(this.pr);

        var items = Object.values(data);
        console.log("items:", items)
        this.titles = items[0];
        var temp_badges = items[2];
        this.src = items[6];
        console.log(temp_badges);
        for (var i = 0; i < temp_badges.length; i++) {
          var temparray = temp_badges[i];
          var tempsrc = this.src[i];
          var a1 = [];
          for (var j = 0; j < temparray.length; j++) {

            a1.push({ "badg": temparray[j], "selected": false, "src": tempsrc[j] });

          }

          this.badges.push(a1);
        }
        console.log("this.badges");
        console.log(this.badges);

        this.pids = items[1];
        this.tags = items[3];
        this.created_At = items[4];
        this.isApplied = items[5];



        this.structuredTitle = [];
        self["items"] = items;
        var x;
        for (var i = 0; i < +this.titles.length; i++) {

          var a = {
            name: items[0][i], selected: false, pids: items[1][i], tags: items[3][i], created_at: items[4][i], isApplied: items[5][i], badges: this.badges[i], src: this.src[i]
          }
          this.structuredTitle.push(a);
        }


        this.showTitle = this.structuredTitle;

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

        console.log("titles:", this.titles);
        console.log("structuredTitle:", this.structuredTitle);


      })

      this.spinner.hide();
    }, 4000);
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
      let obs = this.http.get("http://localhost:3000/getProductDateRange/" + this.model1.formatted + "/" + this.model2.formatted + "/withBadges")
      obs.subscribe(data => {
        console.log("here is the response", data);
        console.log(this.pr);

        var items = Object.values(data);
        console.log("items:", items)
        this.titles = items[0];
        var temp_badges = items[2];
        this.src = items[6];
        console.log(temp_badges);
        for (var i = 0; i < temp_badges.length; i++) {
          var temparray = temp_badges[i];
          var tempsrc = this.src[i];
          var a1 = [];
          for (var j = 0; j < temparray.length; j++) {

            a1.push({ "badg": temparray[j], "selected": false, "src": tempsrc[j] });

          }

          this.badges.push(a1);
        }

        this.pids = items[1];
        this.tags = items[3];
        this.created_At = items[4];
        this.isApplied = items[5];


        this.structuredTitle = [];
        self["items"] = items;
        var x;
        for (var i = 0; i < +this.titles.length; i++) {

          var a = {
            name: items[0][i], selected: false, pids: items[1][i], tags: items[3][i], created_at: items[4][i], isApplied: items[5][i], badges: this.badges[i], src: this.src[i]
          }
          this.structuredTitle.push(a);
        }


        this.showTitle = this.structuredTitle;

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

        console.log("titles:", this.titles);
        console.log("structuredTitle:", this.structuredTitle);


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
      let obs = this.http.get("http://localhost:3000/getProductTitle/" + this.title1 + "/withBadges");
      obs.subscribe(data => {


        var items = Object.values(data);

        var self = this;
        console.log("items:", items)
        this.titles = items[0];
        var temp_badges = items[2];
        this.src = items[6];
        console.log(temp_badges);
        for (var i = 0; i < temp_badges.length; i++) {
          var temparray = temp_badges[i];
          var tempsrc = this.src[i];
          var a1 = [];
          for (var j = 0; j < temparray.length; j++) {

            a1.push({ "badg": temparray[j], "selected": false, "src": tempsrc[j] });

          }

          this.badges.push(a1);
        }

        this.pids = items[1];
        this.tags = items[3];
        this.created_At = items[4];
        this.isApplied = items[5];


        this.structuredTitle = [];
        self["items"] = items;
        var x;
        for (var i = 0; i < +this.titles.length; i++) {

          var a = {
            name: items[0][i], selected: false, pids: items[1][i], tags: items[3][i], created_at: items[4][i], isApplied: items[5][i], badges: this.badges[i], src: this.src[i]
          }
          this.structuredTitle.push(a);
        }


        this.showTitle = this.structuredTitle;

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

        console.log("titles:", this.titles);
        console.log("structuredTitle:", this.structuredTitle);


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
      let obs = this.http.get("http://localhost:3000/getProductTag/" + this.tag + "/withBadges");
      obs.subscribe(data => {
        console.log("here is the response", data);
        console.log(this.pr);

        var items = Object.values(data);
        console.log("items:", items)
        console.log("items:", items)
        this.titles = items[0];
        var temp_badges = items[2];
        this.src = items[6];
        console.log(temp_badges);
        for (var i = 0; i < temp_badges.length; i++) {
          var temparray = temp_badges[i];
          var tempsrc = this.src[i];
          var a1 = [];
          for (var j = 0; j < temparray.length; j++) {

            a1.push({ "badg": temparray[j], "selected": false, "src": tempsrc[j] });

          }

          this.badges.push(a1);
        }

        this.pids = items[1];
        this.tags = items[3];
        this.created_At = items[4];
        this.isApplied = items[5];


        this.structuredTitle = [];
        self["items"] = items;
        var x;
        for (var i = 0; i < +this.titles.length; i++) {

          var a = {
            name: items[0][i], selected: false, pids: items[1][i], tags: items[3][i], created_at: items[4][i], isApplied: items[5][i], badges: this.badges[i], src: this.src[i]
          }
          this.structuredTitle.push(a);
        }


        this.showTitle = this.structuredTitle;

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

        console.log("titles:", this.titles);
        console.log("structuredTitle:", this.structuredTitle);


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
  givebid(flag, value) {

    console.log("givebid" + value + flag);
    var x = value.split(",");
    var value1 = x[0];
    var index = this.selectedids.findIndex(x => x.prodid == value1);
    console.log(index);
    console.log(x[1]);
    //this.selectedids[index].bid.splice(index, 1);
    console.log(this.selectedids[index].bid);
    if (!flag) {
      var index1 = this.selectedids[index].bid.indexOf(x[1]);
      this.selectedids[index].bid.splice(index1, 1);
    }
    if (flag) {

      this.selectedids[index].bid.push(x[1]);
    }
    console.log(this.selectedids);




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
        //var x = this.badges[i].split("picture/"); 
        console.log("x", this.badges[i]);
        this.selectedids.push({ "prodid": this.pids[i], "bid": this.badges[i].badg  });
        this.badges[i].selected = true;
      }
      // this.selectedids.splice(index, 1);
      console.log("selectedIDS(selected all): ")
      console.log(this.selectedids);
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

      console.log("flag true:" + this.selectedids);

      this.prodsel = false;

      var index = this.showTitle.findIndex(x => x.pids == value);

      console.log(index);
      var b = [];
      for (var i = 0; i < this.showTitle[index].badges.length; i++) {

        b.push(this.showTitle[index].badges[i].badg);
        this.showTitle[index].badges[i].selected = true;
      }

      this.selectedids.push({ "prodid": value, "bid": b });
      console.log("badges values")
      console.log(b);
      console.log(this.selectedids);


      // console.log("pid value esle if: " + this.pids);
    }
    if (flag == false) {
      this.counter = this.counter - 1;
      var index1 = this.showTitle.findIndex(x => x.pids == value);
      this.prodsel = true;


      for (var i = 0; i < this.showTitle[index1].badges.length; i++) {


        this.showTitle[index1].badges[i].selected = false;
      }

      var index = this.selectedids.findIndex(x => x.prodid == value);
      console.log("index " + index);

      // this.selectedids.splice(value, 1);
      console.log("spliced: " + this.selectedids.splice(index, 1));
      console.log("after removing");

      console.log(this.selectedids);
      //console.log(this.selectedids[0].prodid);
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

  // selectAllProd() {

  //   // if (this.selectedAll) {
  //   //   this.selectedids = this.pids;
  //   //   console.log("selectedids if (All):" + this.selectedids);

  //   // }
  //   // else {
  //   //   // var len = this.selectedids.length;
  //   //   // console.log("length: "+len);
  //   //   // this.selectedids.splice(0, len);
  //   //   this.selectedids = [];
  //   //   console.log("selectedids else (Deselect all):" + this.selectedids);
  //   //   console.log("pid value else(Deselect all): " + this.pids);
  //   // }

  //   // if(this.oneDeselect){

  //   for (var i = 0; i < this.structuredTitle.length; i++) {
  //     this.structuredTitle[i].selected = this.selectedAll;
  //   }

  //   if (this.selectedAll) {
  //     this.selectedids = [];
  //     for (var i = 0; i < this.pids.length; i++) {
  //       this.selectedids.push(this.pids[i]);
  //     }

  //   } else {
  //     this.selectedids = [];
  //   }
  // // }
  // }

  // selector(){
  //   this.counter=0;
  //   for(var i =0; i<this.structuredTitle.length;i++){
  //     if(this.structuredTitle[i].selected==true){
  //       this.counter=this.counter+1;}
  //   }
  //   console.log("COUNTER:"+this.counter)
  //   if(this.counter==this.structuredTitle.length)
  //   this.selectedAll=true;
  //   else
  //   this.selectedAll=false;
  // }

  // selectAll() {
  //   for (var i = 0; i < this.titles.length; i++) {
  //     this.titles[i].selected = this.selectedAll;
  //     console.log("h");
  //   }
  // }

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

    let obs = this.http.post("http://localhost:3000/unpublishBadges", { "pid": this.selectedids ,"filter":this.selectedFilter});
    obs.subscribe(data => {
      if (data.hasOwnProperty('pid')) {
        console.log("in unpublish");
        this.unpublishedNo = data['pid'].length;
      }
    })

    console.log("publish", this.unpublishedNo);
  }
};



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