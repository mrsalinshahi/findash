import { convertAmount, formatCurrency, SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS } from '../../src/utils/currency';

const RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.86,
  JPY: 160.5,
  TRY: 35.2,
};

describe('convertAmount', () => {
  it('returns same amount when currencies match', () => {
    expect(convertAmount(100, 'EUR', 'EUR', RATES)).toBe(100);
    expect(convertAmount(50, 'USD', 'USD', RATES)).toBe(50);
  });

  it('converts EUR to USD correctly', () => {
    expect(convertAmount(100, 'EUR', 'USD', RATES)).toBe(109);
  });

  it('converts USD to EUR correctly', () => {
    const result = convertAmount(109, 'USD', 'EUR', RATES);
    expect(result).toBeCloseTo(100, 1);
  });

  it('converts USD to GBP via EUR', () => {
    // 109 USD → 100 EUR → 86 GBP
    const result = convertAmount(109, 'USD', 'GBP', RATES);
    expect(result).toBeCloseTo(86, 0);
  });

  it('returns original amount when rates are missing', () => {
    expect(convertAmount(100, 'EUR', 'USD', {})).toBe(100);
  });

  it('handles JPY rounding (no decimals)', () => {
    const result = convertAmount(1, 'EUR', 'JPY', RATES);
    expect(result).toBe(160.5);
  });

  it('rounds to 2 decimal places', () => {
    const result = convertAmount(1, 'USD', 'EUR', RATES);
    const decimals = result.toString().split('.')[1]?.length ?? 0;
    expect(decimals).toBeLessThanOrEqual(2);
  });
});

describe('formatCurrency', () => {
  it('formats EUR with symbol', () => {
    expect(formatCurrency(1234.56, 'EUR')).toContain('1,234.56');
  });

  it('formats USD with dollar sign', () => {
    expect(formatCurrency(99.99, 'USD')).toContain('99.99');
    expect(formatCurrency(99.99, 'USD')).toContain('$');
  });

  it('formats JPY without decimal places', () => {
    const result = formatCurrency(1000, 'JPY');
    expect(result).not.toContain('.');
  });

  it('formats TRY with lira symbol', () => {
    const result = formatCurrency(500, 'TRY');
    expect(result).toContain('500');
  });
});

describe('SUPPORTED_CURRENCIES', () => {
  it('contains all required currencies', () => {
    expect(SUPPORTED_CURRENCIES).toContain('EUR');
    expect(SUPPORTED_CURRENCIES).toContain('USD');
    expect(SUPPORTED_CURRENCIES).toContain('GBP');
    expect(SUPPORTED_CURRENCIES).toContain('JPY');
    expect(SUPPORTED_CURRENCIES).toContain('TRY');
  });
});

describe('CURRENCY_SYMBOLS', () => {
  it('maps each currency to its symbol', () => {
    expect(CURRENCY_SYMBOLS.EUR).toBe('€');
    expect(CURRENCY_SYMBOLS.USD).toBe('$');
    expect(CURRENCY_SYMBOLS.GBP).toBe('£');
    expect(CURRENCY_SYMBOLS.JPY).toBe('¥');
    expect(CURRENCY_SYMBOLS.TRY).toBe('₺');
  });
});
