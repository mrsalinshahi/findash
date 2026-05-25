import {
  formatDate,
  getCurrentMonthPrefix,
  isCurrentMonth,
  getMonthLabel,
  getLast6MonthPrefixes,
  todayISO,
} from '../../src/utils/dates';

describe('formatDate', () => {
  it('formats an ISO date string into a readable date', () => {
    const result = formatDate('2024-03-15');
    expect(result).toContain('Mar');
    expect(result).toContain('2024');
    expect(result).toContain('15');
  });

  it('handles year boundaries correctly', () => {
    const result = formatDate('2023-01-01');
    expect(result).toContain('Jan');
    expect(result).toContain('2023');
  });
});

describe('getCurrentMonthPrefix', () => {
  it('returns a YYYY-MM string', () => {
    const prefix = getCurrentMonthPrefix();
    expect(prefix).toMatch(/^\d{4}-\d{2}$/);
  });

  it('matches the current month and year', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    expect(getCurrentMonthPrefix()).toBe(expected);
  });
});

describe('isCurrentMonth', () => {
  it('returns true for a date in the current month', () => {
    const prefix = getCurrentMonthPrefix();
    expect(isCurrentMonth(`${prefix}-10`)).toBe(true);
  });

  it('returns false for a date in a different month', () => {
    expect(isCurrentMonth('2000-01-01')).toBe(false);
  });
});

describe('getMonthLabel', () => {
  it('returns a human-readable month label', () => {
    const label = getMonthLabel('2024-06');
    expect(label).toContain('Jun');
    expect(label).toContain('2024');
  });

  it('handles January correctly', () => {
    const label = getMonthLabel('2024-01');
    expect(label).toContain('Jan');
  });
});

describe('getLast6MonthPrefixes', () => {
  it('returns exactly 6 entries', () => {
    expect(getLast6MonthPrefixes()).toHaveLength(6);
  });

  it('entries are in ascending order', () => {
    const prefixes = getLast6MonthPrefixes();
    for (let i = 1; i < prefixes.length; i++) {
      expect(prefixes[i] >= prefixes[i - 1]).toBe(true);
    }
  });

  it('last entry is the current month', () => {
    const prefixes = getLast6MonthPrefixes();
    expect(prefixes[prefixes.length - 1]).toBe(getCurrentMonthPrefix());
  });

  it('each entry matches YYYY-MM format', () => {
    getLast6MonthPrefixes().forEach((p) => {
      expect(p).toMatch(/^\d{4}-\d{2}$/);
    });
  });
});

describe('todayISO', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches today\'s date', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(todayISO()).toBe(expected);
  });
});
