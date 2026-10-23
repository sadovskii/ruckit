import { ChangeDetectorRef } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { InnerSettingsComponent } from './inner-settings.component';

describe('InnerSettingsComponent', () => {
  let component: InnerSettingsComponent;

  beforeEach(() => {
    component = new InnerSettingsComponent({} as NbThemeService, {} as ChromeService, {} as ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
