import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupGlobalComponent } from './popup-global.component';

describe('PopupGlobalComponent', () => {
  let component: PopupGlobalComponent;
  let fixture: ComponentFixture<PopupGlobalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupGlobalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
