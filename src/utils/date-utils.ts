/**
 * Date utility functions for Daily Bread
 * Ensures consistent date handling across the application
 */

/**
 * Get the current date in the user's local timezone as YYYY-MM-DD string
 * This ensures verse changes happen at midnight in the user's timezone,
 * not at midnight UTC
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a Date object in local timezone
 * Useful for comparing dates or calculating date differences
 */
export function parseLocalDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get the day of year (1-365/366) for a given date
 * Used for deterministic verse selection based on date
 */
export function getDayOfYear(date: Date = new Date()): number {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}