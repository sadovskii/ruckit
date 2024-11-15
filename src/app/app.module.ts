import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PopupComponent } from './popup/popup.component';
import { SettingsComponent } from './settings/settings.component';
import { ChromeService } from './shared/services/chrome/chrome.service';
import { NbButtonModule, NbCardModule, NbLayoutModule, NbSelectModule, NbSidebarModule, NbThemeModule } from '@nebular/theme';
import { InnerSettingsComponent } from './settings/inner-settings/inner-settings.component';
import { SidebarComponent } from './settings/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    PopupComponent,
    SettingsComponent,
    InnerSettingsComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    NbLayoutModule,
    NbButtonModule,
    NbSelectModule,
    NbCardModule,
    NbThemeModule.forRoot(),
    NbSidebarModule.forRoot(),
  ],
  providers: [
    ChromeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
