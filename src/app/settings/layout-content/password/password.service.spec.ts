import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service: PasswordService = new PasswordService({} as ChromeService);

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
