import { ChangeDetectorRef } from '@angular/core';
import { ChromeService } from '../shared/services/chrome/chrome.service';
import { PopupComponent } from './popup.component';

describe('PopupComponent', () => {
  let component: PopupComponent;

  beforeEach(() => {
    component = new PopupComponent({} as ChromeService, {} as ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
