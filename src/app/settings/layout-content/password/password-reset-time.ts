import { t } from 'src/app/shared/i18n/i18n';

// short, localized unit labels, e.g. "d", "h", "m", "s"
export interface RemainingTimeUnits {
  day: string;
  hour: string;
  minute: string;
  second: string;
}

export function getLocalizedRemainingTimeUnits(): RemainingTimeUnits {
  return {
    day: t('password_reset_unit_day'),
    hour: t('password_reset_unit_hour'),
    minute: t('password_reset_unit_minute'),
    second: t('password_reset_unit_second')
  };
}

// from this time left on, the seconds are shown too
const SECONDS_SHOWN_FROM_MS = 5 * 60 * 1000;

// "2d 5h 44m": the units that are zero are left out, as in the design ("5h" for 5 hours exactly).
// In the last 5 minutes the seconds are added ("4m 32s", "30s"), because the minutes alone barely move.
// Rounds up to a whole minute (a whole second at the end), so it never shows zero while time is still left.
export function formatRemainingTime(remainingMs: number, units: RemainingTimeUnits): string {
  const showSeconds = remainingMs <= SECONDS_SHOWN_FROM_MS;
  const totalSeconds = Math.max(0, showSeconds ? Math.ceil(remainingMs / 1000) : Math.ceil(remainingMs / 60_000) * 60);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}${units.day}`);
  }
  if (hours > 0) {
    parts.push(`${hours}${units.hour}`);
  }
  if (minutes > 0 || (!showSeconds && parts.length === 0)) {
    parts.push(`${minutes}${units.minute}`);
  }
  if (showSeconds) {
    parts.push(`${seconds}${units.second}`);
  }

  return parts.join(' ');
}

const DELAY_LABEL_KEYS: Record<number, string> = {
  1: 'password_reset_delay_1_hour',
  240: 'password_reset_delay_4_hours',
  1440: 'password_reset_delay_1_day'
};

// message key of "1 hour" / "4 hours" / "1 day" for a delay the user can choose; null for any other value
export function getResetDelayLabelKey(delayMinutes: number): string | null {
  return DELAY_LABEL_KEYS[delayMinutes] ?? null;
}
