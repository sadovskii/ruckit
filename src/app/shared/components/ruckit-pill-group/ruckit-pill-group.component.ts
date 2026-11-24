import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RuckitPillOption } from './ruckit-pill-group.models';

// A row of radio pills: exactly one option is selected.
@Component({
  selector: 'ruckit-pill-group',
  templateUrl: './ruckit-pill-group.component.html',
  styleUrls: ['./ruckit-pill-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => RuckitPillGroupComponent)
    }
  ]
})
export class RuckitPillGroupComponent implements ControlValueAccessor {
  @Input({ required: true })
  public options: RuckitPillOption[] = [];

  @Input()
  public ariaLabel = '';

  public value: number | null = null;
  public isDisabled = false;

  constructor(private _cdr: ChangeDetectorRef) {}

  select(option: RuckitPillOption) {
    if (this.isDisabled) {
      return;
    }

    this.value = option.value;
    this._onChange(this.value);
    this._onTouched();
  }

  writeValue(value: number | null): void {
    this.value = value;
    this._cdr.markForCheck();
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this._cdr.markForCheck();
  }

  registerOnChange(fn: (value: number) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  private _onChange: (value: number) => void = () => {};
  private _onTouched: () => void = () => {};
}
