import { displayValue } from './visualization-data';

const htmlEntities: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
const escapeText = (value: string) => value.replace(/[&<>"']/g, (character) => htmlEntities[character]);

export function percentageDomain(values: number[]) {
  const samples = values.filter(Number.isFinite);
  if (!samples.length) return undefined;
  const lowest = Math.min(...samples);
  const highest = Math.max(...samples);
  const padding = Math.max(5, (highest - lowest) * 0.12);
  const min = Math.floor((lowest - padding) / 5) * 5;
  const max = Math.ceil((highest + padding) / 5) * 5;
  return { min: lowest >= 0 ? Math.max(0, min) : min,
    max: highest <= 100 ? Math.min(100, max) : max };
}

export function academicScatterTooltip(this: { name?: string; x?: number; y?: number | null }) {
  const escaped = escapeText(this.name ?? '');
  return `<b>${escaped}</b><br/>Attendance: ${displayValue(this.x, '%')}<br/>Published score: ${displayValue(this.y, '%')}`;
}

export function academicCountTooltip(this: { name?: string; category?: string | number;
  y?: number | null; series?: { name?: string; type?: string } }) {
  const heading = escapeText(this.name || String(this.category ?? ''));
  const label = escapeText(this.series?.type === 'pie' ? 'Submissions' : this.series?.name ?? 'Count');
  return `<b>${heading}</b><br/>${label}: ${displayValue(this.y)}`;
}

export function dueBucketLabel(key: string, label: string) {
  if (label.toLowerCase() !== key) return label;
  const labels: Record<string, string> = { overdue: 'Overdue', today: 'Due today', upcoming: 'Upcoming' };
  return typeof labels[key] === 'string' ? labels[key] : label;
}
