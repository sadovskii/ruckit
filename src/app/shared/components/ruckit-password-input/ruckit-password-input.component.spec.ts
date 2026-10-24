import { ChangeDetectorRef, ElementRef, Renderer2 } from '@angular/core';
import { RuckitPasswordInputComponent } from './ruckit-password-input.component';

describe('RuckitPasswordInputComponent', () => {
  let component: RuckitPasswordInputComponent;

  beforeEach(() => {
    component = new RuckitPasswordInputComponent({} as ChangeDetectorRef, {} as ElementRef, {} as Renderer2);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
