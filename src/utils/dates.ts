export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getCurrentMonthPrefix(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function isCurrentMonth(dateStr: string): boolean {
  return dateStr.startsWith(getCurrentMonthPrefix());
}

export function getMonthLabel(yearMonthStr: string): string {
  const [year, month] = yearMonthStr.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

export function getLast6MonthPrefixes(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

/**
 * Returns today's date as "YYYY-MM-DD" in the user's local timezone.
 * Using local date parts rather than toISOString() because toISOString()
 * returns UTC — which can be a different calendar day for users in UTC+ zones.
 */
export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
