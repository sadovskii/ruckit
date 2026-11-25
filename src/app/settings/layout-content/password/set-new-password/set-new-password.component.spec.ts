import { SetNewPasswordComponent } from './set-new-password.component';

describe('SetNewPasswordComponent', () => {
  let component: SetNewPasswordComponent;

  beforeEach(() => {
    component = new SetNewPasswordComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('offers 1 hour, 4 hours and 1 day, with 4 hours selected', () => {
    expect(component.resetDelayOptions.map(option => option.value)).toEqual([60, 240, 1440]);
    expect(component.formGroup.controls.resetDelayMinutes.value).toBe(240);
  });

  it('submits the password with the chosen reset delay', () => {
    const submitted = jasmine.createSpy('submit');
    component.submit.subscribe(submitted);
    component.formGroup.patchValue({ enterPassword: 's3cret', confirmPassword: 's3cret', resetDelayMinutes: 1440 } as any);

    component.onSubmit();

    expect(submitted).toHaveBeenCalledOnceWith({ password: 's3cret', resetDelayMinutes: 1440 });
  });

  it('does not submit different passwords', () => {
    const submitted = jasmine.createSpy('submit');
    component.submit.subscribe(submitted);
    component.formGroup.patchValue({ enterPassword: 'one', confirmPassword: 'two' } as any);

    component.onSubmit();

    expect(submitted).not.toHaveBeenCalled();
    expect(component.invalidAfterClick).toBeTrue();
  });
});
