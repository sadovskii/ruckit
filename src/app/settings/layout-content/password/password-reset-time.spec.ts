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
  it('formats hours, minutes and seconds with two digits', () => {
    expect(formatRemainingTime((3 * 3600 + 12 * 60 + 45) * 1000)).toBe('03:12:45');
  });

  it('counts past 24 hours', () => {
    expect(formatRemainingTime(24 * 3600 * 1000)).toBe('24:00:00');
  });

  it('rounds a started second up', () => {
    expect(formatRemainingTime(1)).toBe('00:00:01');
    expect(formatRemainingTime(59_001)).toBe('00:01:00');
  });

  it('shows zero for no time left', () => {
    expect(formatRemainingTime(0)).toBe('00:00:00');
    expect(formatRemainingTime(-500)).toBe('00:00:00');
  });
});
