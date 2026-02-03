/** Check if pet is currently sleeping based on its sleep_offset */
export function isSleeping(sleepOffset: number): boolean {
  const hour = new Date().getUTCHours();
  const petHour = (hour + sleepOffset) % 24;
  // Pet sleeps for 6 hours (petHour 0-5)
  return petHour >= 0 && petHour < 6;
}

/** Generate random sleep offset (0-23) for new pets */
export function generateSleepOffset(): number {
  return Math.floor(Math.random() * 24);
}
