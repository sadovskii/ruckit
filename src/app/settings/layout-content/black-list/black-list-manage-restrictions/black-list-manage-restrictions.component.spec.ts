import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackListManageRestrictionsComponent } from './black-list-manage-restrictions.component';

describe('BlackListManageRestrictionsComponent', () => {
  let component: BlackListManageRestrictionsComponent;
  let fixture: ComponentFixture<BlackListManageRestrictionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlackListManageRestrictionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlackListManageRestrictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
