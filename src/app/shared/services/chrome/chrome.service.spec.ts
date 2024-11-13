import { ChromeService } from './chrome.service';

describe('ChromeService', () => {
  const service: ChromeService = new ChromeService();

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
