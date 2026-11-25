import { ChangeDetectorRef } from '@angular/core';
import { RuckitPillGroupComponent } from './ruckit-pill-group.component';
import { RuckitPillOption } from './ruckit-pill-group.models';

describe('RuckitPillGroupComponent', () => {
  const options: RuckitPillOption[] = [
    { value: 60, label: '1 hour' },
    { value: 240, label: '4 hours' },
    { value: 1440, label: '1 day' }
  ];

  let component: RuckitPillGroupComponent;
  let onChange: jasmine.Spy;
  let onTouched: jasmine.Spy;

  beforeEach(() => {
    component = new RuckitPillGroupComponent({ markForCheck: () => {} } as ChangeDetectorRef);
    component.options = options;
    onChange = jasmine.createSpy('onChange');
    onTouched = jasmine.createSpy('onTouched');
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selecting a pill saves and reports its value', () => {
    component.select(options[2]);

    expect(component.value).toBe(1440);
    expect(onChange).toHaveBeenCalledOnceWith(1440);
    expect(onTouched).toHaveBeenCalled();
  });

  it('shows the value written by the form', () => {
    component.writeValue(240);

    expect(component.value).toBe(240);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores a click while disabled', () => {
    component.writeValue(60);
    component.setDisabledState(true);

    component.select(options[1]);

    expect(component.value).toBe(60);
    expect(onChange).not.toHaveBeenCalled();
  });
});
