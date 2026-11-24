import { ResetPasswordConfirmComponent } from './reset-password-confirm.component';

describe('ResetPasswordConfirmComponent', () => {
  let component: ResetPasswordConfirmComponent;

  beforeEach(() => {
    component = new ResetPasswordConfirmComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a delay without a label as a time', () => {
    component.delayMinutes = 5;

    expect(component.delayLabel).toBe('00:05:00');
  });

  it('shows a delay the user can choose with its label message key when messages are unavailable', () => {
    component.delayMinutes = 240;

    // outside the extension the i18n helper returns the key itself
    expect(component.delayLabel).toBe('password_reset_delay_4_hours');
  });
});
