import { Injectable } from '@angular/core';
// import { HttpClient } from '../../node_modules/@types/selenium-webdriver/http';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  // private badgePic = new BehaviorSubject('http://www.livingmagazine.fr/components/com_easyblog/themes/wireframe/images/placeholder-image.png');
  // currentpic = this.badgePic.asObservable();
  private badgePic="http://www.livingmagazine.fr/components/com_easyblog/themes/wireframe/images/placeholder-image.png";
  private badgeCss="top-left";
  private coord={ x: 0, y: 0 };
  private opval;

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
    this.badgePic=message;
  }

  getBadgePic(): string{
    return this.badgePic;
  }

  changeBadgeCss(message: string) {
    this.badgeCss=message;
  }

  getBadgeCss(): string{
    return this.badgeCss;
  }

  setCoor(x,y){
    this.coord.x=x;
    this.coord.y=y;
  }

  getCoor(){
    return this.coord;
  }

  getOpval(){
    return this.opval;
  }

  setOpval(val){
    this.opval=val;
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
