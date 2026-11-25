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
  const units = { day: 'd', hour: 'h', minute: 'm', second: 's' };
  const minutes = (count: number) => count * 60_000;

  it('shows days, hours and minutes', () => {
    expect(formatRemainingTime(minutes(2 * 24 * 60 + 5 * 60 + 44), units)).toBe('2d 5h 44m');
  });

  it('leaves out the units that are zero', () => {
    expect(formatRemainingTime(minutes(24 * 60), units)).toBe('1d');
    expect(formatRemainingTime(minutes(4 * 60), units)).toBe('4h');
    expect(formatRemainingTime(minutes(2 * 24 * 60 + 10), units)).toBe('2d 10m');
    expect(formatRemainingTime(minutes(44), units)).toBe('44m');
  });

  it('uses the given unit labels', () => {
    expect(formatRemainingTime(minutes(65), { day: 'д', hour: 'ч', minute: 'м', second: 'с' })).toBe('1ч 5м');
  });

  it('rounds a started minute up', () => {
    expect(formatRemainingTime(minutes(6) + 1, units)).toBe('7m');
    expect(formatRemainingTime(minutes(60) + 1, units)).toBe('1h 1m');
  });

  it('adds the seconds in the last 5 minutes', () => {
    expect(formatRemainingTime(minutes(5), units)).toBe('5m 0s');
    expect(formatRemainingTime(4 * 60_000 + 32_000, units)).toBe('4m 32s');
    expect(formatRemainingTime(30_000, units)).toBe('30s');
    expect(formatRemainingTime(1_000, units)).toBe('1s');
  });

  it('does not show the seconds while more than 5 minutes are left', () => {
    expect(formatRemainingTime(minutes(5) + 1_000, units)).toBe('6m');
  });

  it('rounds a started second up in the last 5 minutes', () => {
    expect(formatRemainingTime(1, units)).toBe('1s');
    expect(formatRemainingTime(59_001, units)).toBe('1m 0s');
  });

  it('shows zero for no time left', () => {
    expect(formatRemainingTime(0, units)).toBe('0s');
    expect(formatRemainingTime(-500, units)).toBe('0s');
  });
});
