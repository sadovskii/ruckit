import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PopupComponent } from './popup/popup.component';
import { SettingsComponent } from './settings/settings.component';
import { ChromeService } from './shared/services/chrome/chrome.service';
import { NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule, NbSelectModule, NbSidebarModule, NbThemeModule } from '@nebular/theme';
import { InnerSettingsComponent } from './settings/inner-settings/inner-settings.component';
import { SidebarComponent } from './settings/sidebar/sidebar.component';
import { SidebarHeaderComponent } from './settings/sidebar/sidebar-header/sidebar-header.component';
import { SidebarItemComponent } from './settings/sidebar/sidebar-item/sidebar-item.component';
import { SafePipe } from './shared/pipes/safe.pipe';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { IconRegisterService } from './shared/services/nbIcon-library-register.service';

@NgModule({
  declarations: [
    AppComponent,
    PopupComponent,
    SettingsComponent,
    InnerSettingsComponent,
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarItemComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    NbLayoutModule,
    NbButtonModule,
    NbSelectModule,
    NbCardModule,
    NbThemeModule.forRoot(),
    NbSidebarModule.forRoot(),
    NbEvaIconsModule,
    NbIconModule
  ],
  providers: [
    ChromeService,
    IconRegisterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
