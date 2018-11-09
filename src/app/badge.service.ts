import { Injectable } from '@angular/core';
// import { HttpClient } from '../../node_modules/@types/selenium-webdriver/http';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  // private badgePic = new BehaviorSubject('http://www.livingmagazine.fr/components/com_easyblog/themes/wireframe/images/placeholder-image.png');
  // currentpic = this.badgePic.asObservable();
  private badgePic = "http://www.livingmagazine.fr/components/com_easyblog/themes/wireframe/images/placeholder-image.png";
  private badgeCss = "top-left";
  private coord = { x: 0, y: 0 };
  private coord2 = { x: 0, y: 0 };
  private coordFinal = { x: 0, y: 0 };
  private opval = 1;
  private BadgeWidth = 15;
  private BadgeHeight = 15;
  private BorderRadius = 0;

  private _message = new Subject<boolean>();
  badgemessage$ = this._message.asObservable();
  sendMessage(message: boolean) {
    this._message.next(message);
  }


  constructor(private http: HttpClient) { }

  getProduct() {
    // const shopRequestHeaders = {
    //   'X-Shopify-Access-Token': "e5bbb8c0d78b3b130da13e0a7e8b3e30",
    //   'Access-Control-Allow-Origin': '*',
    //   'Content-Type': 'application/json'
    // };
    let obs = this.http.get("http://localhost:3000/getProduct/1451088838726.0")
    obs.subscribe(data => {
      console.log("here is the response", data)
    })
  }

  changeBadge(message: string) {
    this.badgePic = message;
  }

  getBadgePic(): string {
    return this.badgePic;
  }

  changeBadgeCss(message: string) {
    this.badgeCss = message;
  }

  getBadgeCss(): string {
    return this.badgeCss;
  }

  setCoorx(x) {
    this.coord.x = x;
   
  }
  setCoory(y) {
    this.coord.y = y;
   
  }
  getCoorx() {
    return this.coord.x;
  }
  getCoory() {
    return this.coord.y;
  }

  setCoor2(x, y) {
    this.coord2.x = x;
    this.coord2.y = y;
  }

  getCoor2() {
    return this.coord2;
  }

  setCoorFinal(x, y) {
    this.coordFinal.x = x;
    this.coordFinal.y = y;
  }

  getCoorFinal() {
    return this.coordFinal;
  }

  getOpval() {
    return this.opval;
  }

  setOpval(val) {
    this.opval = val;
  }

  getBadgeWidth() {
    return this.BadgeWidth;
  }

  setBadgeWidth(W) {
    this.BadgeWidth = W;
  }

  getBadgeHeight() {
    return this.BadgeHeight;
  }

  setBadgeHeight(H) {
    this.BadgeHeight = H;
  }

  getBorderRadius() {
    return this.BorderRadius;
  }

  setBorderRadius(R) {
    this.BorderRadius = R;
  }

  showBadges() {

    // const shopRequestHeaders = {
    //   'X-Shopify-Access-Token': "e5bbb8c0d78b3b130da13e0a7e8b3e30",
    //   'Access-Control-Allow-Origin': '*',
    //   'Content-Type': 'application/json'
    // };

    // let obs = this.http.get("https://a230f3ec.ngrok.io/picture/5b9faee2e1439e16241352df")

    // obs.subscribe(data => {
    //   console.log(typeof(data));
    //   var x = <HTMLImageElement>document.getElementById("mybadge")
    //  console.log(typeof(x),typeof(data),x,data);
    // })

    // return this.http.get("https://a230f3ec.ngrok.io/picture/5b9faee2e1439e16241352df");

    //   let obs = this.http.get("https://a230f3ec.ngrok.io/getIDS")
    //   return obs;
    //   obs.subscribe(ids => {
    //     console.log("here are the ids", ids);
    //     console.log(typeof(ids));
    //     return ids;
    //   })
    // }

    return this.http.get("http://localhost:3000/getIDS");
  }

}
