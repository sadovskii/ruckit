export interface NewPassword {
  password: string;
  // how long a reset waits before the password is removed
  resetDelayMinutes: number;
}
