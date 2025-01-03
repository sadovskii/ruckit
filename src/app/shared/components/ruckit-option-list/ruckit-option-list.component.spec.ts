import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuckitOptionListComponent } from './ruckit-option-list.component';

describe('RuckitOptionListComponent', () => {
  let component: RuckitOptionListComponent;
  let fixture: ComponentFixture<RuckitOptionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuckitOptionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuckitOptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
