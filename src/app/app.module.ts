import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PopupComponent } from './popup/popup.component';
import { SettingsComponent } from './settings/settings.component';
import { ChromeService } from './shared/services/chrome/chrome.service';
import { NbButtonModule, NbCardModule, NbDialogModule, NbDialogService, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbSelectModule, NbSidebarModule, NbThemeModule, NbToggleModule, NbWindowModule } from '@nebular/theme';
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
import { RuckitToggleComponent } from './shared/components/ruckit-toggle/ruckit-toggle.component';
import { SetNewPasswordComponent } from './settings/layout-content/password/set-new-password/set-new-password.component';
import { TagComponent } from './shared/components/tag/tag.component';
import { RuckitDialogComponent } from './shared/components/ruckit-dialog/ruckit-dialog.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EnterPasswordComponent } from './settings/layout-content/password/enter-password/enter-password.component';
import { RuckitPasswordInputComponent } from './shared/components/ruckit-password-input/ruckit-password-input.component';
import { ChangePasswordComponent } from './settings/layout-content/password/change-password/change-password.component';
import { RuckitSnackBarComponent } from './shared/components/ruckit-snack-bar/ruckit-snack-bar.component';
import { RuckitSnackBarService } from './shared/components/ruckit-snack-bar/ruckit-snack-bar.service';
import { BlackListSimpleItemComponent } from './settings/layout-content/black-list/black-list-simple-item/black-list-simple-item.component';
import { RestrictedToggleDirective } from './shared/directive/restricted-toggle/restricted-toggle.directive';
import { BlackListManageRestrictionsComponent } from './settings/layout-content/black-list/black-list-manage-restrictions/black-list-manage-restrictions.component';
import { RuckitOptionListComponent } from './shared/components/ruckit-option-list/ruckit-option-list.component';

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
    RuckitToggleComponent,
    RuckitDialogComponent,
    SetNewPasswordComponent,
    TagComponent,
    EnterPasswordComponent,
    RuckitPasswordInputComponent,
    ChangePasswordComponent,
    RuckitSnackBarComponent,
    BlackListSimpleItemComponent,
    BlackListManageRestrictionsComponent,
    RuckitOptionListComponent,
    RestrictedToggleDirective
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
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
    NbDialogModule.forRoot(),
    NbInputModule,
    NbFormFieldModule,
  ],
  providers: [
    ChromeService,
    IconRegisterService,
    NbDialogService,
    RuckitSnackBarService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
