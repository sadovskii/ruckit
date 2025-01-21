import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupNavbarItemComponent } from './popup-navbar-item.component';

describe('PopupNavbarItemComponent', () => {
  let component: PopupNavbarItemComponent;
  let fixture: ComponentFixture<PopupNavbarItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupNavbarItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupNavbarItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
