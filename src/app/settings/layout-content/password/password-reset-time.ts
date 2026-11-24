// "03:12:45". Counts up to the hour even past 24 hours, so a one day delay starts at "24:00:00".
// Rounds up, so the countdown never shows "00:00:00" while time is still left.
export function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map(part => String(part).padStart(2, '0')).join(':');
}

const DELAY_LABEL_KEYS: Record<number, string> = {
  60: 'password_reset_delay_1_hour',
  240: 'password_reset_delay_4_hours',
  1440: 'password_reset_delay_1_day'
};

// message key of "1 hour" / "4 hours" / "1 day" for a delay the user can choose; null for any other value
export function getResetDelayLabelKey(delayMinutes: number): string | null {
  return DELAY_LABEL_KEYS[delayMinutes] ?? null;
}
