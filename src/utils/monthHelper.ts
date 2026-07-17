export const ALL_ACADEMIC_MONTHS = [
  "March 2026", "April 2026", "May 2026", "June 2026", 
  "July 2026", "August 2026", "September 2026", "October 2026", 
  "November 2026", "December 2026", "January 2027", "February 2027", "March 2027"
];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export function getMonthsUpToCurrent(): string[] {
  // Real-world mock date is July 2026.
  // We can look at the real date, or default to showing up to July 2026.
  // To be robust and ensure the app behaves exactly as expected (not showing months that have not started yet),
  // we check the current date. If current date is inside 2026, we cut off dynamically!
  const now = new Date();
  const currentMonthIdx = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();
  const currentMonthName = MONTH_NAMES[currentMonthIdx];
  const currentMonthYearStr = `${currentMonthName} ${currentYear}`;

  const idx = ALL_ACADEMIC_MONTHS.indexOf(currentMonthYearStr);
  if (idx === -1) {
    // If we are in or before July 2026, default to showing up to July 2026
    return ["March 2026", "April 2026", "May 2026", "June 2026", "July 2026"];
  }
  return ALL_ACADEMIC_MONTHS.slice(0, idx + 1);
}
