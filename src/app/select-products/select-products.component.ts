import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BadgeService } from '../badge.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { IMyDpOptions } from 'mydatepicker';
// import { MultiSelectComponent, CheckBoxSelectionService } from '@syncfusion/ej2-ng-dropdowns';

export interface Filter {
  name: string;
}

@Component({
  selector: 'app-select-products',
  templateUrl: './select-products.component.html',
  styleUrls: ['./select-products.component.scss']
})


export class SelectProductsComponent implements OnInit {

  // filters = ['Price','Date','Title'];
  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'yyyy-mm-dd',
    width: '60%'
  };
  public model1: any;
  public model2: any; // = { date: { year: 2018, month: 12, day: 31 } }

  price1;
  price2;
  date1: string;
  date2: string;
  title1: string;
  counter = 0;
  publishedNo = 0;
  tr;
  dr;
  tempvalues = [];
  pr;
  pr1;
  wb = 'no';
  wob = 'no';
  tag;
  namespace;
  NSarray = [];
  keyArray = [];
  filtername;
  valueArray = [];
  value;
  variantsId;
  selectedEntry;
  variants;
  titles;
  pids;
  isApplied;
  tags;
  MF;
  abid;
  price;
  created_At;
  thumbnail;
  src = [];
  badges;
  selectedFilter;
  selectedids = [];
  selectedVids = [];
  selectedAll;
  prodData;
  selectedProducts = [];

  selected_image_src;
  badgeCss = '';

  structuredTitle = [];
  showTitle = [];

  oneDeselect;
  discount;
  applyTitle = false;
  countTitle = 0;
  applyTag = false;
  applyNs = false;
  applykey = false;
  applyvalue = false;
  countTag = 0;
  countns = 0;
  applyPrice = false;
  countPrice = 0;
  applyDate = false;
  applyDisc = false;
  countDate = 0;
  keysSelected = [];
  countDisc = 0;
  msg = '';
  show = false;
  head = ['Title', 'ID', 'Badge Applied'];

  p = 1;

  filterControl = new FormControl('', [Validators.required]);
  filters: Filter[] = [
    { name: 'Price' },
    { name: 'Created Date' },
    { name: 'Title' },
    { name: 'Tag' },
    {name : 'MetaFields'},
  ];
  opvalue;
  endOffset;
  tagArray;
  split = [];
  currency;
  BadgeWidth;
  BadgeSize;
  BorderRadius;


  constructor(private badge: BadgeService, private route: ActivatedRoute,
     private spinner: NgxSpinnerService, private router: Router,
      private http: HttpClient, public ngxSmartModalService: NgxSmartModalService) {
    this.endOffset = badge.getCoorFinal();
    this.opvalue = badge.getOpval();
    this.selected_image_src = badge.getBadgePic();
    this.BadgeSize = badge.getBadgeSize();
    this.BorderRadius = badge.getBorderRadius();
    // this.badgeCss=badge.getBadgeCss();
    console.log('select products badge name' + this.selected_image_src.thumbnailSource);
    console.log('select products x ' + this.endOffset.x + ' and y value ' + this.endOffset.y);
    console.log('select products opval' + this.opvalue);
    // let cur = this.http.get('http://localhost:4567/angular/shopdet')
    // cur.subscribe(data => {
    //   console.log('here is the response', data);
    //   var currency = data;
    // });
    const tag = this.http.get('http://localhost:4567/angular/tags/tricon-jewel-store');
    tag.subscribe(data => {
      console.log('here is the response', data);
      this.tagArray = data;
      // console.log(this.tagArray);
      let  temp = [];
      for (let i = 0; i < this.tagArray.length; i++) {
        temp = this.tagArray[i].split(',');
        // console.log(temp);
        for (let j = 0; j < temp.length; j++) {
          if (temp[j] !== '') {
            this.split.push(temp[j]);
          }
        }
        temp = [];
      }
      const x = (tags) => this.split.filter((v, i) => this.split.indexOf(v) === i);
      x(this.split);
      this.split = x(this.split);
      // console.log(this.split);
      // console.log(x(this.split));

    });

    const cur = this.http.get('http://localhost:4567/angular/currency/tricon-jewel-store');
    cur.subscribe(dat => {
      console.log('here is the response', dat);
      this.currency = dat[0].currency;
    });
    const metaFields = this.http.get('http://localhost:4567/angular/metafields/tricon-jewel-store');
    metaFields.subscribe(dat => {
      console.log('here is the response', dat);
       this.MF = dat;
       console.log(this.MF);
       for (const m of this.MF) {
 // this.NSarray.push(m.namespace);
 this.keyArray.push(m.key);
 this.valueArray.push(m.value);
       }
      //  console.log(this.NSarray);
      //  const x = (ns) => this.NSarray.filter((v, i) => this.NSarray.indexOf(v) === i);
      //  x(this.NSarray);
      //  this.NSarray = x(this.NSarray);
    });
  }

  ngOnInit() {

  }
  onSelect() {

    this.router.navigate(['/badge']);
    this.badge.sendMessage(false);
    console.log('working');
  }
  onSelect1() {

    // this.router.navigate(['/products']);
    if (this.selectedFilter === 'Price') {
      this.getPriceProd();
 }
    // else if (this.selectedFilter === 'Discount') {
    //   this. getDiscountProd();
    // }
    else if (this.selectedFilter === 'Created Date') {
      this.getDateProd();
    } else if (this.selectedFilter === 'Title') {
      this.getTitleProd();
    } else if (this.selectedFilter === 'Tag') {
      this.getTagProd();
    } else if (this.selectedFilter === 'meatafield') {
      // this.getmetaFields();
    }

    console.log('working');

  }
  givekey(flag, value) {
    console.log(value);
    if (flag) {
  this.keysSelected.push(value);
  this.filters.push({name: value});
} else {
  const index = this.keysSelected.indexOf(value);
  const index1 = this.filters.indexOf({name: value});
this.keysSelected.splice(index, 1);
this.filters.splice(index1, 1);

}
console.log(this.keysSelected);
}
  withbadgeFn(flag) {
    if (flag) {
      this.wb = 'yes';

    }   else {
      this.wb = 'no';
    }
    console.log('wb:  ' + this.wb);
    if (this.wb === 'yes' && this.wob === 'yes') {
      this.showTitle = [];
      this.showTitle = this.structuredTitle;

    }
    if (this.wb === 'yes' && this.wob === 'no') {
      this.showTitle = [];
      for (let i = 0; i < +this.structuredTitle.length; i++) {
        if (this.structuredTitle[i].isApplied === 'yes') {
          this.showTitle.push({ name: this.titles[i], selected: false,
             badges: this.badges[i], pids: this.pids[i], tags: this.tags[i],
              created_at: this.created_At[i], isApplied: this.isApplied[i], src: this.src[i], variants: this.variants[i] });
          console.log(this.showTitle);
        }
      }

    }
    if (this.wb === 'no' && this.wob === 'yes') {
      this.showTitle = [];
      for (let i = 0; i < +this.structuredTitle.length; i++) {
        if (this.structuredTitle[i].isApplied === 'no') {
          this.showTitle.push({ name: this.titles[i], selected: false,
             badges: this.badges[i], pids: this.pids[i], tags: this.tags[i],
              created_at: this.created_At[i], isApplied: this.isApplied[i], src: this.src[i], variants: this.variants[i] });

        }
      }

    }
    if (this.wb === 'no' && this.wob === 'no') {
      this.showTitle = [];
      this.showTitle = this.structuredTitle;

    }



  }
  filtereName(filter) {
    for (let i = 0; i < this.keyArray.length; i++) {
if (this.keyArray[i] === filter) {
  // const index = this.MF.indexof(filter);
this.tempvalues.push(this.valueArray[i]);
}
    }
this.filtername = filter;

console.log(filter);
  }
  withoutbadgeFn(flag) {
    if (flag) {
      this.wob = 'yes';

    }    else {
      this.wob = 'no';
    }
    console.log('wob:  ' + this.wob);
    if (this.wb === 'yes' && this.wob === 'yes') {
      this.showTitle = [];
      this.showTitle = this.structuredTitle;

    }
    if (this.wb === 'yes' && this.wob === 'no') {
      this.showTitle = [];
      for (let i = 0; i < +this.structuredTitle.length; i++) {
        if (this.structuredTitle[i].isApplied === 'yes') {

          this.showTitle.push({ name: this.titles[i], selected: false,
            badges: this.badges[i], pids: this.pids[i], tags: this.tags[i],
             created_at: this.created_At[i], isApplied: this.isApplied[i],
             src: this.src[i], variants: this.variants[i] });

        }
      }

    }
    if (this.wb === 'no' && this.wob === 'yes') {
      this.showTitle = [];
      for (let i = 0; i < +this.structuredTitle.length; i++) {
        if (this.structuredTitle[i].isApplied === 'no') {
          this.showTitle.push({ name: this.titles[i], selected: false,
             badges: this.badges[i], pids: this.pids[i], tags: this.tags[i],
              created_at: this.created_At[i], isApplied: this.isApplied[i],
               src: this.src[i], variants: this.variants[i] });

        }
      }

    }
    if (this.wb === 'no' && this.wob === 'no') {
      this.showTitle = [];
      this.showTitle = this.structuredTitle;

    }
  }
  getDiscountProd() {
    // var result  =this.http.get('http://localhost:4567/angular/getProductPriceRange/'+this.price1+'/'+this.price2);

    this.spinner.show();
    setTimeout(() => {

      const obs = this.http.get('http://localhost:4567/getproducts/getProductDiscountRange/tricon-jewel-store/' + this.discount + '/all');
      obs.subscribe(data => {
        console.log('here is the response', data);
        console.log(this.pr);

        const items = Object.values(data);
        console.log('items:', items);
        this.titles = items[0];
        this.badges = items[2];

        this.pids = items[1];
        this.tags = items[3];
        this.created_At = items[4];
        this.isApplied = items[5];
        this.variants = items[7];
        this.variantsId = items[8];
        this.src = items[6];
        console.log('multiple badges', this.badges);


        this.structuredTitle = [];
        self['items'] = items;

        for (let i = 0; i < +this.titles.length; i++) {

          const a = {

            name: items[0][i], selected: false, pids: items[1][i], tags: items[3][i],
            created_at: items[4][i], isApplied: items[5][i], badges: this.badges[i],
             src: this.src[i], variants: this.variants[i], variantsId: this.variantsId[i]
          };
          this.structuredTitle.push(a);
          console.log('src:' + items[6][i]);
          console.log('vids:' + this.variantsId);
        }


        this.showTitle = this.structuredTitle;

        if (this.pids.length === 0) {
          this.msg = 'No matches found.';
          this.show = false;
        }
        if (this.pids.length > 0) {
          this.msg = '';
          this.show = true;
        }
        // var pids = data[pids];
        this.applyTitle = true;

        console.log('titles:', this.titles);
        console.log('structuredTitle:', this.structuredTitle);


      });

      this.spinner.hide();
    }, 4000);
  }
  getPriceProd() {

    console.log(this.price1);
    // var result  =this.http.get('http://localhost:4567/angular/getProductPriceRange/'+this.price1+'/'+this.price2);

    this.spinner.show();
    setTimeout(() => {

      const obs =
       this.http.get('http://localhost:4567/getproducts/getProductPriceRange/tricon-jewel-store/'
       + this.price1 + '/' + this.price2 + '/all');
      obs.subscribe(data => {
        console.log('here is the response', data);
        console.log(this.pr);

        const items = Object.values(data);
        console.log('items:', items);
        this.titles = items[0];
        this.badges = items[2];

        this.pids = items[1];
        this.tags = items[3];
        this.created_At = items[4];
        this.isApplied = items[5];
        this.variants = items[7];
        this.variantsId = items[8];
        this.src = items[6];
        console.log('multiple badges', this.badges);


        this.structuredTitle = [];
        self['items'] = items;
       // const x;
        for (let i = 0; i < +this.titles.length; i++) {

          const a = {

            name: items[0][i], selected: false, pids: items[1][i], tags: items[3][i],
            created_at: items[4][i], isApplied: items[5][i], badges: this.badges[i],
             src: this.src[i], variants: this.variants[i], variantsId: this.variantsId[i]
          };
          this.structuredTitle.push(a);
          console.log('src:' + items[6][i]);
          console.log('vids:' + this.variantsId);
        }


        this.showTitle = this.structuredTitle;

        if (this.pids.length === 0) {
          this.msg = 'No matches found.';
          this.show = false;
        }
        if (this.pids.length > 0) {
          this.msg = '';
          this.show = true;
        }
        // var pids = data[pids];
        this.applyTitle = true;

        console.log('titles:', this.titles);
        console.log('structuredTitle:', this.structuredTitle);


      });

      this.spinner.hide();
    }, 4000);
  }

  applyPriceFn() {

    if (this.countPrice === 1) {
      this.applyPrice = false;
    }
    this.countPrice = 1;
    console.log('count: ' + this.countPrice);

    if (this.price1 === 0) {
      this.price1 = 0.01;
    }
  }

  getDateProd() {

    console.log(this.date1);
    this.spinner.show();
    setTimeout(() => {
      const obs = this.http.get('http://localhost:4567/getproducts/getProductDateRange/tricon-jewel-store/' +
       this.model1.formatted + '/' +
        this.model2.formatted + '/all');
      obs.subscribe(data => {
        console.log('here is the response', data);
        // console.log('date', this.date1);
        console.log('dateModel', this.model1.formatted);
        console.log('dateModel2', this.model2.formatted);
        console.log(this.pr);

        const items = Object.values(data);
        console.log('items:', items);
        this.titles = items[0];
        this.badges = items[2];

        this.pids = items[1];
        this.tags = items[3];
        this.created_At = items[4];
        this.isApplied = items[5];
        this.src = items[6];

        for (let i = 0; i < this.src[0].length; i++) {
          this.src[0] = this.src[0].filter((v, i, a) => a.indexOf(v) === i);
        }


        this.structuredTitle = [];
        self['items'] = items;
        for (let i = 0; i < +this.titles.length; i++) {

          const a = {
            name: items[0][i], selected: false, pids: items[1][i], tags: items[3][i],
             created_at: items[4][i], isApplied: items[5][i], badges: this.badges[i],
              src: this.src[i]
          };
          this.structuredTitle.push(a);
        }


        this.showTitle = this.structuredTitle;

        if (this.pids.length === 0) {
          this.msg = 'No matches found.';
          this.show = false;
        }
        if (this.pids.length > 0) {
          this.msg = '';
          this.show = true;
        }
        // var pids = data[pids];
        this.applyTitle = true;

        console.log('titles:', this.titles);
        console.log('structuredTitle:', this.structuredTitle);


      });

      this.spinner.hide();
    }, 1000);
  }

  applyDateFn() {

    if (this.countDate === 1) {
      this.applyDate = false;
    }
    this.countDate = 1;
    console.log('count: ' + this.countDate);

  }
  applydiscountFn() {

    if (this.countDisc === 1) {
      this.applyDisc = false;
    }
    this.countDisc = 1;
    console.log('count: ' + this.countDisc);

  }

  // public mode: string;
  // public selectAllText: string;
  // public fields: Object = { text: 'title', value: 'pid' };
  // public placeholder: string = 'Select products';

  getTitleProd() {


    console.log(this.title1);
    this.spinner.show();
    setTimeout(() => {
      const obs = this.http.get('http://localhost:4567/getproducts/getProductTitle/tricon-jewel-store/' + this.title1 + '/all');
      obs.subscribe(data => {


        const items = Object.values(data);

        const self = this;
        console.log('items:', items);
        this.titles = items[0];
        this.badges = items[2];

        this.pids = items[1];
        this.tags = items[3];
        this.created_At = items[4];
        this.isApplied = items[5];
        const uSrc = [];
        this.src = items[6];



        console.log('this.src', this.split);
        console.log('unique b src', this.src[0].length);
        for (let i = 0; i < this.src[0].length; i++) {
          this.src[0] = this.src[0].filter((v, i , a) => a.indexOf(v) === i);
        }

        this.structuredTitle = [];
        self['items'] = items;
        for (let i = 0; i < +this.titles.length; i++) {

          const a = {
            name: items[0][i], selected: false, pids: items[1][i], tags: items[3][i],
            created_at: items[4][i], isApplied: items[5][i], badges: this.badges[i], src: this.src[i]
          };
          this.structuredTitle.push(a);
        }


        this.showTitle = this.structuredTitle;

        if (this.pids.length === 0) {
          this.msg = 'No matches found.';
          this.show = false;
        }
        if (this.pids.length > 0) {
          this.msg = '';
          this.show = true;
        }
        // var pids = data[pids];
        this.applyTitle = true;

        console.log('titles:', this.titles);
        console.log('structuredTitle:', this.structuredTitle);


      });

      this.spinner.hide();
    }, 1000);
  }


  applyTitleFn() {

    if (this.countTitle === 1) {
      this.applyTitle = false;  // !(this.applyTitle);
    }
    this.countTitle = 1;
    console.log('count: ' + this.countTitle);

  }

  getTagProd() {

    console.log(this.title1);
    this.spinner.show();
    setTimeout(() => {
      const obs = this.http.get('http://localhost:4567/getproducts/getProductTag/tricon-jewel-store/' + this.tag + '/all');
      obs.subscribe(data => {
        console.log('here is the response', data);
        console.log(this.pr);

        const items = Object.values(data);
        console.log('items:', items);
        console.log('items:', items);
        this.titles = items[0];
        this.badges = items[2];

        this.pids = items[1];
        this.tags = items[3];
        this.created_At = items[4];
        this.isApplied = items[5];
        this.src = items[6];

        for (let i = 0; i < this.src[0].length; i++) {
          this.src[0] = this.src[0].filter((v, i, a) => a.indexOf(v) === i);
        }


        this.structuredTitle = [];
        self['items'] = items;
        for (let i = 0; i < +this.titles.length; i++) {

          const a = {
            name: items[0][i], selected: false, pids: items[1][i],
             tags: items[3][i], created_at: items[4][i], isApplied: items[5][i],
              badges: this.badges[i], src: this.src[i]
          };
          this.structuredTitle.push(a);
        }


        this.showTitle = this.structuredTitle;

        if (this.pids.length === 0) {
          this.msg = 'No matches found.';
          this.show = false;
        }
        if (this.pids.length > 0) {
          this.msg = '';
          this.show = true;
        }
        // var pids = data[pids];
        this.applyTitle = true;

        console.log('titles:', this.titles);
        console.log('structuredTitle:', this.structuredTitle);


      });

      this.spinner.hide();
    }, 1000);
  }

  applyTagFn() {

    if (this.countTag === 1) {
      this.applyTag = false;
    }
    this.countTag = 1;
    console.log('count: ' + this.countTag);

  }
