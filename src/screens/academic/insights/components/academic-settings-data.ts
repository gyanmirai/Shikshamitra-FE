import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { academicSetupSettings } from '../../setup/academic-setup-catalog';

import type { AcademicInsightsLink } from '../academic-insights-catalog';

export type AcademicSettingRow = {
  key: string;
  label: string;
  group: string;
  status: string;
  href?: string;
};

export function getAcademicSettingRows(
  section: AcademicInsightsSection,
  links: AcademicInsightsLink[]
) {
  const entries = new Map(
    section.items.map((item) => [item.id, { key: item.id, label: item.label, status: item.status }])
  );
  section.series.forEach((series) =>
    series.points.forEach((point) => {
      const item = entries.get(point.key);
      if (!item?.status)
        entries.set(point.key, {
          key: point.key,
          label: item?.label ?? point.label,
          status:
            point.status ??
            (point.value === 1 ? 'configured' : point.value === 0 ? 'empty' : 'unavailable'),
        });
    })
  );
  return Array.from(entries.values()).map((entry): AcademicSettingRow => {
    const definition = academicSetupSettings.find((setting) => setting.key === entry.key);
    return {
      ...entry,
      status: entry.status ?? 'unavailable',
      label: definition?.title ?? entry.label,
      group: definition?.stage ?? 'other',
      href: definition ? links.find((link) => link.href === definition.path)?.href : undefined,
    };
  });
}

export function getAcademicSettingsFooterLinks(
  section: AcademicInsightsSection,
  links: AcademicInsightsLink[]
) {
  if (section.status !== 'ready') return links;
  const rowLinks = new Set(getAcademicSettingRows(section, links).map((row) => row.href));
  return links.filter((link) => !rowLinks.has(link.href));
}
