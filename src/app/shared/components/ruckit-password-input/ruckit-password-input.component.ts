import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, Inject, Injector, Input, OnInit, Optional, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { NbComponentOrCustomStatus } from '@nebular/theme';

@Component({
  selector: 'ruckit-password-input',
  templateUrl: './ruckit-password-input.component.html',
  styleUrls: [ './ruckit-password-input.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => RuckitPasswordInputComponent)
    }
  ]
})
export class RuckitPasswordInputComponent implements ControlValueAccessor {
  @Input()
  public status: NbComponentOrCustomStatus = 'basic';

  @Input()
  public placeholder: string;

  @Input()
  public fullWidth: boolean = false;

  @Input()
  get disabled(): boolean {
    return this.isDisabled;
  }

  set disabled(d: boolean) {
    this.isDisabled = d;
  }

  password: string = '';
  isDisabled: boolean;
  showPassword = false;

  constructor(private _crd: ChangeDetectorRef) {}

  writeValue(value: any): void {
    this.password = value;
  }

  setDisabledState?(isDisabled: boolean): void {
    console.log("setDisabledState = ", isDisabled);
    this.isDisabled = isDisabled;
    this._crd.markForCheck();
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.password = input.value;
    this._onChange(this.password);
  }

  onBlur() {
    this._onTouched();
  }

  getInputType() {
    if (this.showPassword) {
      return 'text';
    }
    return 'password';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  private _onTouched = () => {};
  private _onChange: (value: any) => void = () => {}
}