//   applyspFn(namespace) {

//      this.keyArray = [];
//     if (this.countns === 1) {
//       this.applyNs = false;
//     }
//     for (let i = 0 ; i < this.MF.length; i++ ) {
// if (this.MF[i].namespace === namespace) {
//  this.keyArray = this.MF[i].key;
// console.log('true');
// }
//     }
//     this.countns = 1;
//     console.log('count: ' + this.countns);
//     console.log(namespace);


//   }
  // applykeyFn() {

  //   if (this.countns === 1) {
  //     this.applykey = false;
  //   }
  //   this.countns = 1;
  //   console.log('count: ' + this.countns);

  // }

  applyvalueFn() {

    if (this.countns === 1) {
      this.applyvalue = false;
    }
    this.countns = 1;
    console.log('count: ' + this.countns);

  }

  giveid(flag, value) {
    if (this.selectedAll) {
      for (let i = 0; i < this.showTitle.length; i++) {
        this.showTitle[i].selected = this.selectedAll;
      }
      this.counter = this.showTitle.length;
      // var index = this.selectedids.indexOf(value1);
      // var index2 = this.selectedVids.indexOf(value2);
      // console.log('value1 if: ' + value1);
      this.selectedids = [];
      this.selectedVids = [];
      for (let i = 0; i < this.pids.length; i++) {
        this.selectedids.push(this.pids[i]);
      }
      for (let i = 0; i < this.variantsId.length; i++) {
        this.selectedVids.push(this.variantsId[i]);
      }
      // this.selectedids.splice(index, 1);
      console.log('selectedIDS(selected all): ' + this.selectedids);
      console.log('selectedVIDS(selected all): ' + this.selectedVids);
      console.log('selectedAll value1: ' + this.selectedAll);
      // console.log('pid value1 if: ' + this.pids);


    }
    if (!this.selectedAll && this.counter === this.showTitle.length) {
      for (let i = 0; i < this.showTitle.length; i++) {
        this.showTitle[i].selected = this.selectedAll;
      }
      this.selectedids = [];
      this.selectedVids = [];
      this.counter = 0;
      console.log('selectedIDS (deselected all): ' + this.selectedids);
    }    else if (flag) {
      const x = value.split(',');
      const value1 = x[0];
      const value2 = x[1];
      console.log('VAL:', value);
        this.counter = this.counter + 1;

      // this.selectedids.push(value1);
      // var index = this.selectedids.indexOf(value1);
      this.selectedids.push(value1);
      this.selectedVids.push(value2);
      console.log('flag true:' + this.selectedids);
      console.log('flag trueV:' + this.selectedVids);
      // console.log('pid value1 esle if: ' + this.pids);
    }
    if (flag === false) {
      const x = value.split(',');
      const value1 = x[0];
      const value2 = x[1];

      this.counter = this.counter - 1;

      const index = this.selectedids.indexOf(this.pids[value1]);
      console.log('index', index);
      const index2 = this.selectedVids.indexOf(this.pids[value2]);
      // this.selectedids.splice(value1, 1);
      console.log('spliced: ' + this.selectedids.splice(index, 1));
      console.log('spliced: ' + this.selectedVids.splice(index2, 1));
      console.log('if flag false:' + this.selectedids);
      console.log('if flag falseV:' + this.selectedVids);
      // console.log('pid value1 else: ' + this.pids);
    }

    console.log('flag: ' + flag);

    console.log('COUNTER:' + this.counter);
    if (this.counter === this.showTitle.length) {
      this.selectedAll = true;
    }    else {
      this.selectedAll = false;    }  }

  publish() {
    const id = this.selected_image_src._id;
    console.log(id);
    console.log(this.selectedids);
    console.log(this.selected_image_src.thumbnailSource);

    this.spinner.show();
    setTimeout(() => {

      const obs = this.http.post('http://localhost:4567/badging/publishBadges/tricon-jewel-store',
      { 'bid': id, 'xvalue': this.endOffset.x, 'yvalue': this.endOffset.y, 'opval': this.opvalue,
       'size': this.BadgeSize, 'borderRadius': this.BorderRadius, 'pid': this.selectedids,
       'vid': this.selectedVids, 'filter': this.selectedFilter, 'default': this.selected_image_src.default,
       'thumbnailSource': this.selected_image_src.thumbnailSource });

      obs.subscribe(data => {
        if (data.hasOwnProperty('pid')) {
          this.publishedNo = data['pid'].length;
          console.log('publish', this.publishedNo);
          console.log('publish2', this.selectedVids);
        }

      });

      console.log('done');


      this.spinner.hide();
    }, 1000);

  }
}
