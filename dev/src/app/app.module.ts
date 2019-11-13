import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {SvgDraggableDirective} from './_directive/svg-draggable.directive';
import {GraphComponent} from './graph/graph.component';

@NgModule({
  declarations: [
    AppComponent,
    SvgDraggableDirective,
    GraphComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
