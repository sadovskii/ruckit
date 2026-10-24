import { ChangeDetectorRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { GlobalService } from 'src/app/shared/services/global/global.service';
import { BlackListStorageService } from './black-list-storage.service';
import { BlackListComponent } from './black-list.component';

describe('BlackListComponent', () => {
  let component: BlackListComponent;

  beforeEach(() => {
    component = new BlackListComponent(
      {} as GlobalService,
      {} as NbDialogService,
      {} as ChangeDetectorRef,
      {} as BlackListStorageService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
