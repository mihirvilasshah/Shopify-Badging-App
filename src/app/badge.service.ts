import { Injectable } from '@angular/core';
// import { HttpClient } from '../../node_modules/@types/selenium-webdriver/http';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class BadgeService {


  constructor(private http: HttpClient) { }

  getProduct() {
    // const shopRequestHeaders = {
    //   'X-Shopify-Access-Token': "e5bbb8c0d78b3b130da13e0a7e8b3e30",
    //   'Access-Control-Allow-Origin': '*',
    //   'Content-Type': 'application/json'
    // };
    let obs = this.http.get("https://1d977961.ngrok.io/getProduct/1451088838726.0")
    obs.subscribe(data => {
      console.log("here is the response", data)
    })
  }

  /*uploadPic(){
    this.http.post("https://3c7c6d64.ngrok.io/getProduct/1451088838726.0", {});

  }*/

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

  return this.http.get("https://3c7c6d64.ngrok.io/getIDS");
}

}
