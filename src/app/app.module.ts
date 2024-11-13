import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PopupComponent } from './popup/popup.component';
import { SettingsComponent } from './settings/settings.component';
import { ChromeService } from './shared/services/chrome/chrome.service';

@NgModule({
  declarations: [
    AppComponent,
    PopupComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
  ],
  providers: [
    ChromeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
