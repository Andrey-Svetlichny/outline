import {Component, OnInit} from '@angular/core';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public linesData: string;
  modelChanged: Subject<string> = new Subject<string>();
  distance = 10;
  angle = 1;

  constructor() {
    this.linesData = '[[11,40,80,42],\n[10,50,90,53],\n[25,25,60,90],\n[25,15,60,80],\n[25,5,60,70]]';

    this.modelChanged.pipe(
      debounceTime(1000),
      distinctUntilChanged())
      .subscribe(value => this.linesData = value);
  }

  ngOnInit(): void {
  }


  changed(text: string) {
    // this.modelChanged.next(text);
  }
}
