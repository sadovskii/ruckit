import { ChangeDetectorRef } from '@angular/core';
import { PasswordService } from '../password.service';
import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;

  beforeEach(() => {
    component = new ChangePasswordComponent({} as PasswordService, {} as ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
