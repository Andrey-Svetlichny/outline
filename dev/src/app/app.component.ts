import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


  public linesData: string;

  constructor() {
    this.linesData = '[[11,40,80,42],[10,50,90,53],[25,25,60,90],[25,15,60,80],[25,5,60,70]]';
  }

  ngOnInit(): void {
  }


}
