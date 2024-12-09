import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuckitSnackBarComponent } from './ruckit-snack-bar.component';

describe('RuckitSnackBarComponent', () => {
  let component: RuckitSnackBarComponent;
  let fixture: ComponentFixture<RuckitSnackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuckitSnackBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuckitSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
