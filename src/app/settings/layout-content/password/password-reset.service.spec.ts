import { fakeAsync, tick } from '@angular/core/testing';
import { firstValueFrom, lastValueFrom, of, take, toArray } from 'rxjs';
import {
  DEFAULT_PASSWORD_RESET_DELAY_MINUTES,
  STORAGE_PASSWORD_ID,
  STORAGE_PASSWORD_RESET_DELAY_ID,
  STORAGE_PASSWORD_RESET_ENDS_AT_ID
} from 'src/app/shared/constants';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { GlobalService } from 'src/app/shared/services/global/global.service';
import { PasswordResetService } from './password-reset.service';

// keeps what would be in chrome.storage.sync in a plain object
function createFakeChromeService(storage: Record<string, unknown>): ChromeService {
  return {
    storageSyncGetItem: (key: string) => of(storage[key]),
    storageSyncSet: (key: string, value: unknown) => {
      storage[key] = value;
      return of(undefined);
    },
    storageSyncRemove: (key: string) => {
      delete storage[key];
      return of(undefined);
    },
    storageSyncRemoveItems: (keys: string[]) => {
      keys.forEach(key => delete storage[key]);
      return of(undefined);
    }
  } as unknown as ChromeService;
}

describe('PasswordResetService', () => {
  const NOW = 1_000_000_000_000;
  const MS_IN_MINUTE = 60 * 1000;

  let storage: Record<string, unknown>;
  let globalService: GlobalService;
  let service: PasswordResetService;

  beforeEach(() => {
    spyOn(Date, 'now').and.returnValue(NOW);
    storage = { [STORAGE_PASSWORD_ID]: 's3cret', [STORAGE_PASSWORD_RESET_DELAY_ID]: 240 };
    globalService = new GlobalService();
    globalService.setHasPassword$(true);
    service = new PasswordResetService(createFakeChromeService(storage), globalService);
  });

  it('has no reset when none was started', async () => {
    expect(await firstValueFrom(service.getState())).toEqual({ status: 'none' });
  });

  it('start saves the end time using the delay saved with the password', async () => {
    await firstValueFrom(service.start());

    expect(storage[STORAGE_PASSWORD_RESET_ENDS_AT_ID]).toBe(NOW + 240 * MS_IN_MINUTE);
    expect(await firstValueFrom(service.getState())).toEqual({
      status: 'pending',
      endsAt: NOW + 240 * MS_IN_MINUTE,
      remainingMs: 240 * MS_IN_MINUTE
    });
  });

  it('start uses the default delay for a password saved before the reset feature', async () => {
    delete storage[STORAGE_PASSWORD_RESET_DELAY_ID];

    await firstValueFrom(service.start());

    expect(storage[STORAGE_PASSWORD_RESET_ENDS_AT_ID]).toBe(NOW + DEFAULT_PASSWORD_RESET_DELAY_MINUTES * MS_IN_MINUTE);
  });

  it('cancel removes the end time and keeps the password', async () => {
    await firstValueFrom(service.start());

    await firstValueFrom(service.cancel());

    expect(storage[STORAGE_PASSWORD_RESET_ENDS_AT_ID]).toBeUndefined();
    expect(storage[STORAGE_PASSWORD_ID]).toBe('s3cret');
  });

  it('finalizeIfExpired does nothing while the reset is pending', async () => {
    storage[STORAGE_PASSWORD_RESET_ENDS_AT_ID] = NOW + MS_IN_MINUTE;

    expect(await firstValueFrom(service.finalizeIfExpired())).toBeFalse();
    expect(storage[STORAGE_PASSWORD_ID]).toBe('s3cret');
  });

  it('finalizeIfExpired does nothing when no reset was started', async () => {
    expect(await firstValueFrom(service.finalizeIfExpired())).toBeFalse();
    expect(storage[STORAGE_PASSWORD_ID]).toBe('s3cret');
  });

  it('finalizeIfExpired removes the password, its delay and the reset when the end time has come', async () => {
    storage[STORAGE_PASSWORD_RESET_ENDS_AT_ID] = NOW;

    expect(await firstValueFrom(service.finalizeIfExpired())).toBeTrue();

    expect(storage).toEqual({});
    expect(globalService.getIsRestrictedValue()).toBeFalse();
  });

  it('watchState emits pending and then completed once the reset is over, and ends', async () => {
    storage[STORAGE_PASSWORD_RESET_ENDS_AT_ID] = NOW - 1;

    const states = await lastValueFrom(service.watchState().pipe(take(5), toArray()));

    expect(states).toEqual([{ status: 'completed' }]);
  });

  // fakeAsync has its own clock (Date.now follows tick), so these tests use times relative to it
  it('watchExpiry removes the password at the end time without anyone asking', fakeAsync(() => {
    storage[STORAGE_PASSWORD_RESET_ENDS_AT_ID] = Date.now() + 10_000;
    let removedCount = 0;

    const subscription = service.watchExpiry().subscribe(() => removedCount++);
    tick(5_000);
    expect(storage[STORAGE_PASSWORD_ID]).toBe('s3cret');
    expect(removedCount).toBe(0);

    tick(5_100);

    expect(removedCount).toBe(1);
    expect(storage).toEqual({});
    expect(globalService.getIsRestrictedValue()).toBeFalse();
    subscription.unsubscribe();
  }));

  it('watchExpiry picks up a reset that was started after it began to watch', fakeAsync(() => {
    let removedCount = 0;
    const subscription = service.watchExpiry().subscribe(() => removedCount++);
    tick(0);

    storage[STORAGE_PASSWORD_RESET_ENDS_AT_ID] = Date.now() + 40_000;
    tick(40_100);

    expect(removedCount).toBe(1);
    expect(storage[STORAGE_PASSWORD_ID]).toBeUndefined();
    subscription.unsubscribe();
  }));

  it('watchState emits the remaining time of a pending reset', async () => {
    storage[STORAGE_PASSWORD_RESET_ENDS_AT_ID] = NOW + 90 * 1000;

    const state = await firstValueFrom(service.watchState());

    expect(state).toEqual({ status: 'pending', endsAt: NOW + 90 * 1000, remainingMs: 90 * 1000 });
  });
});
