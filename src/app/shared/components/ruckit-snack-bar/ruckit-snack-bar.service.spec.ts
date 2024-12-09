import { TestBed } from '@angular/core/testing';

import { RuckitSnackBarService } from './ruckit-snack-bar.service';

describe('RuckitSnackBarService', () => {
  let service: RuckitSnackBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RuckitSnackBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
