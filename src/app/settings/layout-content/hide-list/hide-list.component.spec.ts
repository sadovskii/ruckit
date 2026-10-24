import { ChangeDetectorRef } from '@angular/core';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { GlobalService } from 'src/app/shared/services/global/global.service';
import { HideListComponent } from './hide-list.component';

describe('HideListComponent', () => {
  let component: HideListComponent;

  beforeEach(() => {
    component = new HideListComponent({} as ChromeService, {} as GlobalService, {} as ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
