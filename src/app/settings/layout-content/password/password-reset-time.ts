import { t } from 'src/app/shared/i18n/i18n';

// short, localized unit labels, e.g. "d", "h", "m"
export interface RemainingTimeUnits {
  day: string;
  hour: string;
  minute: string;
}

export function getLocalizedRemainingTimeUnits(): RemainingTimeUnits {
  return { day: t('password_reset_unit_day'), hour: t('password_reset_unit_hour'), minute: t('password_reset_unit_minute') };
}

// "2d 5h 44m": the units that are zero are left out, as in the design ("5h" for 5 hours exactly).
// Rounds up to a whole minute, so the text never shows "0m" while time is still left.
export function formatRemainingTime(remainingMs: number, units: RemainingTimeUnits): string {
  const totalMinutes = Math.max(0, Math.ceil(remainingMs / 60_000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}${units.day}`);
  }
  if (hours > 0) {
    parts.push(`${hours}${units.hour}`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes}${units.minute}`);
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
