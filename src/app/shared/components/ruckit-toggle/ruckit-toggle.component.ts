import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, HostListener, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ruckit-toggle',
  templateUrl: './ruckit-toggle.component.html',
  styleUrls: ['./ruckit-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => RuckitToggleComponent),
        multi: true,
    },
],
})
export class RuckitToggleComponent implements ControlValueAccessor {

  @Input()
  get checked(): boolean {
      return this._checked;
  }

  set checked(value: boolean) {
      this._checked = coerceBooleanProperty(value);
  }

  @Input()
  get disabled(): boolean {
      return this._disabled;
  }

  set disabled(value: boolean) {
      this._disabled = coerceBooleanProperty(value);
  }

  @Output() public readonly checkedChange = new EventEmitter<boolean>();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() public readonly onBlur = new EventEmitter<any>();

  private _checked = false;
  private _disabled = false;

  constructor(
    private _changeDetector: ChangeDetectorRef
  ) { }

  @HostListener('blur')
  Blur() {
      this._onTouched();
  }

  onToggleChange(event: boolean) {
    this.checkedChange.emit(event);
    this.checked = event;
    this._onChange(event);
}

  writeValue(obj: any): void {
    this.checked = obj;
    this._changeDetector.markForCheck();
  }

  registerOnChange(onChange: (value: boolean) => void): void {
    this._onChange = onChange;
  }
  
  registerOnTouched(onTouched: () => void): void {
    this._onTouched = onTouched;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = coerceBooleanProperty(isDisabled);
    this._changeDetector.markForCheck();
}

  private _onTouched = () => { };
  private _onChange: (value: boolean) => void = () => { };
}
