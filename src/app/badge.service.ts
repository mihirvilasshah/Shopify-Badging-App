import { Injectable } from '@angular/core';
// import { HttpClient } from '../../node_modules/@types/selenium-webdriver/http';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class BadgeService {
  // currentpic = this.badgePic.asObservable();
  private badgePic = 'http://www.livingmagazine.fr/components/com_easyblog/themes/wireframe/images/placeholder-image.png';
  private badgeCss = 'top-left';
  private coord = { x: 0, y: 0 };
  private coord2 = { x: 0, y: 0 };
  private coordFinal = { x: 0, y: 0 };
  private opval = 1;
  private BadgeSize = 15;
  private BorderRadius = 0;

  private _message = new Subject<boolean>();
  badgemessage$ = this._message.asObservable();
  sendMessage(message: boolean) {
    this._message.next(message);
  }


  constructor(private http: HttpClient) { }

  getProduct() {
    // const shopRequestHeaders = {
    //   'X-Shopify-Access-Token': 'e5bbb8c0d78b3b130da13e0a7e8b3e30',
    //   'Access-Control-Allow-Origin': '*',
    //   'Content-Type': 'application/json'
    // };
    const obs = this.http.get('http://localhost:4567/angular/getProduct/1451088838726.0');
    obs.subscribe(data => {
      console.log('here is the response', data);
    });
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

  getBadgeSize() {
    return this.BadgeSize;
  }

  setBadgeSize(W) {
    this.BadgeSize = W;
  }

  getBorderRadius() {
    return this.BorderRadius;
  }

  setBorderRadius(R) {
    this.BorderRadius = R;
  }

  showBadges() {
    return this.http.get('http://localhost:4567/angular/getIDS');
  }

}
