import { firstValueFrom, of } from 'rxjs';
import { STORAGE_PASSWORD_ID } from 'src/app/shared/constants';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { PasswordResetService } from './password-reset.service';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let storage: Record<string, unknown>;
  let cancelReset: jasmine.Spy;
  let service: PasswordService;

  beforeEach(() => {
    storage = { [STORAGE_PASSWORD_ID]: 's3cret' };
    cancelReset = jasmine.createSpy('cancel').and.returnValue(of(undefined));

    const chromeService = {
      storageSyncGetItem: (key: string) => of(storage[key]),
      storageSyncSetItems: (items: Record<string, unknown>) => {
        Object.assign(storage, items);
        return of(undefined);
      },
      storageSyncRemoveItems: (keys: string[]) => {
        keys.forEach(key => delete storage[key]);
        return of(undefined);
      }
    } as unknown as ChromeService;

    service = new PasswordService(chromeService, { cancel: cancelReset } as unknown as PasswordResetService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('a correct password cancels a pending reset', async () => {
    expect(await firstValueFrom(service.submitEnterPassword('s3cret'))).toBeTrue();
    expect(cancelReset).toHaveBeenCalled();
  });

  it('a wrong password leaves a pending reset alone', async () => {
    expect(await firstValueFrom(service.submitEnterPassword('wrong'))).toBeFalse();
    expect(cancelReset).not.toHaveBeenCalled();
  });

  it('setPassword saves the password with its reset delay', async () => {
    await firstValueFrom(service.setPassword({ password: 'new', resetDelayMinutes: 60 }));

    expect(storage['password']).toBe('new');
    expect(storage['password-reset-delay']).toBe(60);
  });

  it('removePassword removes the password and its reset data', async () => {
    storage['password-reset-delay'] = 240;
    storage['password-reset-ends-at'] = 1;

    await firstValueFrom(service.removePassword());

    expect(storage).toEqual({});
  });
});
