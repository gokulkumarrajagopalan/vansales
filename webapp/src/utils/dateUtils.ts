/**
 * Dynamic ISO date helpers (YYYY-MM-DD) for ERP periods, vouchers, and reports.
 */
export function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayIsoDate(): string {
  return formatIsoDate(new Date());
}

export function getRelativeIsoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatIsoDate(d);
}

export function getMonthBoundsIso(monthOffset = 0): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0);
  return { start: formatIsoDate(start), end: formatIsoDate(end) };
}

export function getFiscalYearBoundsIso(): { start: string; end: string } {
  const now = new Date();
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    start: `${fyStartYear}-04-01`,
    end: `${fyStartYear + 1}-03-31`,
  };
}
