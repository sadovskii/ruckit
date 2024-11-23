import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PopupComponent } from './popup/popup.component';
import { SettingsComponent } from './settings/settings.component';
import { ChromeService } from './shared/services/chrome/chrome.service';
import { NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule, NbSelectModule, NbSidebarModule, NbThemeModule, NbToggleModule } from '@nebular/theme';
import { InnerSettingsComponent } from './settings/layout-content/inner-settings/inner-settings.component';
import { SidebarComponent } from './settings/sidebar/sidebar.component';
import { SidebarHeaderComponent } from './settings/sidebar/sidebar-header/sidebar-header.component';
import { SidebarItemComponent } from './settings/sidebar/sidebar-item/sidebar-item.component';
import { SafePipe } from './shared/pipes/safe.pipe';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { IconRegisterService } from './shared/services/nbIcon-library-register.service';
import { AboutExtensionComponent } from './settings/layout-content/about-extension/about-extension.component';
import { BlackListComponent } from './settings/layout-content/black-list/black-list.component';
import { HideListComponent } from './settings/layout-content/hide-list/hide-list.component';
import { PasswordComponent } from './settings/layout-content/password/password.component';
import { StartPageComponent } from './settings/layout-content/start-page/start-page.component';
import { LayoutComponent } from './settings/layout-content/shared/layout/layout.component';
import { SettingsItemComponent } from './settings/shared/settings-item/settings-item.component';
import { HideListBlockComponent } from './settings/layout-content/hide-list/hide-list-block/hide-list-block.component';
import { HideListBlockItemComponent } from './settings/layout-content/hide-list/hide-list-block/hide-list-block-item/hide-list-block-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    PopupComponent,
    SettingsComponent,
    SettingsItemComponent,
    InnerSettingsComponent,
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarItemComponent,
    StartPageComponent,
    AboutExtensionComponent,
    BlackListComponent,
    PasswordComponent,
    LayoutComponent,
    HideListComponent,
    HideListBlockComponent,
    HideListBlockItemComponent,
    SafePipe,
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
    NbIconModule,
    NbToggleModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    ChromeService,
    IconRegisterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
