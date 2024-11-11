import { GlobalService } from './global.service';

describe('GlobalService', () => {
  const service: GlobalService = new GlobalService();

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
