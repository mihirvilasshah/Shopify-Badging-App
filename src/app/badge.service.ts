import { Injectable } from '@angular/core';
// import { HttpClient } from '../../node_modules/@types/selenium-webdriver/http';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class BadgeService {


  constructor(private http: HttpClient) { }

  getProduct() {
    const shopRequestHeaders = {
      'X-Shopify-Access-Token': "e5bbb8c0d78b3b130da13e0a7e8b3e30",
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    };
    let obs = this.http.get("https://5594c140.ngrok.io/product")
    obs.subscribe(data => {
      console.log("here is the response", data)
    })
  }
}
