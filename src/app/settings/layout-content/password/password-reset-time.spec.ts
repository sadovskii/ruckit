import { PASSWORD_RESET_DELAY_OPTIONS_MINUTES } from 'src/app/shared/constants';
import { formatRemainingTime, getResetDelayLabelKey } from './password-reset-time';

describe('getResetDelayLabelKey', () => {
  it('has a label for every delay the user can choose', () => {
    PASSWORD_RESET_DELAY_OPTIONS_MINUTES.forEach(delayMinutes => {
      expect(getResetDelayLabelKey(delayMinutes)).not.toBeNull();
    });
  });

  it('has no label for another delay', () => {
    expect(getResetDelayLabelKey(5)).toBeNull();
  });
});

describe('formatRemainingTime', () => {
  const units = { day: 'd', hour: 'h', minute: 'm' };
  const minutes = (count: number) => count * 60_000;

  it('shows days, hours and minutes', () => {
    expect(formatRemainingTime(minutes(2 * 24 * 60 + 5 * 60 + 44), units)).toBe('2d 5h 44m');
  });

  it('leaves out the units that are zero', () => {
    expect(formatRemainingTime(minutes(24 * 60), units)).toBe('1d');
    expect(formatRemainingTime(minutes(5 * 60), units)).toBe('5h');
    expect(formatRemainingTime(minutes(2 * 24 * 60 + 10), units)).toBe('2d 10m');
    expect(formatRemainingTime(minutes(44), units)).toBe('44m');
  });

  it('uses the given unit labels', () => {
    expect(formatRemainingTime(minutes(65), { day: 'д', hour: 'ч', minute: 'м' })).toBe('1ч 5м');
  });

  it('rounds a started minute up', () => {
    expect(formatRemainingTime(1, units)).toBe('1m');
    expect(formatRemainingTime(minutes(1) + 1, units)).toBe('2m');
  });

  it('shows zero minutes for no time left', () => {
    expect(formatRemainingTime(0, units)).toBe('0m');
    expect(formatRemainingTime(-500, units)).toBe('0m');
  });
});
