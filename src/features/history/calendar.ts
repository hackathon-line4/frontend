import { toDateKey } from './date';

export function shiftMonth(month: string, offset: number) {
  const [year, index] = month.split('-').map(Number);
  return toDateKey(new Date(year, index - 1 + offset, 1)).slice(0, 7);
}
export function monthCells(month: string): (string | null)[] {
  const [year, index] = month.split('-').map(Number);
  const leading = new Date(year, index - 1, 1).getDay();
  const count = new Date(year, index, 0).getDate();
  const cells: (string | null)[] = Array(leading).fill(null);
  for (let day = 1; day <= count; day++) cells.push(`${month}-${String(day).padStart(2, '0')}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}
