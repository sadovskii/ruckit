import { RuckitSnackBarService } from './ruckit-snack-bar.service';

describe('RuckitSnackBarService', () => {
  let service: RuckitSnackBarService;

  beforeEach(() => {
    service = new RuckitSnackBarService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
