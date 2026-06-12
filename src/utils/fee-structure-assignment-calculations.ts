export interface MonthYearPair {
  month: number;
  year: number;
}

const roundToTwo = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const getDefaultMonthlyAmount = (amount: number, isOneTime: boolean): number => {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  if (isOneTime) {
    return roundToTwo(amount);
  }

  return roundToTwo(amount / 12);
};

export const parseMonthYearValue = (
  value?: number | string | null,
  year?: number | null
): MonthYearPair | null => {
  if (typeof value === 'string') {
    const [monthStr, yearStr] = value.split('-');
    const parsedMonth = Number(monthStr);
    const parsedYear = Number(yearStr);

    if (!Number.isInteger(parsedMonth) || !Number.isInteger(parsedYear)) {
      return null;
    }

    return { month: parsedMonth, year: parsedYear };
  }

  if (typeof value === 'number' && typeof year === 'number') {
    if (!Number.isInteger(value) || !Number.isInteger(year)) {
      return null;
    }

    return { month: value, year };
  }

  return null;
};

export const getPayableMonthCount = (
  startValue?: number | string | null,
  endValue?: number | string | null,
  startYear?: number | null,
  endYear?: number | null
): number | null => {
  const start = parseMonthYearValue(startValue, startYear);
  const end = parseMonthYearValue(endValue, endYear);

  if (!start || !end) {
    return null;
  }

  const startIndex = start.year * 12 + start.month;
  const endIndex = end.year * 12 + end.month;

  if (endIndex < startIndex) {
    return null;
  }

  return endIndex - startIndex + 1;
};

export const hasInvalidRecurringRange = (
  startValue?: number | string | null,
  endValue?: number | string | null,
  startYear?: number | null,
  endYear?: number | null
): boolean => {
  const hasStart = startValue !== undefined && startValue !== null && startValue !== '';
  const hasEnd = endValue !== undefined && endValue !== null && endValue !== '';

  if (!hasStart || !hasEnd) {
    return false;
  }

  return getPayableMonthCount(startValue, endValue, startYear, endYear) === null;
};

export const calculateTotalFees = ({
  isOneTime,
  monthlyAmount,
  startPayableMonth,
  endPayableMonth,
  startPayableYear,
  endPayableYear,
  fallbackTotal,
}: {
  isOneTime: boolean;
  monthlyAmount?: number;
  startPayableMonth?: number | string | null;
  endPayableMonth?: number | string | null;
  startPayableYear?: number | null;
  endPayableYear?: number | null;
  fallbackTotal?: number;
}): number | null => {
  if (monthlyAmount === undefined || monthlyAmount === null || Number.isNaN(monthlyAmount)) {
    return fallbackTotal ?? null;
  }

  if (isOneTime) {
    return roundToTwo(monthlyAmount);
  }

  const monthCount = getPayableMonthCount(
    startPayableMonth,
    endPayableMonth,
    startPayableYear,
    endPayableYear
  );

  if (monthCount === null) {
    return fallbackTotal ?? null;
  }

  return roundToTwo(monthlyAmount * monthCount);
};
