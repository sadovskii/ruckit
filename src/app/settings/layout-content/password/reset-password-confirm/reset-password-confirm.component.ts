import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { t } from 'src/app/shared/i18n/i18n';
import { formatRemainingTime, getLocalizedRemainingTimeUnits, getResetDelayLabelKey } from '../password-reset-time';

// The "Reset password?" view of the enter password dialog: explains the wait and asks to start the reset.
@Component({
  selector: 'app-reset-password-confirm',
  templateUrl: './reset-password-confirm.component.html',
  styleUrls: ['./reset-password-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordConfirmComponent {
  @Input({ required: true })
  public delayMinutes: number;

  @Output()
  public readonly startReset = new EventEmitter<void>();

  @Output()
  public readonly goBack = new EventEmitter<void>();

  get delayLabel(): string {
    const labelKey = getResetDelayLabelKey(this.delayMinutes);

    return labelKey ? t(labelKey) : formatRemainingTime(this.delayMinutes * 60 * 1000, getLocalizedRemainingTimeUnits());
  }
}
