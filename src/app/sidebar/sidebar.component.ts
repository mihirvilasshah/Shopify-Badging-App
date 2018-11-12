import { Component, OnInit,OnChanges, SimpleChanges, Input } from '@angular/core';
import { BadgeService } from '../badge.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements  OnInit {


  selected = false;
  constructor(private badge: BadgeService) { 
  

   
  }

  ngOnInit() {

    this.badge.badgemessage$.subscribe(
      message=>{
        this.selected= message;


      }
    );
 
  }
  ngOnChanges(changes: SimpleChanges) {

    console.log("asdf",changes);

  }
  
  
    
  

}
